import { Status, Todo, Priority, PreviewStatus } from "../types";
import { useMemo } from "react";

export default function TodoItem({
	todo,
	setTodos,
}: {
	todo: Todo;
	setTodos: (todos: Todo[] | ((prevTodos: Todo[]) => Todo[])) => void;
}) {
	// Helper function to get color for priority chip
	const getPriorityColor = (priority: Priority) => {
		switch (priority) {
			case Priority.High:
				return "bg-red-100 text-red-800";
			case Priority.Medium:
				return "bg-yellow-100 text-yellow-800";
			case Priority.Low:
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};
	// Format date to be relative and user-friendly
	const formattedDate = useMemo(() => {
		// Use modifying date if available, otherwise use current date
		const dateToUse =
			todo.previewStatus === PreviewStatus.Modifying &&
			todo.modifying?.dateDue !== undefined
				? todo.modifying.dateDue
				: todo.dateDue;

		if (!dateToUse) return "";

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const dueDate = new Date(dateToUse);
		const dueDateForComparison = new Date(dateToUse);
		dueDateForComparison.setHours(0, 0, 0, 0);

		const diffDays = Math.round(
			(dueDateForComparison.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
		);

		if (diffDays === 0) {
			// For today, show the time instead of "Today"
			let hours = dueDate.getHours();
			const minutes = dueDate.getMinutes().toString().padStart(2, "0");
			const ampm = hours >= 12 ? "PM" : "AM";
			hours = hours % 12;
			hours = hours ? hours : 12; // the hour '0' should be '12'
			return `${hours}:${minutes} ${ampm}`;
		}
		if (diffDays === -1) return "Yesterday";
		if (diffDays === 1) return "Tomorrow";
		if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
		if (diffDays > 1) return `in ${diffDays} days`;

		return "";
	}, [todo.dateDue, todo.modifying?.dateDue, todo.previewStatus]);

	// Add preview status styling
	const previewStateClasses = useMemo(() => {
		if (todo.previewStatus === PreviewStatus.Pending) {
			return "bg-yellow-50/50 rounded-xl border-l-4 border-yellow-300";
		}
		if (todo.previewStatus === PreviewStatus.Modifying) {
			return "bg-blue-50/50 rounded-xl border-l-4 border-blue-300";
		}
		if (todo.previewStatus === PreviewStatus.ToBeDeleted) {
			return "bg-red-50/50 rounded-xl border-l-4 border-red-300";
		}
		if (todo.previewStatus === PreviewStatus.Active) {
			return "rounded-xl border-l-4 border-white";
		}
		return "";
	}, [todo.previewStatus]);

	// Get the display values (current or modifying)
	const displayTitle =
		todo.previewStatus === PreviewStatus.Modifying && todo.modifying?.title
			? todo.modifying.title
			: todo.title;
	const displayDescription =
		todo.previewStatus === PreviewStatus.Modifying &&
		todo.modifying?.description !== undefined
			? todo.modifying.description
			: todo.description;
	const displayPriority =
		todo.previewStatus === PreviewStatus.Modifying && todo.modifying?.priority
			? todo.modifying.priority
			: todo.priority;

	// Get display status for checkbox (current or modifying)
	const displayStatus =
		todo.previewStatus === PreviewStatus.Modifying &&
		todo.modifying?.status !== undefined
			? todo.modifying.status
			: todo.status;

	// Status icon component
	const StatusIcon = () => {
		return (
			<span className="w-6 mr-2 flex justify-start">
				{todo.previewStatus === PreviewStatus.Pending && (
					<span className="text-yellow-500" title="Pending">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
								clipRule="evenodd"
							/>
						</svg>
					</span>
				)}
				{todo.previewStatus === PreviewStatus.Modifying && (
					<span className="text-blue-500" title="Modifying">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
						</svg>
					</span>
				)}
				{todo.previewStatus === PreviewStatus.ToBeDeleted && (
					<span className="text-red-500" title="To be deleted">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
								clipRule="evenodd"
							/>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clipRule="evenodd"
							/>
						</svg>
					</span>
				)}
			</span>
		);
	};

	return (
		<>
			<div
				className={`flex flex-row items-center justify-between py-4 px-3 relative ${previewStateClasses}`}
				key={todo.id}
			>
				<div className="flex items-center justify-center absolute left-[-25px]">
					<StatusIcon />
				</div>
				<div className="flex flex-row items-start flex-grow">
					<div className="inline-flex items-center mr-4 mt-1">
						<label
							className={`flex items-center cursor-pointer relative ${
								todo.previewStatus === PreviewStatus.Pending ? "opacity-60" : ""
							}`}
						>
							<input
								type="checkbox"
								checked={displayStatus === Status.Completed}
								className={`peer h-6 w-6 cursor-pointer transition-all appearance-none rounded-lg border-2 border-[#D8D8D8] checked:bg-[#191919] checked:border-[#191919]`}
								disabled={todo.previewStatus === PreviewStatus.Pending}
								onChange={(e) => {
									setTodos((prev) =>
										prev.map((x) =>
											x.id === todo.id
												? {
														...x,
														status:
															x.status === Status.Completed
																? Status.Todo
																: Status.Completed,
												  }
												: x
										)
									);
								}}
							/>
							<span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-3.5 w-3.5"
									viewBox="0 0 20 20"
									fill="currentColor"
									stroke="currentColor"
									strokeWidth="1"
								>
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									></path>
								</svg>
							</span>
						</label>
					</div>
					<div className="flex flex-col flex-grow">
						<div className="flex flex-row items-center gap-2 flex-wrap">
							<div className="flex items-center">
								<div
									className={`text-2xl font-[550] ${
										todo.previewStatus === PreviewStatus.Pending
											? "text-black"
											: todo.previewStatus === PreviewStatus.Modifying
											? "text-blue-700"
											: ""
									}`}
								>
									{displayTitle}
								</div>
							</div>
							{displayPriority !== Priority.None && (
								<span
									className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
										displayPriority
									)} ${
										todo.previewStatus === PreviewStatus.Pending
											? "opacity-70"
											: todo.previewStatus === PreviewStatus.Modifying
											? "ring-1 ring-blue-300"
											: ""
									}`}
								>
									{displayPriority}
								</span>
							)}
						</div>
						{displayDescription && (
							<p
								className={`text-sm mt-1 ${
									todo.previewStatus === PreviewStatus.Pending
										? "text-gray-400"
										: todo.previewStatus === PreviewStatus.Modifying
										? "text-blue-600"
										: "text-gray-600"
								}`}
							>
								{displayDescription}
							</p>
						)}
					</div>
				</div>

				{(todo.dateDue ||
					(todo.previewStatus === PreviewStatus.Modifying &&
						todo.modifying?.dateDue !== undefined)) && (
					<div className="text-right min-w-[120px]">
						<span
							className={`rounded-full text-lg font-normal ${
								todo.previewStatus === PreviewStatus.Pending
									? "text-gray-300"
									: todo.previewStatus === PreviewStatus.Modifying
									? "text-blue-500"
									: "text-gray-400"
							}`}
						>
							{formattedDate}
						</span>
					</div>
				)}
			</div>
			<div className="mx-3 border-b-1 my-1 border-gray-200"></div>
		</>
	);
}
