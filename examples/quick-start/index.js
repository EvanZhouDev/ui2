import { createUI2 } from "ui2-sdk"
import { createCerebras } from "@ai-sdk/cerebras";
import { z } from "zod";

const cerebras = createCerebras({
	apiKey: "API_KEY",
})

let { identifyIntent } = createUI2({
	model: cerebras("llama-3.3-70b"),
})
	.addIntent("sum", {
		parameters: z.object({
			a: z.number(),
			b: z.number(),
		}),
		description: "Add two numbers together",
		onIntent: (intentCall) => {
			console.log(
				`${intentCall.parameters.a} + ${intentCall.parameters.b} = ${intentCall.parameters.a + intentCall.parameters.b
				}`
			);
		},
	})
	.addIntent("square", {
		parameters: z.object({
			a: z.number(),
		}),
		description: "Squares a number",
		onIntent: (intentCall) => {
			console.log(
				`${intentCall.parameters.a}^2 = ${intentCall.parameters.a * intentCall.parameters.a
				}`
			);
		},
	});

identifyIntent("what is 2+2");
