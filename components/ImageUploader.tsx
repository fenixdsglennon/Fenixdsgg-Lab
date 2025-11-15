import React, { useCallback, useState } from 'react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  label: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesChange, multiple = false, label }) => {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      // Fix: Explicitly type `file` as `File` to resolve a type inference issue with `URL.createObjectURL`.
      const newImageFiles = filesArray.map((file: File) => ({
        file: file,
        preview: URL.createObjectURL(file),
      }));

      const updatedFiles = multiple ? [...imageFiles, ...newImageFiles] : newImageFiles;
      setImageFiles(updatedFiles);
      onFilesChange(updatedFiles.map(f => f.file));
    }
  }, [imageFiles, multiple, onFilesChange]);

  const removeImage = (index: number) => {
    const newImageFiles = [...imageFiles];
    URL.revokeObjectURL(newImageFiles[index].preview);
    newImageFiles.splice(index, 1);
    setImageFiles(newImageFiles);
    onFilesChange(newImageFiles.map(f => f.file));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-content-200 mb-2">{label}</label>
      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-500 px-6 py-10">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mt-4 flex text-sm leading-6 text-gray-400">
            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-base-100 font-semibold text-brand-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-dark focus-within:ring-offset-2 focus-within:ring-offset-base-100 hover:text-brand-secondary">
              <span>Carregar arquivo(s)</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" multiple={multiple} />
            </label>
            <p className="pl-1">ou arraste e solte</p>
          </div>
          <p className="text-xs leading-5 text-gray-400">PNG, JPG, GIF até 10MB</p>
        </div>
      </div>
      {imageFiles.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {imageFiles.map((imageFile, index) => (
            <div key={index} className="relative group">
              <img src={imageFile.preview} alt={`preview ${index}`} className="h-24 w-24 object-cover rounded-md" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;