import { UI2Config, IntentCreatorConfig } from "./types";
import { IntentCreator } from "./intentCreator";

const defaultConfig: Omit<IntentCreatorConfig, "model"> = {
	systemPrompt: "",
	context: {},
	onLoadStart: () => {},
	onLoadEnd: () => {},
	onIntent: () => {},
	onCleanup: () => {},
	onPartialIntent: () => {},
};

export const createUI2 = (config: UI2Config) => {
	return new IntentCreator({ ...defaultConfig, ...config });
};

export { IntentCreator } from "./intentCreator";
export { StatefulIntentCreator } from "./statefulIntentCreator";
export * from "./types";
