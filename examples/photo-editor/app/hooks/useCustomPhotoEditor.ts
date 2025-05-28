import { useEffect, useRef, useState, useCallback } from "react";

export interface CustomPhotoEditorOptions {
	file: File;
	defaultBrightness?: number;
	defaultContrast?: number;
	defaultSaturate?: number;
	defaultGrayscale?: number;
	defaultBlur?: number;
	defaultVignette?: number;
	defaultPixelate?: number;
	defaultNoise?: number;
	defaultSepia?: number;
	defaultTint?: string;
	defaultTintIntensity?: number;
	defaultRotate?: number;
	defaultZoom?: number;
	defaultFlipHorizontal?: boolean;
	defaultFlipVertical?: boolean;
}

/**
 * A custom photo editor hook that provides image editing capabilities
 * using HTML Canvas. This implements all the features from scratch.
 */
export function useCustomPhotoEditor({
	file,
	defaultBrightness = 100,
	defaultContrast = 100,
	defaultSaturate = 100,
	defaultGrayscale = 0,
	defaultBlur = 0,
	defaultVignette = 0,
	defaultPixelate = 0,
	defaultNoise = 0,
	defaultSepia = 0,
	defaultTint = "#000000",
	defaultTintIntensity = 0,
	defaultRotate = 0,
	defaultZoom = 1,
	defaultFlipHorizontal = false,
	defaultFlipVertical = false,
}: CustomPhotoEditorOptions) {
	// Canvas and image refs
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const originalImageRef = useRef<HTMLImageElement | null>(null);
	const originalImageDataRef = useRef<ImageData | null>(null);

	// Image dimensions
	const [imageDimensions, setImageDimensions] = useState({
		width: 0,
		height: 0,
	});

	// Basic adjustments
	const [brightness, setBrightness] = useState(defaultBrightness);
	const [contrast, setContrast] = useState(defaultContrast);
	const [saturate, setSaturate] = useState(defaultSaturate);
	const [grayscale, setGrayscale] = useState(defaultGrayscale);

	// Advanced effects
	const [blur, setBlur] = useState(defaultBlur);
	const [vignette, setVignette] = useState(defaultVignette);
	const [pixelate, setPixelate] = useState(defaultPixelate);
	const [noise, setNoise] = useState(defaultNoise);
	const [sepia, setSepia] = useState(defaultSepia);
	const [tint, setTint] = useState(defaultTint);
	const [tintIntensity, setTintIntensity] = useState(defaultTintIntensity);

	// Transform controls
	const [rotate, setRotate] = useState(defaultRotate);
	const [zoom, setZoom] = useState(defaultZoom);
	const [flipHorizontal, setFlipHorizontal] = useState(defaultFlipHorizontal);
	const [flipVertical, setFlipVertical] = useState(defaultFlipVertical);

	// Animation frame for rendering
	const animationFrameId = useRef<number | null>(null);

	// Flag to track if the image is loaded
	const [isImageLoaded, setIsImageLoaded] = useState(false);

	// Load the image from file
	useEffect(() => {
		if (!file) return;

		const objectUrl = URL.createObjectURL(file);
		const img = new Image();

		img.onload = () => {
			originalImageRef.current = img;
			setImageDimensions({
				width: img.naturalWidth,
				height: img.naturalHeight,
			});
			setIsImageLoaded(true);
			URL.revokeObjectURL(objectUrl);
		};

		img.src = objectUrl;

		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [file]);

	// Set up the canvas and capture original image data
	useEffect(() => {
		if (!isImageLoaded || !canvasRef.current || !originalImageRef.current)
			return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) return;

		// Set canvas dimensions based on image size
		canvas.width = imageDimensions.width;
		canvas.height = imageDimensions.height;

		// Draw the image to capture original data
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(originalImageRef.current, 0, 0);

		// Store the original pixel data
		originalImageDataRef.current = ctx.getImageData(
			0,
			0,
			canvas.width,
			canvas.height
		);

		// Initial render
		renderCanvas();
	}, [isImageLoaded, imageDimensions]);

	// Render the canvas with all applied effects
	const renderCanvas = useCallback(() => {
		if (
			!canvasRef.current ||
			!originalImageRef.current ||
			!originalImageDataRef.current
		)
			return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) return;

		// Clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Calculate center point for transformations
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;

		// Create temporary canvas for effect processing
		const tempCanvas = document.createElement("canvas");
		tempCanvas.width = canvas.width;
		tempCanvas.height = canvas.height;
		const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });

		if (tempCtx) {
			// Start with original image data
			tempCtx.putImageData(originalImageDataRef.current, 0, 0);

			// Apply basic adjustments through CSS filters
			ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%)`;

			// Apply blur if needed
			if (blur > 0) {
				ctx.filter += ` blur(${blur}px)`;
			}

			// Set up the transformation matrix
			ctx.save();

			// Move to center, apply transformations, then move back
			ctx.translate(centerX, centerY);

			// Apply rotation (ensure it works in proper 90° increments)
			ctx.rotate((rotate * Math.PI) / 180);

			// Apply flipping by using negative scale values
			ctx.scale(flipHorizontal ? -zoom : zoom, flipVertical ? -zoom : zoom);

			// Move back from center
			ctx.translate(-centerX, -centerY);

			// Draw the base image with filters applied
			ctx.drawImage(tempCanvas, 0, 0);
			ctx.filter = "none";

			// Restore transformation context before getting image data
			ctx.restore();

			// Further effects need to be applied to the current state
			// Get the current state after basic filters and transformations
			const currentImageData = ctx.getImageData(
				0,
				0,
				canvas.width,
				canvas.height
			);

			// Create a new temp canvas for post-processing effects
			const effectsCanvas = document.createElement("canvas");
			effectsCanvas.width = canvas.width;
			effectsCanvas.height = canvas.height;
			const effectsCtx = effectsCanvas.getContext("2d", {
				willReadFrequently: true,
			});

			if (effectsCtx) {
				// Apply the current state to the effects canvas
				effectsCtx.putImageData(currentImageData, 0, 0);

				// Apply vignette effect - IMPROVED VERSION
				if (vignette > 0) {
					// Create a separate canvas for the vignette
					const vignetteCanvas = document.createElement('canvas');
					vignetteCanvas.width = canvas.width;
					vignetteCanvas.height = canvas.height;
					const vignetteCtx = vignetteCanvas.getContext('2d');
					
					if (vignetteCtx) {
						// Calculate dimensions for better vignette
						const width = canvas.width;
						const height = canvas.height;
						const diagonal = Math.sqrt(width * width + height * height);
						
						// Adjust radius based on vignette intensity
						 // Map vignette 0-100 to a suitable radius range
						const normalizedVignette = vignette / 100; // Convert to 0-1 range
						
						// Create a 3-part gradient for more natural fall-off
						const gradient = vignetteCtx.createRadialGradient(
							width / 2, height / 2, 0,
							width / 2, height / 2, diagonal / 2
						);
						
						// Center part fully transparent
						gradient.addColorStop(0, "rgba(0,0,0,0)");
						
						 // Calculate safe inner stop value that works across the entire range
						// For lower vignette values, we want the clear area to be larger
						// Map vignette 0-100 to start of darkening: 0.9-0.2
						const innerStop = Math.max(0, Math.min(0.9, 0.9 - normalizedVignette * 0.7));
						gradient.addColorStop(innerStop, "rgba(0,0,0,0)");
						
						// Middle part with gradual darkening
						// Ensure midStop is always larger than innerStop but less than 1.0
						const midStop = Math.min(0.95, innerStop + 0.2);
						gradient.addColorStop(midStop, `rgba(0,0,0,${normalizedVignette * 0.5})`);
						
						// Edges with full darkness (adjusted by intensity)
						gradient.addColorStop(1, `rgba(0,0,0,${normalizedVignette * 0.9})`);
						
						// Draw the vignette
						vignetteCtx.fillStyle = gradient;
						vignetteCtx.fillRect(0, 0, width, height);
						
						// Apply the vignette to the main image
						effectsCtx.globalCompositeOperation = "multiply";
						effectsCtx.drawImage(vignetteCanvas, 0, 0);
						effectsCtx.globalCompositeOperation = "source-over";
					}
				}

				// Apply pixelate effect - OPTIMIZED VERSION
				if (pixelate > 0) {
					// Optimize pixelate by adjusting size based on image dimensions
					// and using a more efficient approach
					const maxSize = Math.max(canvas.width, canvas.height);
					// Adjust pixelSize for better performance on larger images
					const pixelSize = Math.max(
						2,
						Math.floor((pixelate * maxSize) / 1000)
					);

					// Only process if pixel size is meaningful
					if (pixelSize > 1) {
						// Use a more efficient pixelation method
						effectsCtx.save();

						// Draw at reduced size to temporary canvas
						const smallCanvas = document.createElement("canvas");
						const smallCtx = smallCanvas.getContext("2d");

						if (smallCtx) {
							// Calculate reduced dimensions
							const smallWidth = Math.ceil(canvas.width / pixelSize);
							const smallHeight = Math.ceil(canvas.height / pixelSize);

							smallCanvas.width = smallWidth;
							smallCanvas.height = smallHeight;

							// Draw the image at reduced size (this creates the pixelation)
							smallCtx.drawImage(effectsCanvas, 0, 0, smallWidth, smallHeight);

							// Clear the effects canvas
							effectsCtx.clearRect(0, 0, canvas.width, canvas.height);

							// Draw the small image back to the original size with nearest-neighbor
							effectsCtx.imageSmoothingEnabled = false;
							effectsCtx.drawImage(
								smallCanvas,
								0,
								0,
								smallWidth,
								smallHeight,
								0,
								0,
								canvas.width,
								canvas.height
							);
							effectsCtx.imageSmoothingEnabled = true;
						}

						effectsCtx.restore();
					}
				}

				// Apply noise effect - IMPROVED FILM GRAIN STYLE
				if (noise > 0) {
					const noiseData = effectsCtx.getImageData(
						0,
						0,
						canvas.width,
						canvas.height
					);
					const data = noiseData.data;

					// Reduce intensity for more subtle effect
					const intensity = noise * 1.5; // Reduced from 2.55 to make it softer

					// Apply noise with film grain properties (less dense, affecting luminance more than color)
					for (let y = 0; y < canvas.height; y++) {
						for (let x = 0; x < canvas.width; x++) {
							// Only apply noise to some pixels (film grain isn't on every pixel)
							// Higher noise values increase the chance a pixel gets noise
							if (Math.random() < noise / 300) {
								const i = (y * canvas.width + x) * 4;

								// Create a luminance-based noise value (more realistic)
								const luminanceNoise = (Math.random() - 0.5) * intensity;

								// Apply noise with more effect on luminance than color
								data[i] = Math.max(
									0,
									Math.min(255, data[i] + luminanceNoise * 0.9)
								);
								data[i + 1] = Math.max(
									0,
									Math.min(255, data[i + 1] + luminanceNoise * 0.9)
								);
								data[i + 2] = Math.max(
									0,
									Math.min(255, data[i + 2] + luminanceNoise * 0.9)
								);
							}
						}
					}

					effectsCtx.putImageData(noiseData, 0, 0);
				}

				// Apply sepia effect
				if (sepia > 0) {
					const sepiaData = effectsCtx.getImageData(
						0,
						0,
						canvas.width,
						canvas.height
					);
					const data = sepiaData.data;
					const intensity = sepia / 100;

					for (let i = 0; i < data.length; i += 4) {
						const r = data[i];
						const g = data[i + 1];
						const b = data[i + 2];

						const newR = Math.min(
							255,
							r * (1 - intensity) +
								intensity * (r * 0.393 + g * 0.769 + b * 0.189)
						);
						const newG = Math.min(
							255,
							g * (1 - intensity) +
								intensity * (r * 0.349 + g * 0.686 + b * 0.168)
						);
						const newB = Math.min(
							255,
							b * (1 - intensity) +
								intensity * (r * 0.272 + g * 0.534 + b * 0.131)
						);

						data[i] = newR;
						data[i + 1] = newG;
						data[i + 2] = newB;
					}

					effectsCtx.putImageData(sepiaData, 0, 0);
				}

				// Apply tint
				if (tintIntensity > 0) {
					const tintData = effectsCtx.getImageData(
						0,
						0,
						canvas.width,
						canvas.height
					);
					const data = tintData.data;
					const intensity = tintIntensity / 100;

					// Convert hex tint to RGB
					const r = parseInt(tint.slice(1, 3), 16);
					const g = parseInt(tint.slice(3, 5), 16);
					const b = parseInt(tint.slice(5, 7), 16);

					for (let i = 0; i < data.length; i += 4) {
						data[i] = data[i] * (1 - intensity) + r * intensity;
						data[i + 1] = data[i + 1] * (1 - intensity) + g * intensity;
						data[i + 2] = data[i + 2] * (1 - intensity) + b * intensity;
					}

					effectsCtx.putImageData(tintData, 0, 0);
				}

				// Draw the final image with all effects back to the main canvas
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(effectsCanvas, 0, 0);
			}
		}
	}, [
		brightness,
		contrast,
		saturate,
		grayscale,
		blur,
		vignette,
		pixelate,
		noise,
		sepia,
		tint,
		tintIntensity,
		rotate,
		zoom,
		flipHorizontal,
		flipVertical,
	]);

	// Schedule rendering whenever parameters change
	useEffect(() => {
		if (!isImageLoaded) return;

		if (animationFrameId.current) {
			cancelAnimationFrame(animationFrameId.current);
		}

		animationFrameId.current = requestAnimationFrame(renderCanvas);

		return () => {
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current);
			}
		};
	}, [isImageLoaded, renderCanvas]);

	// Helper functions for common operations
	const handleZoomIn = useCallback(() => {
		setZoom((prev) => Math.min(3, prev + 0.1));
	}, []);

	const handleZoomOut = useCallback(() => {
		setZoom((prev) => Math.max(0.5, prev - 0.1));
	}, []);

	const handleRotateLeft = useCallback(() => {
		setRotate((prev) => {
			const newRotate = prev - 90;
			return newRotate < 0 ? newRotate + 360 : newRotate;
		});
	}, []);

	const handleRotateRight = useCallback(() => {
		setRotate((prev) => (prev + 90) % 360);
	}, []);

	const resetFilters = useCallback(() => {
		setBrightness(defaultBrightness);
		setContrast(defaultContrast);
		setSaturate(defaultSaturate);
		setGrayscale(defaultGrayscale);
		setBlur(defaultBlur);
		setVignette(defaultVignette);
		setPixelate(defaultPixelate);
		setNoise(defaultNoise);
		setSepia(defaultSepia);
		setTint(defaultTint);
		setTintIntensity(defaultTintIntensity);
	}, [
		defaultBrightness,
		defaultContrast,
		defaultSaturate,
		defaultGrayscale,
		defaultBlur,
		defaultVignette,
		defaultPixelate,
		defaultNoise,
		defaultSepia,
		defaultTint,
		defaultTintIntensity,
	]);

	const resetTransforms = useCallback(() => {
		setRotate(defaultRotate);
		setZoom(defaultZoom);
		setFlipHorizontal(defaultFlipHorizontal);
		setFlipVertical(defaultFlipVertical);
	}, [defaultRotate, defaultZoom, defaultFlipHorizontal, defaultFlipVertical]);

	const resetAllSettings = useCallback(() => {
		resetFilters();
		resetTransforms();
	}, [resetFilters, resetTransforms]);

	// Generate final image for download/save
	const generateEditedFile = useCallback(
		async (format = "image/png", quality = 0.9): Promise<Blob> => {
			return new Promise((resolve, reject) => {
				if (!canvasRef.current) {
					reject(new Error("Canvas not available"));
					return;
				}

				// Canvas is already rendered with all effects
				canvasRef.current.toBlob(
					(blob) => {
						if (blob) {
							resolve(blob);
						} else {
							reject(new Error("Failed to create blob from canvas"));
						}
					},
					format,
					quality
				);
			});
		},
		[]
	);

	const downloadImage = useCallback(
		async (filename?: string, format = "image/png", quality = 0.9) => {
			try {
				const blob = await generateEditedFile(format, quality);
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = filename || `edited-${file.name}`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			} catch (error) {
				console.error("Error downloading image:", error);
			}
		},
		[file.name, generateEditedFile]
	);

	return {
		// Canvas reference
		canvasRef,

		// Image info
		imageWidth: imageDimensions.width,
		imageHeight: imageDimensions.height,
		isLoaded: isImageLoaded,

		// Basic adjustment states and setters
		brightness,
		contrast,
		saturate,
		grayscale,
		setBrightness,
		setContrast,
		setSaturate,
		setGrayscale,

		// Advanced effect states and setters
		blur,
		vignette,
		pixelate,
		noise,
		sepia,
		tint,
		tintIntensity,
		setBlur,
		setVignette,
		setPixelate,
		setNoise,
		setSepia,
		setTint,
		setTintIntensity,

		// Transform states and setters
		rotate,
		zoom,
		flipHorizontal,
		flipVertical,
		setRotate,
		setZoom,
		setFlipHorizontal,
		setFlipVertical,

		// Helper methods
		handleZoomIn,
		handleZoomOut,
		handleRotateLeft,
		handleRotateRight,
		resetFilters,
		resetTransforms,
		resetAllSettings,

		// Output methods
		generateEditedFile,
		downloadImage,
	};
}
