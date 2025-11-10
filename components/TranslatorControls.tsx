import React from 'react';
import { Language, TranslationStyle } from '../types';
import { SwapIcon } from './icons';

interface TranslatorControlsProps {
  sourceLang: Language;
  targetLang: Language;
  onSourceLangChange: (lang: Language) => void;
  onTargetLangChange: (lang: Language) => void;
  onSwapLanguages: () => void;
  isAdvanced: boolean;
  onToggleAdvanced: (isAdvanced: boolean) => void;
  mode: 'text' | 'file';
  onModeChange: (mode: 'text' | 'file') => void;
  style: TranslationStyle;
  onStyleChange: (style: TranslationStyle) => void;
}

const languageOptions: Record<Language, string> = {
  [Language.EN]: 'English (US)',
  [Language.PT]: 'Português (BR)',
  [Language.FR]: 'Français',
  [Language.ES]: 'Español',
  [Language.IT]: 'Italiano',
  [Language.DE]: 'Deutsch',
  [Language.RU]: 'Русский',
};

const styleOptions: Record<TranslationStyle, string> = {
    [TranslationStyle.Standard]: 'Standard',
    [TranslationStyle.Poetic]: 'Poetic',
    [TranslationStyle.Hemingway]: 'Hemingway Prose',
    [TranslationStyle.Carioca]: 'Carioca Slang',
    [TranslationStyle.Londoner]: 'London Slang',
    [TranslationStyle.Email]: 'Email Format',
    [TranslationStyle.LoveLetter]: 'Love Letter',
    [TranslationStyle.Podcast]: 'Podcast Script',
};


const LanguageDropdown: React.FC<{
  selectedLang: Language;
  onChange: (lang: Language) => void;
  disabledLang?: Language;
}> = ({ selectedLang, onChange, disabledLang }) => (
  <div className="relative">
    <select
      value={selectedLang}
      onChange={(e) => onChange(e.target.value as Language)}
      className="appearance-none w-full bg-gray-200 dark:bg-gray-700 border-none text-gray-700 dark:text-gray-200 py-2 pl-4 pr-8 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-colors"
    >
      {Object.entries(languageOptions).map(([code, name]) => (
        <option key={code} value={code} disabled={code === disabledLang}>
          {name}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>
);

const StyleDropdown: React.FC<{
    selectedStyle: TranslationStyle;
    onChange: (style: TranslationStyle) => void;
    disabled: boolean;
}> = ({ selectedStyle, onChange, disabled }) => (
    <div className="relative">
        <select
            value={selectedStyle}
            onChange={(e) => onChange(e.target.value as TranslationStyle)}
            disabled={disabled}
            className="appearance-none w-full bg-gray-200 dark:bg-gray-700 border-none text-gray-700 dark:text-gray-200 py-2 pl-4 pr-8 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {Object.entries(styleOptions).map(([code, name]) => (
                <option key={code} value={code}>
                    {name}
                </option>
            ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
    </div>
);


const TranslatorControls: React.FC<TranslatorControlsProps> = ({
  sourceLang,
  targetLang,
  onSourceLangChange,
  onTargetLangChange,
  onSwapLanguages,
  isAdvanced,
  onToggleAdvanced,
  mode,
  onModeChange,
  style,
  onStyleChange
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between w-full mb-6 gap-4">
      <div className="flex items-center gap-2">
        <LanguageDropdown 
          selectedLang={sourceLang}
          onChange={onSourceLangChange}
          disabledLang={targetLang}
        />
        <button
          onClick={onSwapLanguages}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-transform duration-300 hover:rotate-180"
          aria-label="Swap languages"
        >
          <SwapIcon className="w-5 h-5" />
        </button>
        <LanguageDropdown 
          selectedLang={targetLang}
          onChange={onTargetLangChange}
          disabledLang={sourceLang}
        />
      </div>
      
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 bg-gray-200 dark:bg-gray-700 p-1 rounded-full">
            <button
              onClick={() => onModeChange('text')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${mode === 'text' ? 'bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Text
            </button>
            <button
              onClick={() => onModeChange('file')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${mode === 'file' ? 'bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}
            >
              File
            </button>
        </div>

        <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 bg-gray-200 dark:bg-gray-700 p-1 rounded-full">
                <button
                onClick={() => onToggleAdvanced(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!isAdvanced ? 'bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}
                >
                Básica
                </button>
                <button
                onClick={() => onToggleAdvanced(true)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${isAdvanced ? 'bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}
                >
                Avançada
                </button>
            </div>
            <StyleDropdown 
                selectedStyle={style}
                onChange={onStyleChange}
                disabled={!isAdvanced}
            />
        </div>
      </div>
    </div>
  );
};

export default TranslatorControls;
