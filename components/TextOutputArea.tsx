import React, { useState, useEffect, useRef } from 'react';
import { CopyIcon, CheckIcon, SpeakerIcon, SpinnerIcon, StopIcon } from './icons';

interface TextOutputAreaProps {
  text: string;
  isLoading: boolean;
  error: string | null;
  onListen: (text: string) => void;
  isFetching: boolean;
  isPlaying: boolean;
}

const TextOutputArea: React.FC<TextOutputAreaProps> = ({ text, isLoading, error, onListen, isFetching, isPlaying }) => {
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
    }
  };

  const handleListen = () => {
    if (isPlaying) {
        onListen('');
        return;
    }
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (selectedText && contentRef.current?.contains(selection.anchorNode)) {
        onListen(selectedText);
    } else {
        onListen(text);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    if (error) {
      return <p className="text-red-500 p-4">{error}</p>;
    }
    if (text) {
      return <p className="whitespace-pre-wrap p-4 text-lg">{text}</p>;
    }
    return (
      <p className="text-gray-400 dark:text-gray-500 p-4 text-lg">
        Translation will appear here.
      </p>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
      <div ref={contentRef} className="flex-grow overflow-y-auto text-gray-800 dark:text-gray-200">
        {renderContent()}
      </div>
       <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end min-h-[58px]">
        {text && !isLoading && !error && (
            <div className="flex items-center gap-2">
                <button
                    onClick={handleListen}
                    disabled={isFetching}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    aria-label={isPlaying ? "Stop listening" : "Listen to translation"}
                >
                    {isFetching ? <SpinnerIcon className="w-5 h-5" /> : isPlaying ? <StopIcon className="w-5 h-5 text-red-500" /> : <SpeakerIcon className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Copy to clipboard"
                >
                  {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default TextOutputArea;