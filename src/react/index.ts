import { UI2ReactConfig } from "./types";
import { StatefulIntentCreator } from "../statefulIntentCreator";
import { StatefulIntentCreatorConfig } from "../types";
import { useState, useEffect, useRef } from "react";
export let useUI2 = (config: UI2ReactConfig) => {
	const [inputVal, setInputVal] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const defaultConfig: Omit<StatefulIntentCreatorConfig, "model"> = {
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
	const instanceRef = useRef<StatefulIntentCreator | null>(null);
	if (!instanceRef.current) {
		instanceRef.current = new StatefulIntentCreator(
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
