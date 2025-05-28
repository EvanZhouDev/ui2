import { useRef } from "react";
import { usePhotoEditorState } from "./usePhotoEditorState";

/**
 * Hook to expose all photo editor functionality for external use
 * This allows you to integrate the photo editor capabilities into any component
 * 
 * @example
 * const MyComponent = () => {
 *   const { 
 *     editorRef, // Attach this ref to a container element
 *     brightness, 
 *     setBrightness,
 *     // ...other properties and methods
 *     downloadImage 
 *   } = useExternalPhotoEditor(myImageFile);
 * 
 *   return (
 *     <div>
 *       <div ref={editorRef} />
 *       <input 
 *         type="range" 
 *         value={brightness} 
 *         onChange={(e) => setBrightness(Number(e.target.value))} 
 *       />
 *       <button onClick={() => downloadImage("edited-image.jpg")}>
 *         Download
 *       </button>
 *     </div>
 *   );
 * };
 */
export function useExternalPhotoEditor(file: File) {
  const editorRef = useRef<HTMLDivElement>(null);
  
  const {
    canvasRef,
    // Original state values
    brightness,
    contrast,
    saturate,
    grayscale,
    rotate,
    zoom,
    flipHorizontal,
    flipVertical,
    // New effect state values
    blur,
    vignette,
    pixelate,
    noise,
    sepia,
    tint,
    tintIntensity,
    // Original state setters
    setBrightness,
    setContrast,
    setSaturate,
    setGrayscale,
    setRotate,
    setZoom,
    setFlipHorizontal,
    setFlipVertical,
    // New effect state setters
    setBlur,
    setVignette,
    setPixelate,
    setNoise,
    setSepia,
    setTint,
    setTintIntensity,
    // Original helper methods
    handleZoomIn,
    handleZoomOut,
    resetAllFilters,
    downloadImage,
    generateEditedFile,
    handleRotateLeft,
    handleRotateRight,
    handleSave,
  } = usePhotoEditorState(file);

  // Append canvas to the provided ref when available
  if (editorRef.current && canvasRef.current && editorRef.current.childNodes.length === 0) {
    editorRef.current.appendChild(canvasRef.current);
  }

  return {
    // Container reference
    editorRef,
    
    // Canvas reference
    canvasRef,
    
    // Original state values
    brightness,
    contrast,
    saturate,
    grayscale,
    rotate,
    zoom,
    flipHorizontal,
    flipVertical,
    
    // New effect state values
    blur,
    vignette,
    pixelate,
    noise,
    sepia,
    tint,
    tintIntensity,
    
    // Original state setters
    setBrightness,
    setContrast,
    setSaturate,
    setGrayscale,
    setRotate,
    setZoom,
    setFlipHorizontal,
    setFlipVertical,
    
    // New effect state setters
    setBlur,
    setVignette,
    setPixelate,
    setNoise,
    setSepia,
    setTint,
    setTintIntensity,
    
    // Helper methods
    handleZoomIn,
    handleZoomOut,
    handleRotateLeft,
    handleRotateRight,
    resetAllFilters,
    
    // Output methods
    downloadImage,
    generateEditedFile,
    handleSave,
  };
}