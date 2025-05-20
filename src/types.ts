import { LanguageModel } from "ai";
import { z } from "zod";

export type IntentCreatorConfig = {
	model:
		| LanguageModel
		| {
				baseURL: string;
				apiKey: string;
				modelId: string;
		  };
	systemPrompt: string;
	context: object;
	onPartialIntent: (partialIntents: IntentCall[]) => void;
	onLoadStart: () => void;
	onLoadEnd: () => void;
	onIntent: (intentCall: IntentCall, input?: string) => void;
	onCleanup: (intentCall: IntentCall, input?: string) => void;
};

export type UI2Config = {
	model:
		| LanguageModel
		| {
				baseURL: string;
				apiKey: string;
				modelId: string;
		  };
} & Partial<Omit<IntentCreatorConfig, "model">>;

export type Intent<T extends z.ZodType = z.ZodObject<any>> = {
	parameters: T;
	description: string;
	onIntent: (intentCall: IntentCall<T>, input?: string) => void;
	onCleanup: (intentCall: IntentCall<T>, input?: string) => void;
};

export type OtherIntent = {
	description?: string;
	onIntent?: (intentCall: IntentCall, input?: string) => void;
	onCleanup?: (intentCall: IntentCall, input?: string) => void;
};

export type Intents = {
	[key: string]: Intent<z.ZodType> & {
		[key: string]: any;
	};
};

export type IntentCall<T extends z.ZodType = z.ZodObject<any>> = {
	name: string;
	id: string;
	parameters: z.infer<T>;
};

export type IdentifyIntentConfig = {
	currentIntents: IntentCall[];
};

export type StatefulIntentCreatorConfig =
	| IntentCreatorConfig & {
			debounceDelay?: number;
			onSubmitStart?: (input?: string) => void;
			onSubmitComplete?: (input?: string) => void;
	  };

export type StatefulIntent<T extends z.ZodType = z.ZodObject<any>> =
	Intent<T> & {
		onSubmit: (intentCall: IntentCall, input?: string) => void;
	};
