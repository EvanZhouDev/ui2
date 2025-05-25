import { Todo } from "../types";
import TodoItem from "./TodoItem";
import EmptyState from "./EmptyState";

export default function TodoList({
	todos,
	setTodos,
}: {
	todos: Todo[];
	setTodos: (todos: ((prev: Todo[]) => Todo[]) | Todo[]) => void;
}) {
	// If there are no todos, display the empty state
	if (todos.length === 0) {
		return <EmptyState />;
	}

	return (
		<div className="flex flex-col">
			{todos.map((todo) => (
				<TodoItem key={todo.id} todo={todo} setTodos={setTodos} />
			))}
		</div>
	);
}
