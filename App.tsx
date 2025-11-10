import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import TranslatorControls from './components/TranslatorControls';
import TextInputArea from './components/TextInputArea';
import TextOutputArea from './components/TextOutputArea';
import FileTranslationArea from './components/FileTranslationArea';
import { Language, Theme, TranslationStyle } from './types';
import { translateText, generateSpeech } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audio';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.Dark);
  const [inputText, setInputText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<Language>(Language.EN);
  const [targetLang, setTargetLang] = useState<Language>(Language.PT);
  const [isAdvanced, setIsAdvanced] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [translationStyle, setTranslationStyle] = useState<TranslationStyle>(TranslationStyle.Standard);
  
  const [isFetchingSource, setIsFetchingSource] = useState<boolean>(false);
  const [isFetchingTarget, setIsFetchingTarget] = useState<boolean>(false);
  const [nowPlaying, setNowPlaying] = useState<'source' | 'target' | null>(null);

  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [translatedFileContent, setTranslatedFileContent] = useState<string>('');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (theme === Theme.Dark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark:bg-gray-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark:bg-gray-900');
    }
  }, [theme]);

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };
  
  const handleModeChange = (newMode: 'text' | 'file') => {
    if (mode === newMode) return;
    setMode(newMode);
    // Reset all translation-related states
    setInputText('');
    setTranslatedText('');
    setUploadedFile(null);
    setTranslatedFileContent('');
    setError(null);
    setIsLoading(false);
    stopCurrentAudio();
  };

  const handleToggleAdvanced = (advanced: boolean) => {
    setIsAdvanced(advanced);
    if (!advanced) {
      setTranslationStyle(TranslationStyle.Standard);
    }
  };

  const handleTranslate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    stopCurrentAudio();

    const textToTranslate = mode === 'text' ? inputText : '';
    let hasContent = mode === 'text' ? !!textToTranslate.trim() : !!uploadedFile;
    
    if (!hasContent) {
        setIsLoading(false);
        return;
    }

    if (mode === 'text') {
        setTranslatedText('');
        try {
            const result = await translateText(inputText, sourceLang, targetLang, isAdvanced, translationStyle);
            setTranslatedText(result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    } else if (mode === 'file' && uploadedFile) {
        setTranslatedFileContent('');
        const reader = new FileReader();
        reader.onload = async (e) => {
            const fileContent = e.target?.result as string;
            if (fileContent) {
                try {
                    const result = await translateText(fileContent, sourceLang, targetLang, isAdvanced, translationStyle);
                    setTranslatedFileContent(result);
                } catch (err: any) {
                    setError(err.message || 'An unexpected error occurred.');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setError("Could not read the file content.");
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setError("Failed to read the file.");
            setIsLoading(false);
        };
        reader.readAsText(uploadedFile);
    } else {
        setIsLoading(false);
    }
}, [mode, inputText, uploadedFile, sourceLang, targetLang, isAdvanced, translationStyle]);

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setUploadedFile(null);
    setTranslatedFileContent('');
    setError(null);
    stopCurrentAudio();
  };
  
  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setTranslatedFileContent('');
    setError(null);
  };

  const stopCurrentAudio = () => {
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
    }
    setNowPlaying(null);
  };

  const playAudio = async (base64Audio: string, audioOrigin: 'source' | 'target') => {
    try {
        stopCurrentAudio();
        
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioCtx = audioCtxRef.current;
        
        const decodedBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedBytes, audioCtx, 24000, 1);
        
        const sourceNode = audioCtx.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(audioCtx.destination);
        sourceNode.onended = () => {
            if (audioSourceRef.current === sourceNode) {
                audioSourceRef.current = null;
                setNowPlaying(null);
            }
        };
        sourceNode.start();
        audioSourceRef.current = sourceNode;
        setNowPlaying(audioOrigin);

    } catch (err) {
        console.error("Failed to play audio:", err);
        setError("Sorry, there was an issue playing the audio.");
        setNowPlaying(null);
    }
  };

  const handleListen = async (
    textToSpeak: string,
    lang: Language,
    audioOrigin: 'source' | 'target'
  ) => {
    if (nowPlaying === audioOrigin) {
        stopCurrentAudio();
        return;
    }
      
    if (!textToSpeak) return;

    const setIsFetching = audioOrigin === 'source' ? setIsFetchingSource : setIsFetchingTarget;

    setIsFetching(true);
    setError(null);

    try {
        const audioData = await generateSpeech(textToSpeak, lang);
        if (audioData) {
            await playAudio(audioData, audioOrigin);
        }
    } catch (err: any) {
        setError(err.message || 'Failed to generate audio.');
    } finally {
        setIsFetching(false);
    }
  };


  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 bg-gray-100 dark:bg-gray-900`}>
      <Header theme={theme} setTheme={setTheme} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <TranslatorControls 
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceLangChange={setSourceLang}
            onTargetLangChange={setTargetLang}
            onSwapLanguages={handleSwapLanguages}
            isAdvanced={isAdvanced}
            onToggleAdvanced={handleToggleAdvanced}
            mode={mode}
            onModeChange={handleModeChange}
            style={translationStyle}
            onStyleChange={setTranslationStyle}
          />

          {mode === 'text' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[50vh]">
                <TextInputArea 
                  text={inputText}
                  onTextChange={setInputText}
                  isLoading={isLoading}
                  onListen={(text) => handleListen(text, sourceLang, 'source')}
                  isFetching={isFetchingSource}
                  isPlaying={nowPlaying === 'source'}
                  onClearText={handleClear}
                />
                <TextOutputArea 
                  text={translatedText}
                  isLoading={isLoading}
                  error={error}
                  onListen={(text) => handleListen(text, targetLang, 'target')}
                  isFetching={isFetchingTarget}
                  isPlaying={nowPlaying === 'target'}
                />
            </div>
           ) : (
             <FileTranslationArea
                uploadedFile={uploadedFile}
                translatedFileContent={translatedFileContent}
                isLoading={isLoading}
                error={error}
                onFileSelect={handleFileSelect}
                onClearFile={handleClear}
                targetLang={targetLang}
             />
           )}

          <div className="mt-6 flex justify-center">
            <button 
              onClick={handleTranslate}
              disabled={isLoading || (mode === 'text' && !inputText.trim()) || (mode === 'file' && !uploadedFile)}
              className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {isLoading ? 'Translating...' : (mode === 'file' ? 'Translate File' : 'Translate')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
