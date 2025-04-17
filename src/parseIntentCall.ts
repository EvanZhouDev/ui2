import { Intents, ParsedIntentCall } from "../types";
import JSON5 from 'json5';

export default function parseIntentCalls(text: string, intents: Intents) {
	const calls: ParsedIntentCall<any>[] = [];

	// Process line by line
	const lines = text.split("\n");

	for (const line of lines) {
		// Match only function calls that start at the beginning of the line (with optional whitespace)
		const functionCallRegex = /^\s*(\w+)\s*\((.*)\)\s*$/;
		const match = line.match(functionCallRegex);

		if (match) {
			const intentName = match[1];
			const paramString = match[2].trim();

			if (!intents[intentName]) {
				// Check if this intent exists in our registered intents
				if (intentName == "other") {
					console.warn("Catch-all 'other' intent detected.");
				} else {
					console.warn(`Unknown intent: ${intentName}`);
				}

				continue;
			}

			const intent = intents[intentName];

			if (paramString === "") {
				// Call the onIntent handler if this is a regular intent
				if ("parameters" in intent) {
					console.warn(
						`Intent ${intentName} expects parameters but none were provided`
					);
				} else {
					calls.push({ name: intentName, parameters: {} });
				}
			} else {
				try {
					if (paramString.startsWith("{") && paramString.endsWith("}")) {
						console.log(paramString)
						// Parse parameter string to object
						const parsedParams = JSON5.parse(paramString);

						// Only process if this is a parameter intent
						if ("parameters" in intent) {
							try {
								// Validate parameters against the Zod schema
								const validatedParams = intent.parameters.parse(parsedParams);
								calls.push({
									name: intentName,
									parameters: validatedParams,
								});
							} catch (error) {
								console.error(
									`Parameter validation failed for ${intentName}:`,
									error
								);
							}
						} else {
							console.warn(
								`Intent ${intentName} doesn't accept parameters but parameters were provided`
							);
						}
					}
				} catch (parseError) {
					console.error(
						`Failed to parse parameters for ${intentName}:`,
						parseError
					);
				}
			}
		}
	}

	return calls;
}
