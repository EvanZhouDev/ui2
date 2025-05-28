import { useCallback } from 'react';
import { useCustomPhotoEditor } from './useCustomPhotoEditor';

export type PhotoEditorState = ReturnType<typeof useCustomPhotoEditor>;

export interface PhotoEditorProps {
  file: File;
  onClose?: () => void;
}

export function usePhotoEditorState(file: File) {
  const editorState = useCustomPhotoEditor({
    file,
    defaultBrightness: 100,
    defaultContrast: 100,
    defaultSaturate: 100,
    defaultGrayscale: 0,
    defaultBlur: 0,
    defaultVignette: 0,
    defaultPixelate: 0,
    defaultNoise: 0,
    defaultSepia: 0,
    defaultTint: '#000000',
    defaultTintIntensity: 0,
    defaultRotate: 0,
    defaultZoom: 1,
    defaultFlipHorizontal: false,
    defaultFlipVertical: false,
  });

  // Create a simple save handler
  const handleSave = useCallback(async () => {
    await editorState.downloadImage(`edited-${file.name}`);
  }, [editorState, file.name]);

  return {
    ...editorState,
    handleSave,
    // For backwards compatibility with existing code using this hook
    resetAllFilters: editorState.resetAllSettings,
  };
}
