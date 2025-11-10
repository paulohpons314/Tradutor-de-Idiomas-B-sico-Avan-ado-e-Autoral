import React from 'react';
import { UploadCloudIcon, FileIcon, ClearIcon, DownloadIcon, SpinnerIcon } from './icons';

interface FileTranslationAreaProps {
  uploadedFile: File | null;
  translatedFileContent: string;
  isLoading: boolean;
  error: string | null;
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
  targetLang: string;
}

const FileTranslationArea: React.FC<FileTranslationAreaProps> = ({
  uploadedFile,
  translatedFileContent,
  isLoading,
  error,
  onFileSelect,
  onClearFile,
  targetLang,
}) => {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDownload = () => {
    if (!translatedFileContent || !uploadedFile) return;

    const blob = new Blob([translatedFileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const nameParts = uploadedFile.name.split('.');
    const extension = nameParts.pop();
    const name = nameParts.join('.');
    a.download = `${name}_${targetLang.toUpperCase()}.${extension}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[50vh]">
      {/* Upload Panel */}
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 justify-center items-center">
        {!uploadedFile ? (
          <label
            htmlFor="file-translator-upload"
            className="w-full h-full flex flex-col justify-center items-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors p-6 text-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <UploadCloudIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">Drag & drop your file here</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">or click to browse</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Supported formats: .txt, .md</p>
            <input
              id="file-translator-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".txt,.md,.text"
              disabled={isLoading}
            />
          </label>
        ) : (
          <div className="w-full text-center p-4">
            <FileIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <p className="font-semibold text-gray-800 dark:text-gray-100 break-all">{uploadedFile.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(uploadedFile.size)}</p>
            <button
              onClick={onClearFile}
              disabled={isLoading}
              className="mt-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
              aria-label="Clear file"
            >
              <ClearIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Download Panel */}
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 justify-center items-center text-center">
        {isLoading ? (
          <>
            <SpinnerIcon className="w-12 h-12 text-blue-500 mb-3" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">Translating file...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This may take a moment.</p>
          </>
        ) : error ? (
           <p className="text-red-500 p-4">{error}</p>
        ) : translatedFileContent ? (
          <>
            <FileIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="font-semibold text-gray-800 dark:text-gray-100">Translation complete!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your file is ready to be downloaded.</p>
            <button
              onClick={handleDownload}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors"
            >
              <DownloadIcon className="w-5 h-5" />
              Download
            </button>
          </>
        ) : (
          <>
            <FileIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-lg text-gray-400 dark:text-gray-500">Translated file will be available here.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileTranslationArea;
