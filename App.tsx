import React, { useState, useEffect, useCallback, useRef } from 'react';
import { transliterateToOdia } from './services/geminiService';
import { CopyIcon, CheckIcon, XIcon, ArrowRightIcon, SparklesIcon } from './components/Icons';
import HistoryPanel from './components/HistoryPanel';
import { HistoryItem } from './types';

// Debounce utility to prevent API flooding
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Auto-transliterate mode
  const [autoMode, setAutoMode] = useState(true);

  // Debounced input for API calls
  const debouncedInput = useDebounce(inputText, 800);

  // Check if API key is present
  const hasApiKey = !!process.env.API_KEY;

  const handleTransliterate = useCallback(async (text: string) => {
    if (!text.trim()) {
      setOutputText('');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await transliterateToOdia(text);
      setOutputText(result);
      
      // Add to history if meaningful
      if (text.length > 2 && result) {
        setHistory(prev => {
          const newItem: HistoryItem = {
            id: Date.now().toString(),
            original: text,
            transliterated: result,
            timestamp: Date.now()
          };
          // Keep last 10 items, remove duplicates based on original text
          const filtered = prev.filter(p => p.original.toLowerCase() !== text.toLowerCase());
          return [newItem, ...filtered].slice(0, 10);
        });
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect for auto-transliteration
  useEffect(() => {
    if (autoMode && debouncedInput) {
      handleTransliterate(debouncedInput);
    } else if (!debouncedInput) {
      setOutputText('');
    }
  }, [debouncedInput, autoMode, handleTransliterate]);

  const copyToClipboard = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold font-odia text-xl shadow-sm">
              ଓ
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Odia Lipi
            </h1>
          </div>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer" 
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Type in <span className="text-orange-600">English</span>, Get <span className="text-red-600 font-odia">Odia</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered engine phonetically transliterates your English text into the beautiful Odia script in real-time.
            </p>
            {!hasApiKey && (
               <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm inline-block border border-red-100">
                  ⚠️ API Key missing. Transliteration will fail. Please configure process.env.API_KEY.
               </div>
            )}
          </div>

          {/* Transliteration Box */}
          <div className="bg-white rounded-2xl shadow-xl shadow-orange-900/5 border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100 backdrop-blur-sm">
               <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Mode</span>
                  <button 
                    onClick={() => setAutoMode(!autoMode)}
                    className={`text-sm px-3 py-1.5 rounded-full transition-all flex items-center gap-2 ${autoMode ? 'bg-orange-100 text-orange-700 font-medium' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    {autoMode ? 'Auto-Translate' : 'Manual'}
                  </button>
               </div>
               <button 
                onClick={clearAll}
                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                title="Clear all text"
               >
                 <span className="sr-only">Clear</span>
                 <XIcon className="w-5 h-5" />
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 h-[500px] md:h-[400px]">
              {/* Input Area */}
              <div className="flex flex-col h-full p-6 relative group bg-white">
                <label htmlFor="input" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  English (Phonetic)
                </label>
                <textarea
                  id="input"
                  className="flex-grow w-full resize-none outline-none text-lg text-gray-800 placeholder-gray-300 bg-transparent"
                  placeholder="e.g. Namaskar, kemiti achanti?"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  spellCheck={false}
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-300 pointer-events-none group-hover:text-gray-400 transition-colors">
                  {inputText.length} chars
                </div>
              </div>

              {/* Output Area */}
              <div className="flex flex-col h-full p-6 relative bg-gray-50/30">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="output" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Odia Output
                  </label>
                  {isLoading && (
                    <span className="text-xs text-orange-500 font-medium animate-pulse flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"></div>
                      Converting...
                    </span>
                  )}
                </div>
                
                <textarea
                  id="output"
                  readOnly
                  className="flex-grow w-full resize-none outline-none text-xl sm:text-2xl font-odia text-gray-900 placeholder-gray-300 bg-transparent leading-relaxed"
                  placeholder="ନମସ୍କାର, କେମିତି ଅଛନ୍ତି?"
                  value={outputText}
                />
                
                {error && (
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">
                    {error}
                  </div>
                )}

                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={copyToClipboard}
                    disabled={!outputText}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                      isCopied 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-200 hover:text-orange-600 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <CopyIcon className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Action Bar for Manual Mode */}
            {!autoMode && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                <button
                  onClick={() => handleTransliterate(inputText)}
                  disabled={isLoading || !inputText}
                  className="bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-gray-200 hover:shadow-xl active:scale-95"
                >
                  {isLoading ? 'Processing...' : 'Transliterate'}
                  {!isLoading && <ArrowRightIcon className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          <HistoryPanel 
            history={history} 
            onSelect={(item) => {
              setInputText(item.original);
              setOutputText(item.transliterated);
            }}
            onClear={() => setHistory([])}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            Powered by Google Gemini 
            <span className="mx-2">•</span> 
            Made with React & Tailwind
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
