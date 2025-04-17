import { useState, useRef, useEffect } from "react";
import { UI2Config, UI2CreatorConfig } from "./types";
import IntentCreator from "./src/intentCreator";

let useUI2 = (config: UI2Config) => {
	// Default configuration values
	const defaultConfig: Omit<UI2CreatorConfig, "model"> = {
		systemPrompt: "",
		context: {},
		debounceDelay: 300,
		onIntent: () => {},
		onSubmitStart: () => {
			setInputVal("")
		},
		onSubmitComplete: () => {},
	};

	const [inputVal, setInputVal] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// Use useRef to maintain a stable reference to the instance
	const instanceRef = useRef<IntentCreator | null>(null);

	if (!instanceRef.current) {
		instanceRef.current = new IntentCreator(
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

	// Update context when it changes
	useEffect(() => {
		if (instanceRef.current) {
			instanceRef.current.config.context = config.context;
		}
	}, [config.context]);

	// Clean up the debounce on unmount
	useEffect(() => {
		return () => {
			if (instanceRef.current?.inputDebounceHandler.clear) {
				instanceRef.current?.inputDebounceHandler.clear();
			}
		};
	}, []);

	return instanceRef.current;
};

export default useUI2;
