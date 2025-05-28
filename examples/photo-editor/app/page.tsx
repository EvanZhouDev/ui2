"use client";

import { useState, useRef } from "react";
import { PhotoEditor } from "./components/PhotoEditor";

export default function PhotoEditorPage() {
	const [file, setFile] = useState<File | null>(null);
	const [showEditor, setShowEditor] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e?.target?.files && e.target.files.length > 0) {
			setFile(e.target.files[0]);
			setShowEditor(true);
		}
	};

	return (
		<main className="min-h-screen p-6">
			<h1 className="text-2xl font-bold mb-6">Photo Editor</h1>

			{!showEditor ? (
				<div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
					<input
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						className="hidden"
						ref={fileInputRef}
					/>
					<button
						onClick={() => fileInputRef.current?.click()}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Select Image
					</button>
				</div>
			) : (
				file && <PhotoEditor file={file} onClose={() => setShowEditor(false)} />
			)}
		</main>
	);
}
