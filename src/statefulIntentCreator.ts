import {
	IdentifyIntentConfig,
	IntentCreatorConfig,
	IntentCall,
	StatefulIntent,
	StatefulIntentCreatorConfig,
	StatefulIntentPartialOption,
} from "./types";
import { IntentCreator } from "./intentCreator";
import debounce, { DebouncedFunction } from "debounce";
import { z } from "zod";

export class StatefulIntentCreator extends IntentCreator {
	inputDebounceHandler: DebouncedFunction<(text: string) => Promise<void>>;
	private activeIntentCalls: IntentCall<any>[] = [];
	public intents: { [key: string]: StatefulIntent<any> } = {};
	private lastIdentifiedInput: string | null = null;

	private currentIdentificationPromise: Promise<IntentCall<any>[]> | null =
		null;
	private currentIdentificationInput: string | null = null;

	constructor(
		public config: StatefulIntentCreatorConfig,
		public inputValue: string,
		public setInputValue: (value: string) => void,
		public isLoading: boolean,
		public setIsLoading: (value: boolean) => void
	) {
		const {
			debounceDelay,
			onSubmitStart,
			onSubmitEnd,
			...intentCreatorConfig
		} = config;
		super(intentCreatorConfig as IntentCreatorConfig);

		this.inputDebounceHandler = debounce(async (text: string) => {
			// If already loading, don't do anything
			if (
				this.isLoading &&
				this.currentIdentificationInput == text &&
				this.currentIdentificationInput
			) {
				return;
			}

			const debouncePromise = this.identifyIntent(text, {
				currentIntents: [...this.activeIntentCalls],
			});
			this.currentIdentificationPromise = debouncePromise;
			this.currentIdentificationInput = text;
			this.setIsLoading(true);

			try {
				await debouncePromise;
				if (this.currentIdentificationPromise === debouncePromise) {
					this.lastIdentifiedInput = text;
				}
			} catch (e) {
				if (this.currentIdentificationPromise == debouncePromise) {
					this.lastIdentifiedInput = null;
				}
			} finally {
				if (this.currentIdentificationPromise == debouncePromise) {
					this.currentIdentificationInput = null;
					this.currentIdentificationInput = null;
					this.setIsLoading(false);
				}
			}
		}, this.config.debounceDelay ?? 300);
	}

	identifyIntent = async (
		text: string,
		config: IdentifyIntentConfig
	): Promise<IntentCall[]> => {
		try {
			const identifiedIntents = await super.identifyIntent(text, config);
			if (text.trim() == "") {
				this.activeIntentCalls = [];
				return [];
			} else {
				this.activeIntentCalls = identifiedIntents;
				return identifiedIntents;
			}
		} catch (e) {
			console.error("Error identifying intent:", e);
			this.activeIntentCalls = [];
			throw e;
		}
	};

	handleInputChange = (text: string) => {
		this.setInputValue(text);
		if (this.inputDebounceHandler) {
			this.inputDebounceHandler.clear();
		}
		this.lastIdentifiedInput = null;
		this.inputDebounceHandler(text);
	};

	handleSubmit = async () => {
		const currentInputValue = this.inputValue;
		this.config.onSubmitStart?.(currentInputValue);
		if (this.inputDebounceHandler) {
			// Cancel pending debounce calls (directly start new process now)
			this.inputDebounceHandler.clear();
		}
		if (currentInputValue.trim() == "") {
			this.activeIntentCalls = [];
			this.lastIdentifiedInput = null;
			this.config.onSubmitEnd?.(currentInputValue);
			this.setIsLoading(false);
			return;
		}
		let intentsToProcess: IntentCall[] = [];
		// Identification for current input is already happening
		if (
			this.isLoading &&
			this.currentIdentificationPromise &&
			this.currentIdentificationInput === currentInputValue
		) {
			try {
				intentsToProcess = await this.currentIdentificationPromise;
				this.lastIdentifiedInput = currentInputValue;
			} catch (e) {
				console.error(
					"Error awaiting in-progress identification during submit:",
					e
				);
				intentsToProcess = [];
				this.lastIdentifiedInput = null;
			}
		}
		// Not currently loading, and cache is valid (already processed)
		else if (
			this.lastIdentifiedInput === currentInputValue &&
			this.activeIntentCalls.length > 0
		) {
			// Use the last identified intents
			intentsToProcess = [...this.activeIntentCalls];
		}
		// Finally, if nothing is loading and there is no cache, or it's currently loading for a different input than current
		else {
			const onSubmitPromise = this.identifyIntent(currentInputValue, {
				currentIntents: [...this.activeIntentCalls],
			});
			this.currentIdentificationPromise = onSubmitPromise;
			this.currentIdentificationInput = currentInputValue;
			this.setIsLoading(true);

			try {
				intentsToProcess = await onSubmitPromise;
				this.lastIdentifiedInput = currentInputValue;
			} catch (e) {
				intentsToProcess = [];
				this.lastIdentifiedInput = null;
			} finally {
				if (this.currentIdentificationPromise === onSubmitPromise) {
					this.currentIdentificationInput = null;
					this.currentIdentificationPromise = null;
					this.setIsLoading(false);
				}
			}
		}

		// After ensuring processing has happened (or cache is valid)
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

		this.config.onSubmitEnd?.(currentInputValue);
		this.activeIntentCalls = [];
		this.lastIdentifiedInput = null;
	};

	addIntent<T extends z.ZodType>(
		intentName: string,
		intent: StatefulIntentPartialOption<T>
	): this {
		let completeIntent: StatefulIntent<T> = {
			onCleanup: () => {},
			onSubmit: () => {},
			description: "",
			...intent,
		};
		this.intents[intentName] = completeIntent;
		return this;
	}
}
