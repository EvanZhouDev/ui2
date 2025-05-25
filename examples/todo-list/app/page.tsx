"use client";
import { useIsClient } from "@uidotdev/usehooks";
import TodoApp from "./components/TodoApp";

export default function Home() {
	const isClient = useIsClient();
	if (!isClient) {
		return null;
	}

	return <TodoApp />;
}
