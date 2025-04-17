import type {
	UI2CreatorConfig,
	Intents,
	IntentCall,
	Intent,
	ParsedIntentCall,
	CleanupFunction,
} from "../types";
import debounce, { DebouncedFunction } from "debounce";
import { z } from "zod";
import { flushSync } from "react-dom";
import zodToJsonSchema from "zod-to-json-schema";
import { streamText } from "ai";
import parseIntentCalls from "./parseIntentCall";
import { nanoid } from "nanoid";

export default class IntentCreator {
	private cleanup = new Map<string, () => void>();
	private intents: Intents = {};

	// Any processed intent calls
	private activeIntentCalls: IntentCall<any>[] = [];

	// Ongoing promise for identifying intents
	private intentIdentificationPromise: Promise<void> | null = null;
	private resolveIntentIdentification: (() => void) | null = null;

	// Debounced handler for input
	inputDebounceHandler: DebouncedFunction<(text: string) => void>;

	constructor(
		public config: UI2CreatorConfig,
		public inputValue: string,
		public setInputValue: (val: string) => void,
		public isLoading: boolean,
		public setIsLoading: (val: boolean) => void
	) {
		// Initialize loading state binding
		this.isLoading = isLoading;
		this.setIsLoading = setIsLoading;
		this.inputDebounceHandler = debounce(
			(text: string) => this.identifyIntent(text),
			this.config.debounceDelay
		);
	}

	private createPrompt = (text: string) => {
		// Generate intents section dynamically
		let intentsSection = "# Possible Intents\n";

		Object.entries(this.intents).forEach(([intentName, intent]) => {
			// Add intent name and description
			intentsSection += `## \`${intentName}\`: ${intent.description}\n`;

			// Check if it has parameters (it's a ParameterIntent)
			if ("parameters" in intent) {
				intentsSection += "Parameter Dictionary Format:\n";

				// Convert Zod schema to a string representation
				const paramSchema = intent.parameters;
				let schemaStr = JSON.stringify(zodToJsonSchema(paramSchema), null, 2);

				intentsSection += `${schemaStr}\n`;
			}

			intentsSection += "\n";
		});

		return `You are helping a user identify the intent of their text.

The user gives you the following instructions:
\`\`\`
${this.config.systemPrompt}
\`\`\`

The user gives you the following context:
\`\`\`
${JSON.stringify(this.config.context, null, 2)}
\`\`\`

${intentsSection}
# Output Format
* Return identified intents in the form of JavaScript function calls with the EXACT intent names provided
* Assume all of these functions are already defined
* All functions only take up to one parameter.
* This parameter should only be a JSON object.
* There should never be more than one parameter, or positional parameters.
* You may **only** write JavaScript function calls. You may write no other code.
* You may call multiple intents unless otherwise specified by the user
* If you are unsure, you should only return the single intent \`other()\`

# User Input
${text}`;
	};

	// Flattens intent call without ID
	private flattenIntentCall = (intentCall: ParsedIntentCall | IntentCall) => {
		return JSON.stringify({
			name: intentCall.name,
			parameters: intentCall.parameters,
		});
	};

	private identifyIntent = async (text: string) => {
		if (text == "") {
			for (const [intentId, cleanupFn] of this.cleanup) {
				flushSync(cleanupFn);
				this.cleanup.delete(intentId);
			}
			this.activeIntentCalls = [];
			return;
		}

		// Indicate loading start
		this.setIsLoading(true);

		try {
			const { textStream } = streamText({
				model: this.config.model,
				prompt: this.createPrompt(text),
				temperature: 0,
			});

			let partialOutput = "";
			let processed = 0;

			// Track which intent IDs will remain active
			const intentIDsToKeep = new Set<string>();

			// Queue of new intents to process AFTER cleanup
			const newIntentsQueue: IntentCall[] = [];

			// Current intent calls to use after processing
			const updatedIntentCalls: IntentCall[] = [];
			for await (const textPart of textStream) {
				partialOutput += textPart;
				const partialIntentCalls = parseIntentCalls(
					partialOutput,
					this.intents
				);

				// Process newly detected intent calls
				if (partialIntentCalls.length > processed) {
					for (let i = processed; i < partialIntentCalls.length; i++) {
						const parsedIntent = partialIntentCalls[i];

						// Check if we already have this intent (by exact parameter match)
						const existingIntentIdx = this.activeIntentCalls.findIndex(
							(intent) =>
								this.flattenIntentCall(intent) ===
								this.flattenIntentCall(parsedIntent)
						);

						if (existingIntentIdx >= 0) {
							// Reuse existing intent
							const existingId = this.activeIntentCalls[existingIntentIdx].id;
							intentIDsToKeep.add(existingId);
							updatedIntentCalls.push({
								...parsedIntent,
								id: existingId,
							});
						} else {
							// This is a new intent - generate ID and queue for later processing
							const newId = nanoid();
							newIntentsQueue.push({
								...parsedIntent,
								id: newId,
							});
							updatedIntentCalls.push({
								...parsedIntent,
								id: newId,
							});
						}
					}
					processed = partialIntentCalls.length;
				}
			}

			// Perform all cleanups for intents no longer present
			for (const [intentId, cleanupFn] of this.cleanup) {
				if (!intentIDsToKeep.has(intentId)) {
					flushSync(cleanupFn);
					this.cleanup.delete(intentId);
				}
			}

			// Process new intents
			for (const intentCall of newIntentsQueue) {
				const cleanup = this.onIntentCall(intentCall);
				const globalCleanup = this.config.onIntent(text);
				if (typeof cleanup === "function") {
					this.cleanup.set(intentCall.id, () => {
						cleanup?.();
						if (typeof globalCleanup === "function") {
							globalCleanup?.();
						}
					});
				}
			}

			this.activeIntentCalls = updatedIntentCalls;
		} finally {
			// Finish loading
			this.setIsLoading(false);
			this.resolveIntentIdentification?.();
			this.resolveIntentIdentification = null;
			this.intentIdentificationPromise = null;
		}
	};

	private onIntentCall = (
		intentCall: IntentCall<any>
	): CleanupFunction | void => {
		return (this.intents[intentCall.name] as Intent).onIntent(
			intentCall,
			this.inputValue
		);
	};

	onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		this.setInputValue(newValue);

		// Cancel any pending debounced calls
		if (this.inputDebounceHandler.clear) {
			this.inputDebounceHandler.clear();
		}

		let resolveIdentification: () => void;
		this.intentIdentificationPromise = new Promise<void>((resolve) => {
			resolveIdentification = resolve;
		});
		this.resolveIntentIdentification = resolveIdentification!;

		this.inputDebounceHandler(newValue);
	};

	onSubmit = async () => {
		// Store it locally in case user resets it outside
		const inputValue = this.inputValue;
		this.config.onSubmitStart();

		if (this.intentIdentificationPromise) {
			try {
				await this.intentIdentificationPromise;
			} catch (error) {
				console.error("Error waiting for intent identification:", error);
			}
		}
		this.cleanup.clear();

		for (const intentCall of this.activeIntentCalls) {
			this.intents[intentCall.name].onSubmit(intentCall, inputValue);
		}
		this.config.onSubmitComplete();

		this.activeIntentCalls = [];
	};

	addIntent<T extends z.ZodType>(intentName: string, intent: Intent<T>): this {
		this.intents[intentName] = intent;
		return this;
	}
}
