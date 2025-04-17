import { Intents, ParsedIntentCall } from "../types";

// Add helper to turn loose object literals into valid JSON
function normalizeParamString(str: string): string {
	return (
		str
			// wrap unquoted keys: {hi:…} → {"hi":…}
			.replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":')
			// convert single‑quoted values: {'hi': 'bye'} → {"hi": "bye"}
			.replace(/'([^']*)'/g, '"$1"')
	);
}

export default function parseIntentCalls(text: string, intents: Intents) {
	console.log(text);
	const calls: ParsedIntentCall<any>[] = [];
	const cleanedOutput = text.replace(/```python|```/g, "").trim();

	const functionCallRegex = /(\w+)\(([^)]*)\)/g;
	let match;

	while ((match = functionCallRegex.exec(cleanedOutput)) !== null) {
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
				// Parse parameter string to object
				const normalized = normalizeParamString(paramString);
				const parsedParams = JSON.parse(normalized);

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
			} catch (parseError) {
				console.error(
					`Failed to parse parameters for ${intentName}:`,
					parseError
				);
			}
		}
	}

	return calls;
}
