import { z } from "zod";
import { JSX } from "react";
import { LanguageModel } from "ai";

export type CleanupFunction = () => void;

export type UI2CreatorConfig = {
	model:
		| LanguageModel
		| {
				baseURL: string;
				apiKey: string;
				modelId: string;
		  };
	systemPrompt: string;
	context: object;
	debounceDelay: number;
	onIntent: (input?: string) => void | CleanupFunction;
	onSubmitStart: (input?: string) => void;
	onSubmitComplete: (input?: string) => void;
};

export type UI2Config = {
	model:
		| LanguageModel
		| {
				baseURL: string;
				apiKey: string;
				modelId: string;
		  };
} & Partial<Omit<UI2CreatorConfig, "model">>;

export type ParsedIntentCall<T extends z.ZodType = z.ZodObject<any>> = {
	name: string;
	parameters: z.infer<T>;
};

export type IntentCall<T extends z.ZodType = z.ZodObject<any>> = {
	id: string;
	name: string;
	parameters: z.infer<T>;
};

export type Intent<T extends z.ZodType = z.ZodObject<any>> = {
	parameters: T;
	description: string;
	onIntent: (
		intentCall: IntentCall<T>,
		input?: string
	) => void | CleanupFunction;
	onSubmit: (intentCall: IntentCall<T>, input?: string) => void;
};

export type Intents = {
	[key: string]: Intent<any>;
};
