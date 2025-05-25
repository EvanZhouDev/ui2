import { useUI2 } from "ui2-sdk/react";
import { PreviewStatus, Priority, Status, Todo } from "./types";
import { z } from "zod";
import { parse, formatISO } from "date-fns";
import { LanguageModel } from "ai";

function parseTimeAndDateToISO(dateString: string, timeString: string) {
	// Parse the date (MM/DD/YYYY) or use today's date if empty
	const today = new Date();
	const parsedDate = dateString
		? parse(dateString, "MM/dd/yyyy", new Date())
		: today;

	// Parse the time (HH:MM AM/PM)
	const parsedTime = parse(timeString, "hh:mm aa", new Date());

	// Combine date and time
	const combinedDate = new Date(
		parsedDate.getFullYear(),
		parsedDate.getMonth(),
		parsedDate.getDate(),
		parsedTime.getHours(),
		parsedTime.getMinutes()
	);

	// Format as ISO string with timezone information
	return formatISO(combinedDate);
}

export default function useTodoListUI2(
	model: LanguageModel,
	todos: Todo[],
	setTodos: (todos: ((prev: Todo[]) => Todo[]) | Todo[]) => void
) {
	return useUI2({
		model,
		systemPrompt:
			"This is a todo app, where you help the user add and manage everything they want to do.",
		context: {
			todos: todos.filter((x) => x.previewStatus == PreviewStatus.Active),
			todaysDate: formatISO(new Date()),
		},
	})
		.addIntent("addTodo", {
			parameters: z.object({
				title: z
					.string()
					.describe(
						"Should use some light grammatical correction. Always capitalize everything."
					),
				description: z
					.string()
					.optional()
					.describe(
						"Title should be concise. Any specific details should be moved to the description"
					),
				dateDue: z.string().optional().describe("must be in format MM/DD/YYYY"),
				timeDue: z
					.string()
					.optional()
					.describe(
						"You must return your response in format HH:MM AM/PM. You should include this if user mentions any time 'at' or 'on' or 'by' or similar."
					),
				priority: z
					.enum([Priority.None, Priority.Low, Priority.Medium, Priority.High])
					.describe("Use none if the user does not specify a priority."),
			}),
			description:
				"Add a new todo. Unless it's a command, you should always use this intent to add a todo.",
			onIntent: ({
				id,
				parameters: { title, description, dateDue, priority, timeDue },
			}) => {
				const newTodo: Todo = {
					id,
					title,
					description,
					dateDue: timeDue
						? parseTimeAndDateToISO(dateDue ?? "", timeDue)
						: undefined,
					dateCreated: formatISO(new Date()),
					priority: priority,
					status: Status.Todo,
					previewStatus: PreviewStatus.Pending,
				};
				setTodos((prev) => [...(Array.isArray(prev) ? prev : todos), newTodo]);
			},
			onCleanup: ({ id }) => {
				setTodos((prev) =>
					(Array.isArray(prev) ? prev : todos).filter((x) => x.id !== id)
				);
			},
			onSubmit: ({ id }) => {
				setTodos((prev) =>
					(Array.isArray(prev) ? prev : todos).map((x) =>
						x.id === id ? { ...x, previewStatus: PreviewStatus.Active } : x
					)
				);
			},
		})
		.addIntent("deleteTodo", {
			parameters: z.object({
				id: z.string().describe("The id property of the todo to delete."),
			}),
			description: "Delete a todo",
			onIntent: ({ parameters }) => {
				setTodos((prev) =>
					(Array.isArray(prev) ? prev : todos).map((x) =>
						x.id === parameters.id
							? { ...x, previewStatus: PreviewStatus.ToBeDeleted }
							: x
					)
				);
			},
			onCleanup: ({ parameters }) => {
				setTodos((prev) =>
					(Array.isArray(prev) ? prev : todos).map((x) =>
						x.id === parameters.id
							? { ...x, previewStatus: PreviewStatus.Active }
							: x
					)
				);
			},
			onSubmit: ({ parameters }) => {
				setTodos((prev) =>
					(Array.isArray(prev) ? prev : todos).filter(
						(x) => x.id !== parameters.id
					)
				);
			},
		})
		.addIntent("modifyTodo", {
			parameters: z
				.object({
					id: z.string().describe("The id property of the todo to modify."),
					title: z
						.string()
						.optional()
						.describe(
							"The new title of the todo. Should use some light grammatical correction"
						),
					description: z
						.string()
						.optional()
						.describe(
							"The new descrpition of the todo. Title should be concise. Any specific details should be moved to the description"
						),
					dateDue: z
						.string()
						.optional()
						.describe(
							"The new due date of the reminder. must be in format MM/DD/YYYY"
						),
					timeDue: z
						.string()
						.optional()
						.describe(
							"The new time due of the reminder. You must return your response in format HH:MM AM/PM. You should include this if user mentions any time 'at' or 'on' or 'by' or similar."
						),
					status: z.enum([Status.Todo, Status.Completed]).optional(),
					priority: z
						.enum([Priority.None, Priority.Low, Priority.Medium, Priority.High])
						.optional()
						.describe(
							"The new priority of the reminder. Use none if the user does not specify a priority."
						),
				})
				.describe(
					"All of these properties should be what to change. Thus, they are optional. You should also use this to complete or uncomplete reminders."
				),
			description:
				"Modify a todo. This should always be called when user says to change or edit a todo.",
			onIntent: ({
				parameters: {
					id,
					title,
					description,
					dateDue,
					priority,
					timeDue,
					status,
				},
			}) => {
				setTodos((prev) =>
					(Array.isArray(prev) ? prev : todos).map((x) =>
						x.id === id
							? {
									...x,
									previewStatus: PreviewStatus.Modifying,
									modifying: {
										title,
										description,
										dateDue: timeDue
											? parseTimeAndDateToISO(dateDue ?? "", timeDue)
											: undefined,
										dateCreated: formatISO(new Date()),
										priority: priority,
										status: status,
									},
							  }
							: x
					)
				);
			},
			onCleanup: ({ parameters }) => {
				setTodos((prev) =>
					(Array.isArray(prev) ? prev : todos).map((x) =>
						x.id === parameters.id
							? {
									...x,
									previewStatus: PreviewStatus.Active,
									modifying: undefined,
							  }
							: x
					)
				);
			},
			onSubmit: ({ parameters }) => {
				setTodos((prev) =>
					(Array.isArray(prev) ? prev : todos).map((x) =>
						x.id === parameters.id
							? {
									...x,
									...Object.fromEntries(
										Object.entries(x.modifying ?? {}).filter(
											([key, value]) => value !== undefined
										)
									),
									previewStatus: PreviewStatus.Active,
									modifying: undefined,
							  }
							: x
					)
				);
			},
		});
}
