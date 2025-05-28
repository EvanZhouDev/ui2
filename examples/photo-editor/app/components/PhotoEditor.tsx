import React, { useRef } from "react";
import {
	usePhotoEditorState,
	PhotoEditorProps,
} from "../hooks/usePhotoEditorState";
import { createCerebras } from "@ai-sdk/cerebras";
import { useUI2 } from "ui2-sdk/react";
import { z } from "zod";

export const PhotoEditor: React.FC<PhotoEditorProps> = ({ file, onClose }) => {
	const {
		canvasRef,
		brightness,
		contrast,
		saturate,
		grayscale,
		rotate,
		zoom,
		flipHorizontal,
		flipVertical,
		blur,
		vignette,
		pixelate,
		noise,
		sepia,
		tint,
		tintIntensity,
		setBrightness,
		setContrast,
		setSaturate,
		setGrayscale,
		setRotate,
		setZoom,
		setFlipHorizontal,
		setFlipVertical,
		setBlur,
		setVignette,
		setPixelate,
		setNoise,
		setSepia,
		setTint,
		setTintIntensity,
		handleZoomIn,
		handleZoomOut,
		resetAllFilters,
		downloadImage,
		handleRotateLeft,
		handleRotateRight,
	} = usePhotoEditorState(file);

	// Create ref to store previous values for cleanup
	const prevStateRef = useRef({
		brightness: 100,
		contrast: 100,
		saturate: 100,
		grayscale: 0,
		rotate: 0,
		zoom: 1,
		flipHorizontal: false,
		flipVertical: false,
		blur: 0,
		vignette: 0,
		pixelate: 0,
		noise: 0,
		sepia: 0,
		tint: "#000000",
		tintIntensity: 0,
	});

	const cerebras = createCerebras({
		apiKey: "API_KEY",
	});

	let temp = 0;
	let { inputValue, handleInputChange, handleSubmit } = useUI2({
		model: cerebras("llama-3.3-70b"),
		systemPrompt: `This is a photo editing app. Help the user edit their photo based on the request. Remember that in most cases you will be required to modify multiple sliders. It is encouraged you do so to keep a balanced image. Examples:

Dramatic/Cinematic
Contrast: 130%
Vignette: 30%
Brightness: 90%

Warm Cinematic
Contrast: 120%
Saturation: 110%
Sepia: 20%
Brightness: 95%

Cool Cinematic
Contrast: 120%
Saturation: 90%
Tint Color: Dark Blue (adjust intensity to subtle blue)
Intensity: 2%
Brightness: 95%

Vintage Film
Noise: 50%
Sepia: 50%
Contrast: 80%
Saturation: 90%
Brightness: 95%

Dreamy/Ethereal
Blur: 5px
Brightness: 120%
Saturation: 80%
Vignette: 20%`,
		context: prevStateRef.current,
	})
		.addIntent("modifyFilter", {
			parameters: z.object({
				brightness: z.number().min(0).max(200),
				contrast: z.number().min(0).max(200),
				saturate: z.number().min(0).max(200),
			}),
			description:
				"Set the brightness, contrast, saturation level of the photo. Do not over-do it. Make minor adjustments only.",
			onSubmit: ({ parameters }) => {
				setBrightness(parameters.brightness);
				setContrast(parameters.contrast);
				setSaturate(parameters.saturate);
			},
			onIntent: ({ parameters }) => {
				// Save current values before changing
				prevStateRef.current = {
					...prevStateRef.current,
					brightness,
					contrast,
					saturate,
					grayscale,
				};

				// Apply new values
				setBrightness(parameters.brightness);
				setContrast(parameters.contrast);
				setSaturate(parameters.saturate);
			},
			onCleanup: () => {
				// Restore previous values
				setBrightness(prevStateRef.current.brightness);
				setContrast(prevStateRef.current.contrast);
				setSaturate(prevStateRef.current.saturate);
				setGrayscale(prevStateRef.current.grayscale);
			},
		})
		.addIntent("adjustGrayscale", {
			parameters: z.object({
				grayscale: z.number().min(0).max(100),
			}),
			description:
				"Adjust the grayscale level of the photo between 0% (color) and 100% (black and white).",
			onSubmit: ({ parameters }) => {
				setGrayscale(parameters.grayscale);
			},
			onIntent: ({ parameters }) => {
				// Save current value
				prevStateRef.current = {
					...prevStateRef.current,
					grayscale,
				};

				// Apply new value
				setGrayscale(parameters.grayscale);
			},
			onCleanup: () => {
				// Restore previous value
				setGrayscale(prevStateRef.current.grayscale);
			},
		})
		.addIntent("rotateImage", {
			parameters: z.object({
				angle: z.number().min(0).max(360),
			}),
			description:
				"Rotate the image to a specific angle between 0 and 360 degrees.",
			onSubmit: ({ parameters }) => {
				setRotate(parameters.angle);
			},
			onIntent: ({ parameters }) => {
				// Save current value
				prevStateRef.current = {
					...prevStateRef.current,
					rotate,
				};

				// Apply new value
				setRotate(parameters.angle);
			},
			onCleanup: () => {
				// Restore previous value
				setRotate(prevStateRef.current.rotate);
			},
		})
		.addIntent("zoomImage", {
			parameters: z.object({
				level: z.number().min(0.5).max(3),
			}),
			description:
				"Zoom in or out of the image. Values range from 0.5x (zoomed out) to 3x (zoomed in).",
			onSubmit: ({ parameters }) => {
				setZoom(parameters.level);
			},
			onIntent: ({ parameters }) => {
				// Save current value
				prevStateRef.current = {
					...prevStateRef.current,
					zoom,
				};

				// Apply new value
				setZoom(parameters.level);
			},
			onCleanup: () => {
				// Restore previous value
				setZoom(prevStateRef.current.zoom);
			},
		})
		.addIntent("flipImage", {
			parameters: z.object({
				horizontal: z.boolean().optional(),
				vertical: z.boolean().optional(),
			}),
			description: "Flip the image horizontally and/or vertically.",
			onSubmit: ({ parameters }) => {
				if (parameters.horizontal !== undefined) {
					setFlipHorizontal(parameters.horizontal);
				}
				if (parameters.vertical !== undefined) {
					setFlipVertical(parameters.vertical);
				}
			},
			onIntent: ({ parameters }) => {
				// Save current values
				prevStateRef.current = {
					...prevStateRef.current,
					flipHorizontal,
					flipVertical,
				};

				// Apply new values
				if (parameters.horizontal !== undefined) {
					setFlipHorizontal(parameters.horizontal);
				}
				if (parameters.vertical !== undefined) {
					setFlipVertical(parameters.vertical);
				}
			},
			onCleanup: () => {
				// Restore previous values
				setFlipHorizontal(prevStateRef.current.flipHorizontal);
				setFlipVertical(prevStateRef.current.flipVertical);
			},
		})
		.addIntent("blurImage", {
			parameters: z.object({
				blur: z.number().min(0).max(20),
			}),
			description:
				"Apply a blur effect to the image. Values range from 0px (no blur) to 20px (maximum blur). Do not overuse this effect. Small values are already very dramatic blur. In most cases, ensure it's <5px.",
			onSubmit: ({ parameters }) => {
				setBlur(parameters.blur);
			},
			onIntent: ({ parameters }) => {
				// Save current value
				prevStateRef.current = {
					...prevStateRef.current,
					blur,
				};

				// Apply new value
				setBlur(parameters.blur);
			},
			onCleanup: () => {
				// Restore previous value
				setBlur(prevStateRef.current.blur);
			},
		})
		.addIntent("addVignette", {
			parameters: z.object({
				vignette: z.number().min(0).max(100),
			}),
			description:
				"Add a vignette effect to the image. Values range from 0 (no vignette) to 100 (strong vignette).",
			onSubmit: ({ parameters }) => {
				setVignette(parameters.vignette);
			},
			onIntent: ({ parameters }) => {
				// Save current value
				prevStateRef.current = {
					...prevStateRef.current,
					vignette,
				};

				// Apply new value
				setVignette(parameters.vignette);
			},
			onCleanup: () => {
				// Restore previous value
				setVignette(prevStateRef.current.vignette);
			},
		})
		.addIntent("pixelateImage", {
			parameters: z.object({
				pixelate: z.number().min(0).max(100),
			}),
			description:
				"Apply a pixelate effect to the image. Values range from 0 (no pixelation) to 100 (extreme pixelation).",
			onSubmit: ({ parameters }) => {
				setPixelate(parameters.pixelate);
			},
			onIntent: ({ parameters }) => {
				// Save current value
				prevStateRef.current = {
					...prevStateRef.current,
					pixelate,
				};

				// Apply new value
				setPixelate(parameters.pixelate);
			},
			onCleanup: () => {
				// Restore previous value
				setPixelate(prevStateRef.current.pixelate);
			},
		})
		.addIntent("addNoise", {
			parameters: z.object({
				noise: z.number().min(0).max(100),
			}),
			description:
				"Add noise to the image. Values range from 0 (no noise) to 100 (maximum noise). This is a relatively weak effect. Use around 90-100% to make it noticeable. When asked for film grain, use 100% noise.",
			onSubmit: ({ parameters }) => {
				setNoise(parameters.noise);
			},
			onIntent: ({ parameters }) => {
				// Save current value
				prevStateRef.current = {
					...prevStateRef.current,
					noise,
				};

				// Apply new value
				setNoise(parameters.noise);
			},
			onCleanup: () => {
				// Restore previous value
				setNoise(prevStateRef.current.noise);
			},
		})
		.addIntent("applySepiaEffect", {
			parameters: z.object({
				sepia: z.number().min(0).max(100),
			}),
			description:
				"Apply sepia tone effect to the image. Values range from 0 (no effect) to 100 (full sepia).",
			onSubmit: ({ parameters }) => {
				setSepia(parameters.sepia);
			},
			onIntent: ({ parameters }) => {
				// Save current value
				prevStateRef.current = {
					...prevStateRef.current,
					sepia,
				};

				// Apply new value
				setSepia(parameters.sepia);
			},
			onCleanup: () => {
				// Restore previous value
				setSepia(prevStateRef.current.sepia);
			},
		})
		.addIntent("tintImage", {
			parameters: z.object({
				color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
				intensity: z.number().min(0).max(100),
			}),
			description:
				"Add a color tint to the image. Specify a hex color code and intensity from 0 (no tint) to 100 (full tint). Note that full tint makes the entire image the tint color. Keep values very small. You can also use this color to adjust color temperature.",
			onSubmit: ({ parameters }) => {
				setTint(parameters.color);
				setTintIntensity(parameters.intensity);
			},
			onIntent: ({ parameters }) => {
				// Save current values
				prevStateRef.current = {
					...prevStateRef.current,
					tint,
					tintIntensity,
				};

				// Apply new values
				setTint(parameters.color);
				setTintIntensity(parameters.intensity);
			},
			onCleanup: () => {
				// Restore previous values
				setTint(prevStateRef.current.tint);
				setTintIntensity(prevStateRef.current.tintIntensity);
			},
		});

	return (
		<div className="flex flex-col h-full max-h-screen">
			{/* Main Content Area */}
			<div className="flex flex-col lg:flex-row gap-4 flex-grow overflow-hidden">
				{/* Canvas Area */}
				<div className="flex-1 min-w-0 relative bg-neutral-100 rounded-lg p-2 flex items-center justify-center overflow-auto">
					<canvas ref={canvasRef} className="max-w-[100%] max-h-[70vh]" />
				</div>

				{/* Controls Area - Scrollable */}
				<div className="w-full lg:w-[500px] bg-white p-3 rounded-lg shadow overflow-y-auto max-h-[70vh]">
					<h2 className="font-bold text-lg mb-2">Adjustments</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
						{/* Basic adjustments column */}
						<div className="space-y-2">
							<h3 className="font-semibold text-sm">Basic</h3>

							<div>
								<label className="flex justify-between mb-0 text-xs">
									<span>Brightness</span>
									<span>{brightness}%</span>
								</label>
								<input
									type="range"
									min="0"
									max="200"
									value={brightness}
									onChange={(e) => setBrightness(Number(e.target.value))}
									className="w-full h-4"
								/>
							</div>

							<div>
								<label className="flex justify-between mb-0 text-xs">
									<span>Contrast</span>
									<span>{contrast}%</span>
								</label>
								<input
									type="range"
									min="0"
									max="200"
									value={contrast}
									onChange={(e) => setContrast(Number(e.target.value))}
									className="w-full h-4"
								/>
							</div>

							<div>
								<label className="flex justify-between mb-0 text-xs">
									<span>Saturation</span>
									<span>{saturate}%</span>
								</label>
								<input
									type="range"
									min="0"
									max="200"
									value={saturate}
									onChange={(e) => setSaturate(Number(e.target.value))}
									className="w-full h-4"
								/>
							</div>

							<div>
								<label className="flex justify-between mb-0 text-xs">
									<span>Grayscale</span>
									<span>{grayscale}%</span>
								</label>
								<input
									type="range"
									min="0"
									max="100"
									value={grayscale}
									onChange={(e) => setGrayscale(Number(e.target.value))}
									className="w-full h-4"
								/>
							</div>

							{/* Transform controls */}
							<h3 className="font-semibold text-sm pt-2">Transform</h3>
							<div>
								<label className="flex justify-between mb-0 text-xs">
									<span>Rotation</span>
									<span>{rotate}°</span>
								</label>
								<input
									type="range"
									min="0"
									max="360"
									value={rotate}
									onChange={(e) => setRotate(Number(e.target.value))}
									className="w-full h-4"
								/>
							</div>

							<div>
								<label className="flex justify-between mb-0 text-xs">
									<span>Zoom</span>
									<span>{zoom}x</span>
								</label>
								<input
									type="range"
									min="0.5"
									max="3"
									step="0.1"
									value={zoom}
									onChange={(e) => setZoom(Number(e.target.value))}
									className="w-full h-4"
								/>
							</div>
						</div>

						{/* Effects column */}
						<div className="space-y-2">
							<h3 className="font-semibold text-sm">Effects</h3>
							<div>
								<label className="flex justify-between mb-0 text-xs">
									<span>Blur</span>
									<span>{blur}px</span>
								</label>
								<input
									type="range"
									min="0"
									max="20"
									value={blur}
									onChange={(e) => setBlur(Number(e.target.value))}
									className="w-full h-4"
								/>
							</div>

							<div>
								<label className="flex justify-between mb-0 text-xs">
									<span>Vignette</span>
									<span>{vignette}%</span>
								</label>
								<input
									type="range"
									min="0"
									max="100"
									value={vignette}
									onChange={(e) => setVignette(Number(e.target.value))}
									className="w-full h-4"
								/>
							</div>

							<div>
								<label className="flex justify-between mb-0 text-xs">
									<span>Pixelate</span>
									<span>{pixelate}%</span>
								</label>
								<input
									type="range"
									min="0"
									max="100"
									value={pixelate}
									onChange={(e) => setPixelate(Number(e.target.value))}
									className="w-full h-4"
								/>
							</div>

							<div>
								<label className="flex justify-between mb-0 text-xs">
									<span>Noise</span>
									<span>{noise}%</span>
								</label>
								<input
									type="range"
									min="0"
									max="100"
									value={noise}
									onChange={(e) => setNoise(Number(e.target.value))}
									className="w-full h-4"
								/>
							</div>

							<div>
								<label className="flex justify-between mb-0 text-xs">
									<span>Sepia</span>
									<span>{sepia}%</span>
								</label>
								<input
									type="range"
									min="0"
									max="100"
									value={sepia}
									onChange={(e) => setSepia(Number(e.target.value))}
									className="w-full h-4"
								/>
							</div>

							<div className="grid grid-cols-2 gap-2">
								<div>
									<label className="block text-xs mb-0">Tint Color</label>
									<input
										type="color"
										value={tint}
										onChange={(e) => setTint(e.target.value)}
										className="w-full h-6"
									/>
								</div>
								<div>
									<label className="flex justify-between mb-0 text-xs">
										<span>Intensity</span>
										<span>{tintIntensity}%</span>
									</label>
									<input
										type="range"
										min="0"
										max="100"
										value={tintIntensity}
										onChange={(e) => setTintIntensity(Number(e.target.value))}
										className="w-full h-4"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Action buttons in a grid */}
					<div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-1">
						<button
							onClick={handleZoomIn}
							className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
						>
							Zoom In
						</button>
						<button
							onClick={handleZoomOut}
							className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
						>
							Zoom Out
						</button>
						<button
							onClick={handleRotateLeft}
							className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
						>
							Rotate Left
						</button>
						<button
							onClick={handleRotateRight}
							className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
						>
							Rotate Right
						</button>
						<button
							onClick={() => setFlipHorizontal(!flipHorizontal)}
							className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
						>
							Flip H
						</button>
						<button
							onClick={() => setFlipVertical(!flipVertical)}
							className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
						>
							Flip V
						</button>
					</div>

					{/* Bottom action buttons */}
					<div className="mt-3 grid grid-cols-2 gap-2">
						<button
							onClick={resetAllFilters}
							className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
						>
							Reset All
						</button>
						<button
							onClick={() => downloadImage()}
							className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
						>
							Download
						</button>
					</div>

					{onClose && (
						<button
							onClick={onClose}
							className="w-full mt-2 px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm"
						>
							Close Editor
						</button>
					)}
				</div>
			</div>

			{/* AI Input - Fixed at bottom */}
			<div className="flex flex-row gap-2 w-full mt-2 sticky bottom-0 bg-white p-2 border-t border-gray-200">
				<input
					className="p-2 border rounded flex-grow"
					value={inputValue}
					onChange={(e) => handleInputChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleSubmit();
						}
					}}
					placeholder="Ask AI to edit your photo (e.g., 'Make it look more vibrant')"
				/>
				<button
					className="p-2 bg-blue-500 text-white rounded flex-none"
					onClick={handleSubmit}
				>
					Submit
				</button>
			</div>
		</div>
	);
};
