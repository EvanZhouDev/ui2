import Image from "next/image";

export default function EmptyState() {
	const suggestions = [
		"Walk the dog at 4pm",
		"Meetings at 1pm, 3pm, and 5pm",
		"Very important livestream tomorrow at 10am",
	];

	return (
		<div className="flex flex-col items-center justify-center h-full py-12 px-4">
			<div className="mb-8 opacity-20">
				<Image
					src="/ui2-logo.svg"
					alt="UI2 Logo"
					width={90}
					height={80}
					priority
				/>
			</div>

			<h3 className="text-2xl font-medium text-black mb-6">
				UI2 Todo List Demo
			</h3>

			<div className="max-w-md">
				<p className="text-gray-900 mb-4 text-center">
					Here's what you can do:
				</p>
				<ul className="space-y-1">
					{suggestions.map((suggestion, index) => (
						<li
							key={index}
							className="text-sm text-center px-4 py-1 rounded-lg text-gray-500 italic"
						>
							"{suggestion}"
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
