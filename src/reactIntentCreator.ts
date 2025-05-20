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
	private lastIdentifiedInput: string | null = null;

	// Track the currently active intent identification promise and its input
	private currentIdentificationPromise: Promise<IntentCall[]> | null = null;
	private currentIdentificationInput: string | null = null;

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
				// If an identification for this exact text is already running (e.g., from onSubmit or another debounce),
				// and it's the one tracked by currentIdentificationPromise, don't start a new one.
				if (
					this.isLoading &&
					this.currentIdentificationInput === text &&
					this.currentIdentificationPromise
				) {
					console.log(
						"Debounce: Identification for this text already in progress. Skipping."
					);
					// Optionally, could await this.currentIdentificationPromise here if the debouncer
					// should also update based on its result, but for now, just skipping is simpler.
					return;
				}

				const debouncePromise = this.identifyIntent(text, {
					currentIntents: [...this.activeIntentCalls], // Pass a copy for safety
				});
				this.currentIdentificationPromise = debouncePromise;
				this.currentIdentificationInput = text;
				this.setIsLoading(true);

				try {
					await debouncePromise;
					// identifyIntent (the override) has updated this.activeIntentCalls.
					// Only update lastIdentifiedInput if this promise is still the "current" one for this input.
					// This guards against race conditions if another call (e.g., onSubmit) started for the same input.
					if (this.currentIdentificationPromise === debouncePromise) {
						this.lastIdentifiedInput = text;
					}
				} catch (error) {
					console.error(
						"Error during debounced intent identification:",
						error
					);
					if (this.currentIdentificationPromise === debouncePromise) {
						this.lastIdentifiedInput = null; // Invalidate cache for this input
					}
				} finally {
					// Only clear the promise and loading state if this debounced call's promise
					// is still the one being tracked.
					if (this.currentIdentificationPromise === debouncePromise) {
						this.currentIdentificationPromise = null;
						this.currentIdentificationInput = null;
						this.setIsLoading(false);
					}
				}
			},
			this.config.debounceDelay ?? 300
		);
	}

	// Override to ensure this.activeIntentCalls is updated
	identifyIntent = async (
		text: string,
		config: IdentifyIntentConfig
	): Promise<IntentCall[]> => {
		try {
			// Use config.currentIntents directly as super.identifyIntent expects it.
			// The caller (debounce or onSubmit) should pass the correct currentIntents.
			const identifiedIntents = await super.identifyIntent(text, config);
			this.activeIntentCalls = identifiedIntents; // Update shared state
			return identifiedIntents;
		} catch (e) {
			console.error(
				"Error in super.identifyIntent (called from ReactIntentCreator):",
				e
			);
			this.activeIntentCalls = []; // Clear active intents on error
			throw e; // Re-throw for the caller to handle
		}
	};

	onInputChange = (text: string) => {
		this.setInputValue(text);
		if (this.inputDebounceHandler) {
			this.inputDebounceHandler.clear();
		}
		// Input has changed, so any previous identification cache is stale.
		this.lastIdentifiedInput = null;
		// We don't clear currentIdentificationPromise here, as onSubmit might want to await it
		// if the user submits the input that promise is for.
		this.inputDebounceHandler(text);
	};

	onSubmit = async () => {
		const currentInputValue = this.inputValue;
		this.config.onSubmitStart?.(currentInputValue);

		if (this.inputDebounceHandler) {
			this.inputDebounceHandler.clear(); // Cancel any pending scheduled debounced calls
		}

		if (currentInputValue.trim() === "") {
			this.activeIntentCalls = [];
			this.lastIdentifiedInput = null;
			this.config.onSubmitComplete?.(currentInputValue);
			this.setIsLoading(false);
			return;
		}

		let intentsToProcess: IntentCall[] = [];

		// Case 1: An identification for the current input is ALREADY running.
		if (
			this.isLoading &&
			this.currentIdentificationPromise &&
			this.currentIdentificationInput === currentInputValue
		) {
			console.log(
				"onSubmit: Awaiting in-progress identification for:",
				currentInputValue
			);
			// isLoading is already true, managed by the original caller of currentIdentificationPromise
			try {
				intentsToProcess = await this.currentIdentificationPromise;
				// The promise, when resolved, means identifyIntent updated this.activeIntentCalls.
				this.lastIdentifiedInput = currentInputValue; // Cache is now valid for this input.
			} catch (error) {
				console.error(
					"Error awaiting in-progress identification during submit:",
					error
				);
				intentsToProcess = [];
				this.lastIdentifiedInput = null;
			}
			// The original caller of currentIdentificationPromise is responsible for its cleanup
			// (nullifying it and setting isLoading to false).
		}
		// Case 2: Not currently loading (or loading for different input), but cache is valid.
		else if (
			this.lastIdentifiedInput === currentInputValue &&
			this.activeIntentCalls.length > 0
		) {
			console.log(
				"onSubmit: Using cached intents for:",
				currentInputValue
			);
			intentsToProcess = [...this.activeIntentCalls]; // Use a copy
		}
		// Case 3: Need to start a new identification.
		// (Not loading and cache miss, OR loading but for a different input than current).
		else {
			console.log(
				"onSubmit: Starting new identification for:",
				currentInputValue
			);
			const onSubmitPromise = this.identifyIntent(currentInputValue, {
				currentIntents: [...this.activeIntentCalls], // Pass current state for cleanup logic
			});
			this.currentIdentificationPromise = onSubmitPromise;
			this.currentIdentificationInput = currentInputValue;
			this.setIsLoading(true);

			try {
				intentsToProcess = await onSubmitPromise;
				// identifyIntent (override) updated this.activeIntentCalls.
				this.lastIdentifiedInput = currentInputValue; // Cache is now valid.
			} catch (error) {
				console.error(
					"Error during onSubmit intent identification:",
					error
				);
				intentsToProcess = [];
				this.lastIdentifiedInput = null; // Invalidate cache.
			} finally {
				// Only nullify the promise and reset loading if this onSubmit's promise
				// is still the one being tracked.
				if (this.currentIdentificationPromise === onSubmitPromise) {
					this.currentIdentificationPromise = null;
					this.currentIdentificationInput = null;
					this.setIsLoading(false);
				}
			}
		}

		// Process the identified intents
		for (const intentCall of intentsToProcess) {
			if (
				this.intents[intentCall.name] &&
				typeof this.intents[intentCall.name].onSubmit === "function"
			) {
				this.intents[intentCall.name].onSubmit(
					intentCall,
					currentInputValue
				);
			} else if (
				intentCall.name === "other" &&
				this.intents["other"] &&
				typeof this.intents["other"].onSubmit === "function"
			) {
				this.intents["other"].onSubmit(intentCall, currentInputValue);
			}
		}

		// Call onSubmitComplete and clear states for the next cycle
		this.config.onSubmitComplete?.(currentInputValue);
		this.activeIntentCalls = []; // Reset for the next identification's cleanup context
		this.lastIdentifiedInput = null; // Reset cache state
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
