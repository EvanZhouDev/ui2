import {
	IdentifyIntentConfig,
	IntentCreator,
	IntentCreatorConfig,
	IntentCall,
	Intent,
} from "./intentCreator";
import { LanguageModel } from "ai";
import React, { useState, useRef, useEffect } from "react";
import debounce, { DebouncedFunction } from "debounce";
import { z, ZodType, ZodTypeDef } from "zod";

type ReactIntentCreatorConfig =
	| IntentCreatorConfig & {
			debounceDelay?: number;
			onSubmitStart?: (input?: string) => void;
			onSubmitComplete?: (input?: string) => void;
	  };

type ReactIntent<T extends ZodType<any, ZodTypeDef, any>> = Intent<T> & {
	onSubmit: (intentCall: IntentCall, input?: string) => void;
};

export type UI2ReactConfig = {
	model:
		| LanguageModel
		| {
				baseURL: string;
				apiKey: string;
				modelId: string;
		  };
} & Partial<Omit<ReactIntentCreatorConfig, "model">>;

export class ReactIntentCreator extends IntentCreator {
	private intentIdentificationPromise: Promise<void> | null = null;
	private resolveIntentIdentification: (() => void) | null = null;
	inputDebounceHandler: DebouncedFunction<(text: string) => void>;
	private activeIntentCalls: IntentCall<any>[] = [];
	public intents: { [key: string]: ReactIntent<any> } = {};

	constructor(
		public config: ReactIntentCreatorConfig,
		public inputValue: string,
		public setInputValue: (val: string) => void,
		public isLoading: boolean,
		public setIsLoading: (val: boolean) => void
	) {
		const {
			debounceDelay,
			onSubmitStart,
			onSubmitComplete,
			...intentCreatorConfig
		} = config;
		super(intentCreatorConfig as IntentCreatorConfig);
		this.inputDebounceHandler = debounce(
			(text: string) =>
				this.identifyIntent(text, {
					currentIntents: this.activeIntentCalls,
				}),
			this.config.debounceDelay
		);
	}

	identifyIntent = async (text: string, config: IdentifyIntentConfig) => {
		try {
			this.setIsLoading(true);
			this.activeIntentCalls = await super.identifyIntent(text, config);
			console.log(this.activeIntentCalls, "AHHH");
		} finally {
			this.setIsLoading(false);
			this.resolveIntentIdentification?.();
			this.resolveIntentIdentification = null;
			this.intentIdentificationPromise = null;
		}
		return this.activeIntentCalls;
	};

	onInputChange = (text: string) => {
		this.setInputValue(text);
		if (this.inputDebounceHandler) {
			this.inputDebounceHandler.clear();
		}
		let resolveIdentification: () => void;
		this.intentIdentificationPromise = new Promise<void>((resolve) => {
			resolveIdentification = resolve;
		});
		this.resolveIntentIdentification = resolveIdentification!;

		this.inputDebounceHandler(text);
	};

	onSubmit = async () => {
		const inputValue = this.inputValue;

		this.config.onSubmitStart();
		console.log(this.intentIdentificationPromise);
		if (this.intentIdentificationPromise) {
			try {
				await this.intentIdentificationPromise;
			} catch (error) {
				console.error("Error waiting for intent identification:", error);
			}
		}
		for (const intentCall of this.activeIntentCalls) {
			console.log(this.activeIntentCalls);
			this.intents[intentCall.name].onSubmit(intentCall, inputValue);
		}
		this.activeIntentCalls = [];
	};

	addIntent<T extends z.ZodType>(
		intentName: string,
		intent: ReactIntent<T>
	): this {
		this.intents[intentName] = intent;
		return this;
	}
}

export let useUI2 = (config: UI2ReactConfig) => {
	const [inputVal, setInputVal] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const defaultConfig: Omit<ReactIntentCreatorConfig, "model"> = {
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
	const instanceRef = useRef<ReactIntentCreator | null>(null);
	if (!instanceRef.current) {
		instanceRef.current = new ReactIntentCreator(
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
