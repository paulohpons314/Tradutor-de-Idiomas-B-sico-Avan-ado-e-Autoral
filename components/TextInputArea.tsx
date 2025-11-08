import React, { useRef } from 'react';
import { SpeakerIcon, SpinnerIcon, StopIcon, ClearIcon } from './icons';

interface TextInputAreaProps {
  text: string;
  onTextChange: (text: string) => void;
  isLoading: boolean;
  onListen: (text: string) => void;
  isFetching: boolean;
  isPlaying: boolean;
  onClearText: () => void;
}

const TextInputArea: React.FC<TextInputAreaProps> = ({ text, onTextChange, isLoading, onListen, isFetching, isPlaying, onClearText }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        onTextChange(fileContent);
      };
      reader.readAsText(file);
    }
  };

  const handleListen = () => {
    // If playing, the parent component will handle the stop action.
    // We just need to trigger the event.
    if (isPlaying) {
      onListen('');
      return;
    }

    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd, value } = textareaRef.current;
    const selectedText = value.substring(selectionStart, selectionEnd);
    onListen(selectedText.trim() || value);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Enter text to translate or upload a file..."
        className="w-full flex-grow p-4 bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none text-lg"
        disabled={isLoading}
      />
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
                onClick={handleListen} 
                disabled={isFetching || isLoading || (!text.trim() && !isPlaying)}
                className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={isPlaying ? "Stop listening" : "Listen to source text"}
            >
                {isFetching ? <SpinnerIcon className="w-5 h-5" /> : isPlaying ? <StopIcon className="w-5 h-5 text-red-500" /> : <SpeakerIcon className="w-5 h-5" />}
            </button>
            {text.trim().length > 0 && (
              <button
                onClick={onClearText}
                disabled={isLoading}
                className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Clear input text"
              >
                <ClearIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <span className="text-sm text-gray-500">{text.length} characters</span>
        </div>
        <label htmlFor="file-upload" className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
          Upload File
          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.md,.text" disabled={isLoading}/>
        </label>
      </div>
    </div>
  );
};

export default TextInputArea;