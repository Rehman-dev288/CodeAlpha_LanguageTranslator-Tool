import { useState } from 'react';
import '@/App.css';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, ArrowLeftRight, Volume2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const API = "https://api.mymemory.translated.net/get";

const POPULAR_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' },
];

function App() {
  const [languages, setLanguages] = useState(POPULAR_LANGUAGES);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLangs, setIsLoadingLangs] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  
  useState(() => {

    }, []);

 const handleTranslate = async () => {
  if (!sourceText.trim()) {
    toast.error('Please enter text to translate');
    return;
  }

  try {
    setIsLoading(true);
   
    const response = await axios.get("https://api.mymemory.translated.net/get", {
      params: {
        q: sourceText,
        langpair: `${sourceLang === 'auto' ? 'en' : sourceLang}|${targetLang}`
      }
    });

    setTranslatedText(response.data.responseData.translatedText);
    toast.success('Translation completed!');
  } catch (error) {
    console.error('Translation error:', error);
    toast.error('Translation failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') {
      toast.error('Cannot swap when source is set to Auto Detect');
      return;
    }
    setIsSwapping(true);
    setTimeout(() => {
      const tempLang = sourceLang;
      const tempText = sourceText;
      setSourceLang(targetLang);
      setTargetLang(tempLang);
      setSourceText(translatedText);
      setTranslatedText(tempText);
      setIsSwapping(false);
    }, 200);
  };

  const handleCopy = async () => {
    if (!translatedText) {
      toast.error('No translation to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(translatedText);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleSpeak = () => {
    if (!translatedText) {
      toast.error('No translation to speak');
      return;
    }
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      const targetLangCode = targetLang.split('-')[0];
      utterance.lang = targetLangCode;
      window.speechSynthesis.speak(utterance);
      toast.success('Speaking...');
    } else {
      toast.error('Text-to-speech not supported in your browser');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="gradient-spotlight" />
      <div className="noise-overlay" />
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-6 md:p-12">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-50">
            Language Translator
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">Professional translation powered by MyMemory API</p>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-7xl">
            <div
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-6 md:p-8 lg:p-12"
              data-testid="translation-card"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-0">
                {/* Source Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 text-sm font-medium">Source Language</label>
                  </div>
                  <Select value={sourceLang} onValueChange={setSourceLang}>
                    <SelectTrigger
                      data-testid="source-lang-select"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors duration-300"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white max-h-60">
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code} className="hover:bg-white/10">
                          <span className="font-mono text-xs text-slate-400 mr-2">{lang.code.toUpperCase()}</span>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    data-testid="source-input"
                    placeholder="Enter text to translate..."
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    className="bg-transparent border-none resize-none text-lg md:text-xl text-white placeholder:text-slate-600 focus-visible:ring-0 p-0 min-h-[200px] md:min-h-[300px]"
                  />
                  <div className="text-slate-500 text-sm">{sourceText.length} characters</div>
                </div>

                {/* Swap Button */}
                <div className="flex items-center justify-center lg:px-8">
                  <Button
                    data-testid="swap-btn"
                    onClick={handleSwapLanguages}
                    disabled={isSwapping}
                    className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full w-12 h-12 p-0 transition-all duration-300 border border-white/10 shadow-lg"
                    aria-label="Swap languages"
                  >
                    <ArrowLeftRight
                      className={`w-5 h-5 transition-transform duration-500 ${isSwapping ? 'rotate-180' : ''}`}
                    />
                  </Button>
                </div>

                {/* Target Section */}
                <div className="space-y-4 lg:border-l lg:border-white/5 lg:pl-8">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 text-sm font-medium">Target Language</label>
                  </div>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger
                      data-testid="target-lang-select"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors duration-300"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white max-h-60">
                      {languages
                        .filter((lang) => lang.code !== 'auto')
                        .map((lang) => (
                          <SelectItem key={lang.code} value={lang.code} className="hover:bg-white/10">
                            <span className="font-mono text-xs text-slate-400 mr-2">{lang.code.toUpperCase()}</span>
                            {lang.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div
                    data-testid="target-output"
                    className={`bg-transparent text-lg md:text-xl text-white min-h-[200px] md:min-h-[300px] ${
                      isLoading ? 'animate-pulse' : ''
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="ml-2">Translating...</span>
                      </div>
                    ) : translatedText ? (
                      translatedText
                    ) : (
                      <div className="text-slate-600">Translation will appear here...</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      data-testid="copy-btn"
                      onClick={handleCopy}
                      disabled={!translatedText}
                      className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full w-10 h-10 p-0 transition-all duration-300"
                      aria-label="Copy translation"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      data-testid="speak-btn"
                      onClick={handleSpeak}
                      disabled={!translatedText}
                      className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full w-10 h-10 p-0 transition-all duration-300"
                      aria-label="Speak translation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Translate Button */}
              <div className="mt-8 flex justify-center">
                <Button
                  data-testid="translate-btn"
                  onClick={handleTranslate}
                  disabled={isLoading || !sourceText.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 rounded-full px-12 py-6 text-lg font-semibold transition-all duration-300 hover:-translate-y-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    'Translate'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>

        <footer className="p-6 text-center text-slate-500 text-sm">
          <p>Powered by MyMemory API • Supporting Popular Languages</p>
        </footer>
      </div>

      <Toaster position="top-right" theme="dark" />
    </div>
  );
}

export default App;
