import { z } from "zod";
import { JSX } from "react";
import { LanguageModel } from "ai";

export type CleanupFunction = () => void;

export type UI2CreatorConfig = {
	model: LanguageModel;
	systemPrompt: string;
	context:
		| {
				[key: string]: {
					description: string;
					content: any;
				};
		  }
		| undefined;
	debounceDelay: number;
	onIntent: (input?: string) => void | CleanupFunction;
	onSubmitStart: (input?: string) => void;
	onSubmitComplete: (input?: string) => void;
};

export type UI2Config = {
	model: LanguageModel;
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
	ui?: (parameters: z.infer<T> & { id: string }, input?: string) => JSX.Element;
};

export type Intents = {
	[key: string]: Intent<any>;
};
