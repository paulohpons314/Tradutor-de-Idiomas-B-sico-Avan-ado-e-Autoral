import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import TranslatorControls from './components/TranslatorControls';
import TextInputArea from './components/TextInputArea';
import TextOutputArea from './components/TextOutputArea';
import { Language, Theme } from './types';
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
  
  const [isFetchingSource, setIsFetchingSource] = useState<boolean>(false);
  const [isFetchingTarget, setIsFetchingTarget] = useState<boolean>(false);
  const [nowPlaying, setNowPlaying] = useState<'source' | 'target' | null>(null);

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
  
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setTranslatedText('');

    try {
      const result = await translateText(inputText, sourceLang, targetLang, isAdvanced);
      setTranslatedText(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, sourceLang, targetLang, isAdvanced]);

  const handleClearText = () => {
    setInputText('');
    setTranslatedText('');
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
            onToggleAdvanced={setIsAdvanced}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[50vh]">
            <TextInputArea 
              text={inputText}
              onTextChange={setInputText}
              isLoading={isLoading}
              onListen={(text) => handleListen(text, sourceLang, 'source')}
              isFetching={isFetchingSource}
              isPlaying={nowPlaying === 'source'}
              onClearText={handleClearText}
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

          <div className="mt-6 flex justify-center">
            <button 
              onClick={handleTranslate}
              disabled={isLoading || !inputText.trim()}
              className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {isLoading ? 'Translating...' : 'Translate'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;