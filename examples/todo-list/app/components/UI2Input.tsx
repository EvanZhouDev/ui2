export default function UI2Input({
	value,
	onChange,
	onSubmit,
	placeholder = "Add a new task",
}: {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: () => void;
	placeholder?: string;
}) {
	return (
		<div className="flex flex-row justify-stretch items-center gap-2 my-4">
			<input
				className="flex-grow h-12 px-4 bg-white rounded-full border border-gray-200 
                          text-base font-normal text-gray-800 placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300
                          transition-all"
				value={value}
				onChange={onChange}
				type="text"
				placeholder={placeholder}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						onSubmit();
					}
				}}
			/>
			<button
				className="flex-none h-12 w-12 bg-black text-white rounded-full font-medium
                           hover:bg-gray-800 active:bg-gray-900 transition-colors 
                           disabled:opacity-50 disabled:bg-gray-400 shadow-sm flex items-center justify-center"
				onClick={onSubmit}
				disabled={!value.trim()}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-5 w-5"
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
			</button>
		</div>
	);
}
