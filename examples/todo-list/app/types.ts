export enum Priority {
	None = "none",
	Low = "Low",
	Medium = "Medium",
	High = "High",
}

export enum Status {
	Completed = "completed",
	Todo = "todo",
}

export enum PreviewStatus {
	Pending = "pending",
	ToBeDeleted = "to be deleted",
	Active = "active",
	Modifying = "modifying",
}

export type Todo = {
	dateCreated: string;
	id: string;
	title: string;
	status: Status;
	previewStatus: PreviewStatus;
	priority: Priority;
	dateDue?: string;
	description?: string;
	modifying?: Partial<Todo>;
};
