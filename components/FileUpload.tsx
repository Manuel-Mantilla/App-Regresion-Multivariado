
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div 
            className={`w-full max-w-2xl p-8 border-2 border-dashed rounded-xl transition-all duration-300 ${isDragging ? 'border-brand-secondary bg-gray-800/50' : 'border-gray-600 hover:border-brand-primary'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center text-center">
                <UploadIcon className="w-16 h-16 text-gray-500 mb-4"/>
                <h2 className="text-2xl font-semibold mb-2 text-white">Upload Your Dataset</h2>
                <p className="text-gray-400 mb-6">Drag & drop a CSV, XLSX, or TXT file here, or click to select a file.</p>
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv,.xlsx,.txt"
                    onChange={handleFileChange}
                    disabled={isLoading}
                />
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                    {isLoading ? 'Processing...' : 'Select File'}
                </label>
                {error && <p className="text-red-400 mt-4">{error}</p>}
                 {isLoading && <div className="mt-4"><Loader /></div>}
            </div>
        </div>
        <p className="text-gray-500 mt-6 text-sm">Your data is processed securely and is not stored.</p>
    </div>
  );
};

const Loader: React.FC = () => (
    <div className="w-8 h-8 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
);


export default FileUpload;
