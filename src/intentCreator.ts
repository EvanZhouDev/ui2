import { LanguageModel, streamObject } from "ai";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import zodToJsonSchema from "zod-to-json-schema";
import {
	IntentCreatorConfig,
	Intent,
	Intents,
	IntentCall,
	IdentifyIntentConfig,
} from "./types";
export class IntentCreator {
	public intents: Intents = {};

	constructor(public config: IntentCreatorConfig) {
		this.identifyIntent = this.identifyIntent.bind(this);
	}

	private createPrompt = (text: string) => {
		let intentsSection = "# Intent Descriptions\n";

		Object.entries(this.intents).forEach(([intentName, intent]) => {
			// Add intent name and description
			intentsSection += `## \`${intentName}\`: ${intent.description}\n`;

			// Check if it has parameters (it's a ParameterIntent)
			if ("parameters" in intent) {
				intentsSection += "Parameter Schema and Description:\n";

				// Convert Zod schema to a string representation
				const paramSchema = intent.parameters;
				let schemaStr = JSON.stringify(zodToJsonSchema(paramSchema), null, 2);

				intentsSection += `${schemaStr}\n`;
			}

			intentsSection += "\n";
		});

		return `
Your goal is to translate the user text into as many **Intents** as possible.

Each of these **Intents** take the form of an action, and it is your goal to convert the user's input into these actions.

${
	this.config.systemPrompt &&
	`The user gives you the following instructions:
\`\`\`
${this.config.systemPrompt}
\`\`\``
}

${
	this.config.context &&
	`The user gives you the following context:
\`\`\`
${JSON.stringify(this.config.context, null, 2)}
\`\`\``
}

# Intent Descriptions

Here is the schema for the parameters, as well as descriptions for some parameters that you should use to guide your decisions.

${intentsSection}

# Output Format

* You will return an array of objects with two properties:
		* \`name\` of the intent
		* \`parameters\` of the intent
* Follow the given schema when returning the intents
* You may and should return multiple intents when the user's command includes multiple actions
* You should always return an intent, if not more
* Only if you are completely unsure, you should return a length-1 array with one intent with name \`other\` and blank parameters, but use this sparingly.

# User Input
${text}`;
	};

	// Allows IntentCalls to be compared
	private flattenIntentCall = (intentCall: IntentCall) => {
		return JSON.stringify({
			name: intentCall.name,
			parameters: intentCall.parameters,
		});
	};

	async identifyIntent(text: string, config: IdentifyIntentConfig) {
		console.log(text, config);
		let model: LanguageModel;
		if ("specificationVersion" in this.config.model) {
			model = this.config.model as LanguageModel;
		} else {
			model = createOpenAI({
				// custom settings, e.g.
				apiKey: this.config.model.apiKey,
				baseURL: this.config.model.baseURL,
			})(this.config.model.modelId);
		}

		// Create a discriminated union schema with each intent having its literal name
		const intentSchemas = Object.entries(this.intents).map(([name, intent]) =>
			z.object({
				name: z.literal(name),
				parameters: intent.parameters,
			})
		);

		// Add the "other" intent schema
		const otherSchema = z.object({
			name: z.literal("other"),
			parameters: z.object({}),
		});

		// Create a union of all intent schemas
		const intentSchema =
			intentSchemas.length > 0
				? z.union([...intentSchemas, otherSchema] as unknown as [
						z.ZodTypeAny,
						z.ZodTypeAny,
						...z.ZodTypeAny[]
				  ])
				: otherSchema;

		this.config.onLoadStart();
		const { partialObjectStream, object } = streamObject({
			model,
			schema: z.array(intentSchema),
			output: "object",
			mode: "json",
			// temperature: 1,
			prompt: this.createPrompt(text),
			onError: (error) => {
				console.error("Error:", error);
			},
		});

		const calledIntentIds = new Set<string>();
		const remainingCurrentIntents = structuredClone(config.currentIntents);
		const callIntents = [];

		const processIntentCall = (intentCall: IntentCall<any>) => {
			if (intentCall.name !== "other") {
				const existingIntentCallIdx = remainingCurrentIntents.findIndex(
					(existingIntentCall) =>
						this.flattenIntentCall(existingIntentCall) ===
						this.flattenIntentCall(intentCall)
				);
				if (existingIntentCallIdx != -1) {
					const existingIntentCall =
						remainingCurrentIntents[existingIntentCallIdx];
					calledIntentIds.add(existingIntentCall.id);
					// Remove the intent call, so that it can't be matched again
					remainingCurrentIntents.splice(existingIntentCallIdx, 1);
					return existingIntentCall;
				} else {
					// Add new intent call
					intentCall.id = crypto.randomUUID();
					callIntents.push(() => {
						this.intents[intentCall.name].onIntent(intentCall, text);
						this.config.onIntent(intentCall, text);
					});
					return intentCall;
				}
			} else {
				if (this.intents["other"]) {
					callIntents.push(() => {
						this.intents["other"].onIntent(intentCall, text);
						this.config.onIntent(intentCall, text);
					});
				} else {
					console.warn("No `other` intent handler found.");
				}
				return intentCall;
			}
		};

		let activeIntentCalls: IntentCall[] = [];

		let processedIdx = 0;
		for await (const partialObject of partialObjectStream) {
			this.config.onPartialIntent(partialObject);
			if (partialObject.length > processedIdx + 1) {
				// Never process the latest element, since you don't know if it is complete
				for (; processedIdx < partialObject.length - 1; processedIdx++) {
					const call = processIntentCall(partialObject[processedIdx]);
					if (call.name !== "other") {
						activeIntentCalls.push(call);
					}
				}
			}
		}
		const finalToolCalls = await object;
		this.config.onLoadEnd();
		for (; processedIdx < finalToolCalls.length; processedIdx++) {
			const call = processIntentCall(finalToolCalls[processedIdx]);
			if (call.name !== "other") {
				activeIntentCalls.push(call);
			}
		}
		for (const curIntents of config.currentIntents) {
			if (!calledIntentIds.has(curIntents.id)) {
				// Clean up the unused intents
				this.intents[curIntents.name].onCleanup(curIntents, text);
				this.config.onCleanup(curIntents, text);
			}
		}

		// Cache all intent calls to occur after cleanup
		for (const callIntent of callIntents) {
			callIntent();
		}
		return activeIntentCalls;
	}

	addIntent<T extends z.ZodType>(intentName: string, intent: Intent<T>): this {
		this.intents[intentName] = intent;
		return this;
	}

	// TODO: Add method to supply the "other" intent
}