import {
	IdentifyIntentConfig,
	IntentCreator,
	IntentCreatorConfig,
	IntentCall,
	Intent,
} from "./intentCreator";
import { LanguageModel } from "ai";
import React, { useState, useRef, useEffect } from "react";
import debounce, { DebouncedFunction } from "debounce";
import { z, ZodType, ZodTypeDef } from "zod";

type ReactIntentCreatorConfig =
	| IntentCreatorConfig & {
			debounceDelay?: number;
			onSubmitStart?: (input?: string) => void;
			onSubmitComplete?: (input?: string) => void;
	  };

type ReactIntent<T extends ZodType<any, ZodTypeDef, any>> = Intent<T> & {
	onSubmit: (intentCall: IntentCall, input?: string) => void;
};

export type UI2ReactConfig = {
	model:
		| LanguageModel
		| {
				baseURL: string;
				apiKey: string;
				modelId: string;
		  };
} & Partial<Omit<ReactIntentCreatorConfig, "model">>;

export class ReactIntentCreator extends IntentCreator {
	inputDebounceHandler: DebouncedFunction<(text: string) => Promise<void>>;
	private activeIntentCalls: IntentCall<any>[] = [];
	public intents: { [key: string]: ReactIntent<any> } = {};
	private lastIdentifiedInput: string | null = null; // ADDED: Tracks the input for which activeIntentCalls is valid

	constructor(
		public config: ReactIntentCreatorConfig,
		public inputValue: string,
		public setInputValue: (val: string) => void,
		public isLoading: boolean,
		public setIsLoading: (val: boolean) => void
	) {
		const {
			debounceDelay,
			onSubmitStart,
			onSubmitComplete,
			...intentCreatorConfig
		} = config;
		super(intentCreatorConfig as IntentCreatorConfig);
		this.inputDebounceHandler = debounce(
			async (text: string) => {
				try {
					this.setIsLoading(true);
					// This call will update this.activeIntentCalls via the overridden identifyIntent
					await this.identifyIntent(text, {
						currentIntents: this.activeIntentCalls, // Pass current active for cleanup
					});
					// If identifyIntent was successful, this.activeIntentCalls is now for 'text'.
					this.lastIdentifiedInput = text;
				} catch (error) {
					console.error("Error during debounced intent identification:", error);
					// On error, identifyIntent itself will set lastIdentifiedInput to null.
				} finally {
					this.setIsLoading(false);
				}
			},
			this.config.debounceDelay ?? 300
		);
	}

	identifyIntent = async (text: string, config: IdentifyIntentConfig) => {
		// Callers (debounced function or onSubmit) are responsible for setIsLoading.
		try {
			const identifiedIntents = await super.identifyIntent(text, config);
			this.activeIntentCalls = identifiedIntents; // Update active calls with the new result
			console.log("ReactIntentCreator.identifyIntent updated activeIntentCalls:", this.activeIntentCalls);
			// The caller (debounce handler or onSubmit) will set lastIdentifiedInput upon successful completion of *their* operation.
			return identifiedIntents;
		} catch (e) {
			console.error("Error in super.identifyIntent, called from ReactIntentCreator.identifyIntent:", e);
			this.activeIntentCalls = []; // Clear active intents on error
			this.lastIdentifiedInput = null; // Invalidate last identified input on error
			throw e;
		}
	};

	onInputChange = (text: string) => {
		this.setInputValue(text);
		if (this.inputDebounceHandler) {
			this.inputDebounceHandler.clear();
		}
		// Input has changed, so any previous identification is now stale for the onSubmit optimization.
		this.lastIdentifiedInput = null;
		this.inputDebounceHandler(text);
	};

	onSubmit = async () => {
		const currentInputValue = this.inputValue;
		this.config.onSubmitStart?.(currentInputValue);

		if (this.inputDebounceHandler) {
			this.inputDebounceHandler.clear(); // Cancel any pending debounced calls
		}

		if (currentInputValue.trim() === "") {
			this.activeIntentCalls = [];
			this.lastIdentifiedInput = null; // Reset
			this.config.onSubmitComplete?.(currentInputValue);
			this.setIsLoading(false); // Ensure loading is false on early return
			return;
		}

		let intentsToProcess: IntentCall[] = [];

		// Check if the current input value was the last one successfully identified
		// and activeIntentCalls is populated (meaning the debounced call likely completed for this input)
		if (this.lastIdentifiedInput === currentInputValue && this.activeIntentCalls.length > 0) {
			console.log("onSubmit: Using previously identified intents for:", currentInputValue);
			intentsToProcess = [...this.activeIntentCalls]; // Use a copy
			// No setIsLoading here, as the operation was already done by the debounced call.
		} else {
			console.log("onSubmit: Re-identifying intents for:", currentInputValue);
			try {
				this.setIsLoading(true);
				// Perform new identification. identifyIntent updates this.activeIntentCalls.
				intentsToProcess = await this.identifyIntent(currentInputValue, {
					currentIntents: this.activeIntentCalls, // Pass current for cleanup logic
				});
				// If successful, this.activeIntentCalls is now for currentInputValue
				this.lastIdentifiedInput = currentInputValue;
			} catch (error) {
				console.error("Error during onSubmit intent identification:", error);
				intentsToProcess = []; // Ensure empty on error
				// identifyIntent would have set lastIdentifiedInput to null on error.
			} finally {
				this.setIsLoading(false);
			}
		}

		// 3. Process the identified intents
		for (const intentCall of intentsToProcess) {
			if (this.intents[intentCall.name] && typeof this.intents[intentCall.name].onSubmit === 'function') {
				this.intents[intentCall.name].onSubmit(intentCall, currentInputValue);
			} else if (intentCall.name === 'other' && this.intents['other'] && typeof this.intents['other'].onSubmit === 'function') {
				 this.intents['other'].onSubmit(intentCall, currentInputValue);
			}
		}

		// 4. Call onSubmitComplete and clear states for the next cycle
		this.config.onSubmitComplete?.(currentInputValue);
		this.activeIntentCalls = [];
		this.lastIdentifiedInput = null; // Reset for the next full input cycle
	};

	addIntent<T extends z.ZodType>(
		intentName: string,
		intent: ReactIntent<T>
	): this {
		this.intents[intentName] = intent;
		return this;
	}
}

export let useUI2 = (config: UI2ReactConfig) => {
	const [inputVal, setInputVal] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const defaultConfig: Omit<ReactIntentCreatorConfig, "model"> = {
		systemPrompt: "",
		context: {},
		debounceDelay: 300,
		onIntent: () => {},
		onSubmitStart: () => {
			setInputVal("");
		},
		onSubmitComplete: () => {},
		onPartialIntent: () => {},
		onLoadStart: () => {},
		onLoadEnd: () => {},
		onCleanup: () => {},
	};
	const instanceRef = useRef<ReactIntentCreator | null>(null);
	if (!instanceRef.current) {
		instanceRef.current = new ReactIntentCreator(
			{
				...defaultConfig,
				...config,
			},
			inputVal,
			setInputVal,
			isLoading,
			setIsLoading
		);
	} else {
		// Keep the state values up to date
		instanceRef.current.inputValue = inputVal;
		instanceRef.current.setInputValue = setInputVal;
		instanceRef.current.isLoading = isLoading;
		instanceRef.current.setIsLoading = setIsLoading;
	}

	useEffect(() => {
		if (instanceRef.current) {
			instanceRef.current.config.context = config.context;
		}
	}, [config.context]);

	useEffect(() => {
		return () => {
			if (instanceRef.current?.inputDebounceHandler.clear) {
				instanceRef.current?.inputDebounceHandler.clear();
			}
		};
	}, []);

	return instanceRef.current;
};
