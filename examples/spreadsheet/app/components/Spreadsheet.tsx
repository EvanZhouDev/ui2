"use client";
import { useEffect, useState } from "react";
import { useUI2 } from "ui2-sdk/react";
import { createCerebras } from "@ai-sdk/cerebras";
import { z } from "zod";

export default function EmployeeDatabase() {
	const cerebras = createCerebras({
		apiKey: "API_KEY",
	});

	// Define types for our spreadsheet data
	type ColumnType = "text" | "number" | "date" | "boolean" | "select";

	interface Cell {
		value: string | number | boolean | Date | null;
		formatted?: string;
	}

	interface Column {
		id: string;
		name: string;
		type: ColumnType;
		width?: number;
		options?: string[];
	}

	interface Row {
		id: string;
		cells: Record<string, Cell>;
		status: "active" | "pending" | "to be deleted" | "modifying" | "highlight";
	}

	// State for columns - improved with more interesting fields for an employee database
	const [columns, setColumns] = useState<Column[]>([
		{ id: "name", name: "Employee Name", type: "text" },
		{
			id: "department",
			name: "Department",
			type: "select",
			options: [
				"Engineering",
				"Marketing",
				"Sales",
				"HR",
				"Finance",
				"Operations",
			],
		},
		{ id: "position", name: "Position", type: "text" },
		{ id: "salary", name: "Annual Salary", type: "number" },
		{
			id: "performance",
			name: "Performance",
			type: "select",
			options: [
				"1 - Poor",
				"2 - Below Average",
				"3 - Average",
				"4 - Good",
				"5 - Excellent",
			],
		},
		{ id: "hireDate", name: "Hire Date", type: "date" },
		{
			id: "status",
			name: "Employment Status",
			type: "select",
			options: ["Full-time", "Part-time", "Contract", "Probation"],
		},
		{
			id: "location",
			name: "Work Location",
			type: "select",
			options: ["Remote", "Hybrid", "Office"],
		},
		{ id: "project", name: "Current Project", type: "text" },
		{ id: "training", name: "Training Complete", type: "boolean" },
	]);

	// State for rows
	const [rows, setRows] = useState<Row[]>([]);

	// Load sample data - much more interesting employee database
	useEffect(() => {
		const sampleData: Row[] = [
			{
				id: "emp001",
				status: "active",
				cells: {
					name: { value: "Emma Rodriguez" },
					department: { value: "Engineering" },
					position: { value: "Senior Developer" },
					salary: { value: 110000 },
					performance: { value: "5 - Excellent" },
					hireDate: { value: new Date("2020-03-15") },
					status: { value: "Full-time" },
					location: { value: "Remote" },
					project: { value: "Cloud Migration" },
					training: { value: true },
				},
			},
			{
				id: "emp002",
				status: "active",
				cells: {
					name: { value: "James Wilson" },
					department: { value: "Marketing" },
					position: { value: "Marketing Manager" },
					salary: { value: 95000 },
					performance: { value: "4 - Good" },
					hireDate: { value: new Date("2019-06-20") },
					status: { value: "Full-time" },
					location: { value: "Hybrid" },
					project: { value: "Summer Campaign" },
					training: { value: true },
				},
			},
			{
				id: "emp003",
				status: "active",
				cells: {
					name: { value: "Michael Chen" },
					department: { value: "Engineering" },
					position: { value: "Junior Developer" },
					salary: { value: 75000 },
					performance: { value: "3 - Average" },
					hireDate: { value: new Date("2022-01-10") },
					status: { value: "Full-time" },
					location: { value: "Office" },
					project: { value: "Bug Fixes" },
					training: { value: false },
				},
			},
			{
				id: "emp004",
				status: "active",
				cells: {
					name: { value: "Sophia Patel" },
					department: { value: "HR" },
					position: { value: "HR Director" },
					salary: { value: 120000 },
					performance: { value: "5 - Excellent" },
					hireDate: { value: new Date("2018-02-15") },
					status: { value: "Full-time" },
					location: { value: "Hybrid" },
					project: { value: "Recruiting Drive" },
					training: { value: true },
				},
			},
			{
				id: "emp005",
				status: "active",
				cells: {
					name: { value: "Robert Kim" },
					department: { value: "Finance" },
					position: { value: "Financial Analyst" },
					salary: { value: 85000 },
					performance: { value: "2 - Below Average" },
					hireDate: { value: new Date("2021-08-01") },
					status: { value: "Full-time" },
					location: { value: "Office" },
					project: { value: "Q3 Reporting" },
					training: { value: false },
				},
			},
			{
				id: "emp006",
				status: "active",
				cells: {
					name: { value: "Olivia Martinez" },
					department: { value: "Sales" },
					position: { value: "Sales Executive" },
					salary: { value: 80000 },
					performance: { value: "4 - Good" },
					hireDate: { value: new Date("2021-05-12") },
					status: { value: "Full-time" },
					location: { value: "Remote" },
					project: { value: "Enterprise Clients" },
					training: { value: true },
				},
			},
			{
				id: "emp007",
				status: "active",
				cells: {
					name: { value: "Daniel Johnson" },
					department: { value: "Engineering" },
					position: { value: "DevOps Engineer" },
					salary: { value: 105000 },
					performance: { value: "5 - Excellent" },
					hireDate: { value: new Date("2020-07-22") },
					status: { value: "Full-time" },
					location: { value: "Remote" },
					project: { value: "Infrastructure Upgrade" },
					training: { value: true },
				},
			},
			{
				id: "emp008",
				status: "active",
				cells: {
					name: { value: "Ava Thompson" },
					department: { value: "Marketing" },
					position: { value: "Content Specialist" },
					salary: { value: 65000 },
					performance: { value: "2 - Below Average" },
					hireDate: { value: new Date("2022-09-01") },
					status: { value: "Probation" },
					location: { value: "Office" },
					project: { value: "Blog Redesign" },
					training: { value: false },
				},
			},
			{
				id: "emp009",
				status: "active",
				cells: {
					name: { value: "William Davis" },
					department: { value: "Operations" },
					position: { value: "Operations Manager" },
					salary: { value: 100000 },
					performance: { value: "3 - Average" },
					hireDate: { value: new Date("2019-11-15") },
					status: { value: "Full-time" },
					location: { value: "Office" },
					project: { value: "Office Relocation" },
					training: { value: true },
				},
			},
			{
				id: "emp010",
				status: "active",
				cells: {
					name: { value: "Isabella Lee" },
					department: { value: "Engineering" },
					position: { value: "QA Engineer" },
					salary: { value: 90000 },
					performance: { value: "4 - Good" },
					hireDate: { value: new Date("2020-10-05") },
					status: { value: "Full-time" },
					location: { value: "Hybrid" },
					project: { value: "Test Automation" },
					training: { value: true },
				},
			},
			{
				id: "emp011",
				status: "active",
				cells: {
					name: { value: "Ethan Wong" },
					department: { value: "Finance" },
					position: { value: "Accountant" },
					salary: { value: 70000 },
					performance: { value: "3 - Average" },
					hireDate: { value: new Date("2021-03-22") },
					status: { value: "Part-time" },
					location: { value: "Office" },
					project: { value: "Tax Filing" },
					training: { value: false },
				},
			},
			{
				id: "emp012",
				status: "active",
				cells: {
					name: { value: "Charlotte Garcia" },
					department: { value: "Sales" },
					position: { value: "Sales Manager" },
					salary: { value: 115000 },
					performance: { value: "5 - Excellent" },
					hireDate: { value: new Date("2018-06-10") },
					status: { value: "Full-time" },
					location: { value: "Hybrid" },
					project: { value: "Sales Strategy" },
					training: { value: true },
				},
			},
			{
				id: "emp013",
				status: "active",
				cells: {
					name: { value: "Noah Smith" },
					department: { value: "Engineering" },
					position: { value: "Data Engineer" },
					salary: { value: 95000 },
					performance: { value: "2 - Below Average" },
					hireDate: { value: new Date("2020-09-15") },
					status: { value: "Full-time" },
					location: { value: "Remote" },
					project: { value: "Data Pipeline" },
					training: { value: false },
				},
			},
			{
				id: "emp014",
				status: "active",
				cells: {
					name: { value: "Mia Brown" },
					department: { value: "HR" },
					position: { value: "Recruiter" },
					salary: { value: 60000 },
					performance: { value: "3 - Average" },
					hireDate: { value: new Date("2022-04-18") },
					status: { value: "Contract" },
					location: { value: "Remote" },
					project: { value: "Engineering Hiring" },
					training: { value: true },
				},
			},
			{
				id: "emp015",
				status: "active",
				cells: {
					name: { value: "Lucas Taylor" },
					department: { value: "Marketing" },
					position: { value: "Digital Marketer" },
					salary: { value: 72000 },
					performance: { value: "4 - Good" },
					hireDate: { value: new Date("2021-07-01") },
					status: { value: "Full-time" },
					location: { value: "Hybrid" },
					project: { value: "Social Media" },
					training: { value: true },
				},
			},
		];

		setRows(sampleData);
	}, []);

	// State for previews and operations
	const [previewEdits, setPreviewEdits] = useState<
		Record<string, Record<string, Cell>>
	>({});
	const [highlightedRows, setHighlightedRows] = useState<string[]>([]);
	const [previewNewRows, setPreviewNewRows] = useState<Row[]>([]);
	const [previewNewColumns, setPreviewNewColumns] = useState<Column[]>([]);
	const [filteredRowIds, setFilteredRowIds] = useState<string[]>([]);

	const changeRowStatus = (id: string, status: string) => {
		setRows((prev) =>
			prev.map((x) =>
				x.id === id ? { ...x, status: status as Row["status"] } : x
			)
		);
	};

	const [sendStatus, setSendStatus] = useState<string>("Ask");

	const {
		inputValue,
		handleInputChange,
		handleSubmit,
		setInputValue,
		isLoading,
	} = useUI2({
		model: cerebras("llama-3.3-70b"),
		systemPrompt: `This is an employee database management system. Help users manage employee records with natural language commands. 
      The database contains information such as employee names, departments, salaries, performance ratings, and more. 
      Assist users with operations like adding employees, updating information, filtering records, and performing bulk operations.`,
		context: {
			database: {
				description: "Current employee database:",
				content: {
					columns,
					employeeCount: rows.length,
					departments: [
						"Engineering",
						"Marketing",
						"Sales",
						"HR",
						"Finance",
						"Operations",
					],
					rows: rows,
					filteredRowIds,
				},
			},
		},
		onIntent: () => {
			setSendStatus("Confirm");
			return () => {
				setSendStatus("Ask");
			};
		},
		onSubmitStart: () => {
			setInputValue("");
		},
		onSubmitEnd: () => {
			setSendStatus("Ask");
		},
	})
		.addIntent("addEmployee", {
			parameters: z.object({
				values: z
					.record(z.string(), z.any())
					.describe("The values for each column in the new employee record"),
			}),
			description:
				"Adds a new employee to the database with the specified values.",
			onIntent: ({ parameters: params, id }) => {
				// Create a new row from the parameters
				const newRow: Row = {
					id,
					status: "pending",
					cells: {},
				};

				// Convert the values to cells
				Object.entries(params.values).forEach(([colId, value]) => {
					// Find the column to determine the type
					const column = columns.find((col) => col.id === colId);
					if (column) {
						newRow.cells[colId] = { value };
					}
				});

				setPreviewNewRows((prev) => [...prev, newRow]);
			},
			onCleanup: ({ id }) => {
				setPreviewNewRows((prev) => prev.filter((row) => row.id !== id));
			},
			onSubmit: ({ parameters: params }) => {
				// Create and add the new row
				const newRow: Row = {
					id: `emp${(rows.length + 1).toString().padStart(3, "0")}`,
					status: "active",
					cells: {},
				};

				// Convert the values to cells
				Object.entries(params.values).forEach(([colId, value]) => {
					const column = columns.find((col) => col.id === colId);
					if (column) {
						newRow.cells[colId] = { value };
					}
				});

				setRows((prev) => [...prev, newRow]);
				setPreviewNewRows([]);
			},
		})
		.addIntent("deleteEmployee", {
			parameters: z.object({
				employeeId: z.string().describe("The ID of the employee to delete"),
			}),
			description: "Removes an employee from the database.",
			onIntent: ({ parameters: params }) => {
				changeRowStatus(params.employeeId, "to be deleted");
			},
			onCleanup: ({ parameters: params }) => {
				changeRowStatus(params.employeeId, "active");
			},
			onSubmit: ({ parameters: params }) => {
				setRows((prev) => prev.filter((row) => row.id !== params.employeeId));
			},
		})
		.addIntent("updateEmployeeInfo", {
			parameters: z.object({
				employeeId: z.string().describe("The ID of the employee to update"),
				field: z.string().describe("The field/column to update"),
				value: z.any().describe("The new value for the field"),
			}),
			description: "Updates a specific field for an employee.",
			onIntent: ({ parameters: params }) => {
				changeRowStatus(params.employeeId, "modifying");

				// Find the column ID from the field name
				const columnId = columns.find(
					(col) =>
						col.name.toLowerCase() === params.field.toLowerCase() ||
						col.id.toLowerCase() === params.field.toLowerCase()
				)?.id;

				if (columnId) {
					// Store the preview edit
					setPreviewEdits((prev) => ({
						...prev,
						[params.employeeId]: {
							...(prev[params.employeeId] || {}),
							[columnId]: { value: params.value },
						},
					}));
				}
			},
			onCleanup: ({ parameters: params }) => {
				changeRowStatus(params.employeeId, "active");
				setPreviewEdits((prev) => {
					const copy = { ...prev };
					if (copy[params.employeeId]) {
						delete copy[params.employeeId];
					}
					return copy;
				});
			},
			onSubmit: ({ parameters: params }) => {
				// Find the column ID from the field name
				const columnId = columns.find(
					(col) =>
						col.name.toLowerCase() === params.field.toLowerCase() ||
						col.id.toLowerCase() === params.field.toLowerCase()
				)?.id;

				if (columnId) {
					setRows((prev) =>
						prev.map((row) => {
							if (row.id === params.employeeId) {
								return {
									...row,
									status: "active",
									cells: {
										...row.cells,
										[columnId]: { value: params.value },
									},
								};
							}
							return row;
						})
					);
				}

				// Clear the preview edit
				setPreviewEdits((prev) => {
					const copy = { ...prev };
					if (copy[params.employeeId]) {
						delete copy[params.employeeId];
					}
					return copy;
				});
			},
		})
		.addIntent("giveSalaryRaises", {
			parameters: z.object({
				condition: z
					.object({
						field: z
							.string()
							.describe("The field to check (e.g., department, performance)"),
						operator: z
							.enum(["=", "!=", ">", "<", ">=", "<=", "contains"])
							.describe("The comparison operator"),
						value: z.any().describe("The value to compare against"),
					})
					.describe("The condition employees must meet to get a raise"),
				percentage: z
					.number()
					.describe("The percentage increase for the salary (e.g., 5 for 5%)"),
			}),
			description:
				"Gives a percentage salary raise to employees meeting certain criteria.",
			onIntent: ({ parameters: params }) => {
				const columnId = columns.find(
					(col) =>
						col.name
							.toLowerCase()
							.includes(params.condition.field.toLowerCase()) ||
						col.id.toLowerCase() === params.condition.field.toLowerCase()
				)?.id;

				if (!columnId) return;

				const matchingEmployeeIds = rows
					.filter((row) => {
						const cell = row.cells[columnId];
						const cellValue = cell?.value!!;
						const compareValue = params.condition.value;

						switch (params.condition.operator) {
							case "=":
								return cellValue === compareValue;
							case "!=":
								return cellValue !== compareValue;
							case ">":
								return cellValue > compareValue;
							case "<":
								return cellValue < compareValue;
							case ">=":
								return cellValue >= compareValue;
							case "<=":
								return cellValue <= compareValue;
							case "contains":
								return (
									typeof cellValue === "string" &&
									cellValue
										.toLowerCase()
										.includes(String(compareValue).toLowerCase())
								);
							default:
								return false;
						}
					})
					.map((row) => row.id);

				setHighlightedRows(matchingEmployeeIds);

				matchingEmployeeIds.forEach((empId) => {
					changeRowStatus(empId, "modifying");

					const currentSalary = rows.find((r) => r.id === empId)?.cells[
						"salary"
					]?.value as number;
					if (currentSalary) {
						const newSalary = Math.round(
							currentSalary * (1 + params.percentage / 100)
						);

						setPreviewEdits((prev) => ({
							...prev,
							[empId]: {
								...(prev[empId] || {}),
								["salary"]: { value: newSalary },
							},
						}));
					}
				});
			},
			onCleanup: ({ parameters: params }) => {
				const columnId = columns.find(
					(col) =>
						col.name
							.toLowerCase()
							.includes(params.condition.field.toLowerCase()) ||
						col.id.toLowerCase() === params.condition.field.toLowerCase()
				)?.id;

				if (!columnId) return;

				const matchingEmployeeIds = rows
					.filter((row) => {
						const cell = row.cells[columnId];
						const cellValue = cell?.value!;
						const compareValue = params.condition.value;

						switch (params.condition.operator) {
							case "=":
								return cellValue === compareValue;
							case "!=":
								return cellValue !== compareValue;
							case ">":
								return cellValue > compareValue;
							case "<":
								return cellValue < compareValue;
							case ">=":
								return cellValue >= compareValue;
							case "<=":
								return cellValue <= compareValue;
							case "contains":
								return (
									typeof cellValue === "string" &&
									cellValue
										.toLowerCase()
										.includes(String(compareValue).toLowerCase())
								);
							default:
								return false;
						}
					})
					.map((row) => row.id);

				matchingEmployeeIds.forEach((empId) => {
					changeRowStatus(empId, "active");
				});

				setHighlightedRows([]);
				setPreviewEdits({});
			},
			onSubmit: ({ parameters: params }) => {
				const columnId = columns.find(
					(col) =>
						col.name
							.toLowerCase()
							.includes(params.condition.field.toLowerCase()) ||
						col.id.toLowerCase() === params.condition.field.toLowerCase()
				)?.id;

				if (!columnId) return;

				setRows((prev) =>
					prev.map((row) => {
						const cell = row.cells[columnId];
						const cellValue = cell?.value!;
						const compareValue = params.condition.value;

						let matches = false;
						switch (params.condition.operator) {
							case "=":
								matches = cellValue === compareValue;
								break;
							case "!=":
								matches = cellValue !== compareValue;
								break;
							case ">":
								matches = cellValue > compareValue;
								break;
							case "<":
								matches = cellValue < compareValue;
								break;
							case ">=":
								matches = cellValue >= compareValue;
								break;
							case "<=":
								matches = cellValue <= compareValue;
								break;
							case "contains":
								matches =
									typeof cellValue === "string" &&
									cellValue
										.toLowerCase()
										.includes(String(compareValue).toLowerCase());
								break;
						}

						if (matches) {
							const currentSalary = row.cells["salary"]?.value as number;
							const newSalary = Math.round(
								currentSalary * (1 + params.percentage / 100)
							);

							return {
								...row,
								status: "active",
								cells: {
									...row.cells,
									["salary"]: { value: newSalary },
								},
							};
						}

						return row;
					})
				);

				setHighlightedRows([]);
				setPreviewEdits({});
			},
		})
		.addIntent("assignProjectToEmployees", {
			parameters: z.object({
				condition: z
					.object({
						field: z
							.string()
							.describe("The field to check (e.g., department, performance)"),
						operator: z
							.enum(["=", "!=", ">", "<", ">=", "<=", "contains"])
							.describe("The comparison operator"),
						value: z.any().describe("The value to compare against"),
					})
					.describe("The condition employees must meet"),
				projectName: z.string().describe("Name of the project to assign"),
			}),
			description: "Assigns a project to employees meeting certain criteria.",
			onIntent: ({ parameters: params }) => {
				const columnId = columns.find(
					(col) =>
						col.name
							.toLowerCase()
							.includes(params.condition.field.toLowerCase()) ||
						col.id.toLowerCase() === params.condition.field.toLowerCase()
				)?.id;

				if (!columnId) return;

				const matchingEmployeeIds = rows
					.filter((row) => {
						const cell = row.cells[columnId];
						const cellValue = cell?.value!;
						const compareValue = params.condition.value;

						switch (params.condition.operator) {
							case "=":
								return cellValue === compareValue;
							case "!=":
								return cellValue !== compareValue;
							case ">":
								return cellValue > compareValue;
							case "<":
								return cellValue < compareValue;
							case ">=":
								return cellValue >= compareValue;
							case "<=":
								return cellValue <= compareValue;
							case "contains":
								return (
									typeof cellValue === "string" &&
									cellValue
										.toLowerCase()
										.includes(String(compareValue).toLowerCase())
								);
							default:
								return false;
						}
					})
					.map((row) => row.id);

				setHighlightedRows(matchingEmployeeIds);

				matchingEmployeeIds.forEach((empId) => {
					changeRowStatus(empId, "modifying");

					setPreviewEdits((prev) => ({
						...prev,
						[empId]: {
							...(prev[empId] || {}),
							["project"]: { value: params.projectName },
						},
					}));
				});
			},
			onCleanup: ({ parameters: params }) => {
				const columnId = columns.find(
					(col) =>
						col.name
							.toLowerCase()
							.includes(params.condition.field.toLowerCase()) ||
						col.id.toLowerCase() === params.condition.field.toLowerCase()
				)?.id;

				if (!columnId) return;

				const matchingEmployeeIds = rows
					.filter((row) => {
						const cell = row.cells[columnId];
						const cellValue = cell?.value!;
						const compareValue = params.condition.value;

						switch (params.condition.operator) {
							case "=":
								return cellValue === compareValue;
							case "!=":
								return cellValue !== compareValue;
							case ">":
								return cellValue > compareValue;
							case "<":
								return cellValue < compareValue;
							case ">=":
								return cellValue >= compareValue;
							case "<=":
								return cellValue <= compareValue;
							case "contains":
								return (
									typeof cellValue === "string" &&
									cellValue
										.toLowerCase()
										.includes(String(compareValue).toLowerCase())
								);
							default:
								return false;
						}
					})
					.map((row) => row.id);

				matchingEmployeeIds.forEach((empId) => {
					changeRowStatus(empId, "active");
				});

				setHighlightedRows([]);
				setPreviewEdits({});
			},
			onSubmit: ({ parameters: params }) => {
				const columnId = columns.find(
					(col) =>
						col.name
							.toLowerCase()
							.includes(params.condition.field.toLowerCase()) ||
						col.id.toLowerCase() === params.condition.field.toLowerCase()
				)?.id;

				if (!columnId) return;

				setRows((prev) =>
					prev.map((row) => {
						const cell = row.cells[columnId];
						const cellValue = cell?.value!;
						const compareValue = params.condition.value;

						let matches = false;
						switch (params.condition.operator) {
							case "=":
								matches = cellValue === compareValue;
								break;
							case "!=":
								matches = cellValue !== compareValue;
								break;
							case ">":
								matches = cellValue > compareValue;
								break;
							case "<":
								matches = cellValue < compareValue;
								break;
							case ">=":
								matches = cellValue >= compareValue;
								break;
							case "<=":
								matches = cellValue <= compareValue;
								break;
							case "contains":
								matches =
									typeof cellValue === "string" &&
									cellValue
										.toLowerCase()
										.includes(String(compareValue).toLowerCase());
								break;
						}

						if (matches) {
							return {
								...row,
								status: "active",
								cells: {
									...row.cells,
									["project"]: { value: params.projectName },
								},
							};
						}

						return row;
					})
				);

				setHighlightedRows([]);
				setPreviewEdits({});
			},
		})
		.addIntent("updateWorkLocation", {
			parameters: z.object({
				condition: z
					.object({
						field: z.string().describe("The field to check"),
						operator: z
							.enum(["=", "!=", ">", "<", ">=", "<=", "contains"])
							.describe("The comparison operator"),
						value: z.any().describe("The value to compare against"),
					})
					.describe("The condition employees must meet"),
				location: z
					.enum(["Remote", "Hybrid", "Office"])
					.describe("The new work location to assign"),
			}),
			description:
				"Updates the work location for employees meeting certain criteria.",
			onIntent: ({ parameters: params }) => {
				const columnId = columns.find(
					(col) =>
						col.name
							.toLowerCase()
							.includes(params.condition.field.toLowerCase()) ||
						col.id.toLowerCase() === params.condition.field.toLowerCase()
				)?.id;

				if (!columnId) return;

				const matchingEmployeeIds = rows
					.filter((row) => {
						const cell = row.cells[columnId];
						const cellValue = cell?.value!;
						const compareValue = params.condition.value;

						switch (params.condition.operator) {
							case "=":
								return cellValue === compareValue;
							case "!=":
								return cellValue !== compareValue;
							case ">":
								return cellValue > compareValue;
							case "<":
								return cellValue < compareValue;
							case ">=":
								return cellValue >= compareValue;
							case "<=":
								return cellValue <= compareValue;
							case "contains":
								return (
									typeof cellValue === "string" &&
									cellValue
										.toLowerCase()
										.includes(String(compareValue).toLowerCase())
								);
							default:
								return false;
						}
					})
					.map((row) => row.id);

				setHighlightedRows(matchingEmployeeIds);

				matchingEmployeeIds.forEach((empId) => {
					changeRowStatus(empId, "modifying");

					setPreviewEdits((prev) => ({
						...prev,
						[empId]: {
							...(prev[empId] || {}),
							["location"]: { value: params.location },
						},
					}));
				});
			},
			onCleanup: ({ parameters: params }) => {
				const columnId = columns.find(
					(col) =>
						col.name
							.toLowerCase()
							.includes(params.condition.field.toLowerCase()) ||
						col.id.toLowerCase() === params.condition.field.toLowerCase()
				)?.id;

				if (!columnId) return;

				const matchingEmployeeIds = rows
					.filter((row) => {
						const cell = row.cells[columnId];
						const cellValue = cell?.value!;
						const compareValue = params.condition.value;

						switch (params.condition.operator) {
							case "=":
								return cellValue === compareValue;
							case "!=":
								return cellValue !== compareValue;
							case ">":
								return cellValue > compareValue;
							case "<":
								return cellValue < compareValue;
							case ">=":
								return cellValue >= compareValue;
							case "<=":
								return cellValue <= compareValue;
							case "contains":
								return (
									typeof cellValue === "string" &&
									cellValue
										.toLowerCase()
										.includes(String(compareValue).toLowerCase())
								);
							default:
								return false;
						}
					})
					.map((row) => row.id);

				matchingEmployeeIds.forEach((empId) => {
					changeRowStatus(empId, "active");
				});

				setHighlightedRows([]);
				setPreviewEdits({});
			},
			onSubmit: ({ parameters: params }) => {
				const columnId = columns.find(
					(col) =>
						col.name
							.toLowerCase()
							.includes(params.condition.field.toLowerCase()) ||
						col.id.toLowerCase() === params.condition.field.toLowerCase()
				)?.id;

				if (!columnId) return;

				setRows((prev) =>
					prev.map((row) => {
						const cell = row.cells[columnId];
						const cellValue = cell?.value!;
						const compareValue = params.condition.value;

						let matches = false;
						switch (params.condition.operator) {
							case "=":
								matches = cellValue === compareValue;
								break;
							case "!=":
								matches = cellValue !== compareValue;
								break;
							case ">":
								matches = cellValue > compareValue;
								break;
							case "<":
								matches = cellValue < compareValue;
								break;
							case ">=":
								matches = cellValue >= compareValue;
								break;
							case "<=":
								matches = cellValue <= compareValue;
								break;
							case "contains":
								matches =
									typeof cellValue === "string" &&
									cellValue
										.toLowerCase()
										.includes(String(compareValue).toLowerCase());
								break;
						}

						if (matches) {
							return {
								...row,
								status: "active",
								cells: {
									...row.cells,
									["location"]: { value: params.location },
								},
							};
						}

						return row;
					})
				);

				setHighlightedRows([]);
				setPreviewEdits({});
			},
		})
		.addIntent("markTrainingCompleted", {
			parameters: z.object({
				condition: z
					.object({
						field: z.string().describe("The field to check"),
						operator: z
							.enum(["=", "!=", ">", "<", ">=", "<=", "contains"])
							.describe("The comparison operator"),
						value: z.any().describe("The value to compare against"),
					})
					.describe("The condition employees must meet"),
			}),
			description:
				"Marks training as completed for employees meeting certain criteria.",
			onIntent: ({ parameters: params }) => {
				const columnId = columns.find(
					(col) =>
						col.name
							.toLowerCase()
							.includes(params.condition.field.toLowerCase()) ||
						col.id.toLowerCase() === params.condition.field.toLowerCase()
				)?.id;

				if (!columnId) return;

				const matchingEmployeeIds = rows
					.filter((row) => {
						const cell = row.cells[columnId];
						const cellValue = cell?.value!;
						const compareValue = params.condition.value;

						switch (params.condition.operator) {
							case "=":
								return cellValue === compareValue;
							case "!=":
								return cellValue !== compareValue;
							case ">":
								return cellValue > compareValue;
							case "<":
								return cellValue < compareValue;
							case ">=":
								return cellValue >= compareValue;
							case "<=":
								return cellValue <= compareValue;
							case "contains":
								return (
									typeof cellValue === "string" &&
									cellValue
										.toLowerCase()
										.includes(String(compareValue).toLowerCase())
								);
							default:
								return false;
						}
					})
					.filter((row) => row.cells["training"]?.value !== true)
					.map((row) => row.id);

				setHighlightedRows(matchingEmployeeIds);

				matchingEmployeeIds.forEach((empId) => {
					changeRowStatus(empId, "modifying");

					setPreviewEdits((prev) => ({
						...prev,
						[empId]: {
							...(prev[empId] || {}),
							["training"]: { value: true },
						},
					}));
				});
			},
			onCleanup: ({ parameters: params }) => {
				const columnId = columns.find(
					(col) =>
						col.name
							.toLowerCase()
							.includes(params.condition.field.toLowerCase()) ||
						col.id.toLowerCase() === params.condition.field.toLowerCase()
				)?.id;

				if (!columnId) return;

				const matchingEmployeeIds = rows
					.filter((row) => {
						const cell = row.cells[columnId];
						const cellValue = cell?.value!;
						const compareValue = params.condition.value;

						switch (params.condition.operator) {
							case "=":
								return cellValue === compareValue;
							case "!=":
								return cellValue !== compareValue;
							case ">":
								return cellValue > compareValue;
							case "<":
								return cellValue < compareValue;
							case ">=":
								return cellValue >= compareValue;
							case "<=":
								return cellValue <= compareValue;
							case "contains":
								return (
									typeof cellValue === "string" &&
									cellValue
										.toLowerCase()
										.includes(String(compareValue).toLowerCase())
								);
							default:
								return false;
						}
					})
					.filter((row) => row.cells["training"]?.value !== true)
					.map((row) => row.id);

				matchingEmployeeIds.forEach((empId) => {
					changeRowStatus(empId, "active");
				});

				setHighlightedRows([]);
				setPreviewEdits({});
			},
			onSubmit: ({ parameters: params }) => {
				const columnId = columns.find(
					(col) =>
						col.name
							.toLowerCase()
							.includes(params.condition.field.toLowerCase()) ||
						col.id.toLowerCase() === params.condition.field.toLowerCase()
				)?.id;

				if (!columnId) return;

				setRows((prev) =>
					prev.map((row) => {
						const cell = row.cells[columnId];
						const cellValue = cell?.value!;
						const compareValue = params.condition.value;

						let matches = false;
						switch (params.condition.operator) {
							case "=":
								matches = cellValue === compareValue;
								break;
							case "!=":
								matches = cellValue !== compareValue;
								break;
							case ">":
								matches = cellValue > compareValue;
								break;
							case "<":
								matches = cellValue < compareValue;
								break;
							case ">=":
								matches = cellValue >= compareValue;
								break;
							case "<=":
								matches = cellValue <= compareValue;
								break;
							case "contains":
								matches =
									typeof cellValue === "string" &&
									cellValue
										.toLowerCase()
										.includes(String(compareValue).toLowerCase());
								break;
						}

						if (matches && row.cells["training"]?.value !== true) {
							return {
								...row,
								status: "active",
								cells: {
									...row.cells,
									["training"]: { value: true },
								},
							};
						}

						return row;
					})
				);

				setHighlightedRows([]);
				setPreviewEdits({});
			},
		})
		.addIntent("filterEmployees", {
			parameters: z.object({
				condition: z
					.object({
						field: z.string().describe("The field to check"),
						operator: z
							.enum(["=", "!=", ">", "<", ">=", "<=", "contains"])
							.describe("The comparison operator"),
						value: z.any().describe("The value to compare against"),
					})
					.describe("The condition that employees must meet to be shown"),
			}),
			description:
				"Filters the employee database to show only employees matching a condition.",
			onIntent: ({ parameters: params }) => {
				const columnId = columns.find(
					(col) =>
						col.name
							.toLowerCase()
							.includes(params.condition.field.toLowerCase()) ||
						col.id.toLowerCase() === params.condition.field.toLowerCase()
				)?.id;

				if (!columnId) return;

				const matchingEmployeeIds = rows
					.filter((row) => {
						const cell = row.cells[columnId];
						const cellValue = cell?.value!;
						const compareValue = params.condition.value;

						switch (params.condition.operator) {
							case "=":
								return cellValue === compareValue;
							case "!=":
								return cellValue !== compareValue;
							case ">":
								return cellValue > compareValue;
							case "<":
								return cellValue < compareValue;
							case ">=":
								return cellValue >= compareValue;
							case "<=":
								return cellValue <= compareValue;
							case "contains":
								return (
									typeof cellValue === "string" &&
									cellValue
										.toLowerCase()
										.includes(String(compareValue).toLowerCase())
								);
							default:
								return false;
						}
					})
					.map((row) => row.id);

				setFilteredRowIds(matchingEmployeeIds);
			},
			onCleanup: () => {
				setFilteredRowIds([]);
			},
		});

	// Helper to format cell values for display
	const formatCellValue = (cell: Cell, columnType: ColumnType): string => {
		if (cell.value === null || cell.value === undefined) return "";

		switch (columnType) {
			case "date":
				return cell.value instanceof Date
					? cell.value.toLocaleDateString()
					: new Date(cell.value as string).toLocaleDateString();
			case "boolean":
				return cell.value ? "Yes" : "No";
			default:
				return String(cell.value);
		}
	};

	// Sort and filter rows for display
	const displayRows = [...rows, ...previewNewRows].filter((row) => {
		// If filtering is active, only show matching rows
		if (filteredRowIds.length > 0) {
			return filteredRowIds.includes(row.id);
		}
		return true;
	});

	// All columns including preview columns
	const displayColumns = [...columns, ...previewNewColumns];

	return (
		<div className="p-6 max-w-full mx-auto h-[100vh] flex flex-col justify-between">
			<div className="flex flex-col overflow-auto">
				<h1 className="text-2xl font-semibold mb-6 text-gray-800">
					Employee Database
				</h1>

				{/* Table */}
				<div className="border rounded-lg overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-100">
							<tr>
								{displayColumns.map((column) => (
									<th
										key={column.id}
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										{column.name}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{displayRows.map((row) => {
								const isHighlighted = highlightedRows.includes(row.id);

								// Row styles based on status
								const rowStyles = isHighlighted
									? "bg-yellow-100"
									: row.status === "to be deleted"
									? "bg-red-50 opacity-70"
									: row.status === "modifying"
									? "bg-blue-50"
									: row.status === "pending"
									? "bg-yellow-50"
									: "";

								return (
									<tr key={row.id} className={rowStyles}>
										{displayColumns.map((column) => {
											const cell = row.cells[column.id] || { value: null };
											const previewEdit = previewEdits[row.id]?.[column.id];

											return (
												<td
													key={`${row.id}-${column.id}`}
													className="px-6 py-4 whitespace-nowrap"
												>
													{row.status === "modifying" && previewEdit ? (
														<>
															<span className="line-through text-gray-400">
																{formatCellValue(cell, column.type)}
															</span>
															<span className="ml-2 text-blue-700">
																{formatCellValue(previewEdit, column.type)}
															</span>
														</>
													) : row.status === "to be deleted" ? (
														<span className="line-through">
															{formatCellValue(cell, column.type)}
														</span>
													) : (
														formatCellValue(cell, column.type)
													)}
												</td>
											);
										})}
									</tr>
								);
							})}
							{displayRows.length === 0 && (
								<tr>
									<td
										colSpan={displayColumns.length}
										className="px-6 py-4 text-center text-gray-500 italic"
									>
										No employees found. Add some employees to get started.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{filteredRowIds.length > 0 && (
					<div className="mt-2 text-sm text-blue-600">
						Showing {filteredRowIds.length} of {rows.length} employees.
						<button
							onClick={() => setFilteredRowIds([])}
							className="ml-2 underline"
						>
							Clear filter
						</button>
					</div>
				)}
			</div>

			<div className="flex gap-3 mt-4 relative">
				<input
					onChange={(e) => handleInputChange(e.target.value)}
					value={inputValue}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleSubmit();
						}
					}}
					className="border border-gray-300 px-4 py-3 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
					placeholder="Type your request... (e.g., 'Give Engineering employees a 5% raise')"
				/>
				<button
					onClick={handleSubmit}
					className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center min-w-[80px]"
				>
					{isLoading ? (
						<div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
					) : (
						sendStatus
					)}
				</button>
			</div>
		</div>
	);
}
