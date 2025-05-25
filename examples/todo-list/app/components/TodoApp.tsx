"use client";
import { useState } from "react";
import TodoList from "./TodoList";
import UI2Input from "./UI2Input";
import useTodoListUI2 from "../useTodoListUI2";
import { createCerebras } from "@ai-sdk/cerebras";
import { type Todo } from "../types";

export default function TodoApp() {
	const [todos, setTodos] = useState<Todo[]>([]);

	const cerebras = createCerebras({
		apiKey: "API_KEY",
	});

	const { inputValue, handleInputChange, handleSubmit } = useTodoListUI2(
		cerebras("llama-3.3-70b"),
		todos,
		setTodos
	);

	return (
		<div className="p-6 max-w-4xl mx-auto h-[100vh] flex flex-col justify-between">
			<TodoList todos={todos} setTodos={setTodos} />
			<UI2Input
				value={inputValue}
				onChange={(e) => handleInputChange(e.target.value)}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
