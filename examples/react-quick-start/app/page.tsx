"use client";
import { useUI2 } from "ui2-sdk/react";
import { createCerebras } from "@ai-sdk/cerebras";
import { useState } from "react";
import { z } from "zod";

export default function Page() {
	const [todos, setTodos] = useState<
		{
			id: string;
			name: string;
			completed: boolean;
			preview: boolean;
		}[]
	>([]);

	let cerebras = createCerebras({
		apiKey: "API_KEY",
	});

	let { inputValue, handleInputChange, handleSubmit } = useUI2({
		model: cerebras("llama-3.3-70b"),
		systemPrompt: "This is a todo app.",
		context: todos.filter((x) => !x.preview),
	})
		.addIntent("addTodo", {
			description: "Add a todo",
			parameters: z.object({
				name: z.string(),
			}),
			onIntent: ({ parameters, id }) => {
				setTodos((prev) => [
					...prev,
					{
						id,
						name: parameters.name,
						completed: false,
						preview: true,
					},
				]);
			},
			onCleanup: ({ parameters, id }) => {
				setTodos((prev) => prev.filter((x) => x.id !== id));
			},
			onSubmit: ({ id }) =>
				setTodos((prev) =>
					prev.map((x) => (x.id === id ? { ...x, preview: false } : x))
				),
		})
		.addIntent("completeTodo", {
			description: "complete a todo",
			parameters: z.object({
				id: z.string(),
			}),
			onIntent: ({ parameters }) => {
				setTodos((prev) =>
					prev.map((x) =>
						x.id === parameters.id
							? { ...x, preview: true, completed: true }
							: x
					)
				);
			},
			onCleanup: ({ parameters }) => {
				setTodos((prev) =>
					prev.map((x) =>
						x.id === parameters.id
							? { ...x, preview: false, completed: false }
							: x
					)
				);
			},
			onSubmit: ({ parameters }) =>
				setTodos((prev) =>
					prev.map((x) =>
						x.id === parameters.id
							? { ...x, preview: false, completed: true }
							: x
					)
				),
		});

	return (
		<div className="w-screen h-screen flex flex-col items-center justify-between p-4">
			{todos.length
				? todos.map((x) => (
						<div key={x.id} className={x.preview ? "opacity-50" : ""}>
							{x.name} - {x.completed ? "Completed" : "Todo"}
						</div>
				  ))
				: "No todos"}
			<div className="flex flex-row gap-2">
				<input
					className="p-1 outline"
					value={inputValue}
					onChange={(e) => handleInputChange(e.target.value)}
				/>
				<button className="p-1 outline" onClick={handleSubmit}>
					Submit
				</button>
			</div>
		</div>
	);
}
