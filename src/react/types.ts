import { LanguageModel } from "ai";
import { StatefulIntentCreatorConfig } from "../types";

export type UI2ReactConfig = {
	model:
		| LanguageModel
		| {
				baseURL: string;
				apiKey: string;
				modelId: string;
		  };
} & Partial<Omit<StatefulIntentCreatorConfig, "model">>;
