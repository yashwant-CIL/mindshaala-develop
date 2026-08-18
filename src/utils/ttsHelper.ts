interface DetectedLang {
  lang: string;
  voiceSearch: string[];
}

/**
 * Detects the language script of a given text and returns preferred language tag
 * and voice search patterns.
 */
export const detectLanguage = (text: string): DetectedLang => {
  if (!text) {
    return { lang: 'en-IN', voiceSearch: ['en-IN', 'en_IN', 'en-US', 'en_US', 'english'] };
  }

  // Devanagari script: Marathi, Hindi, etc.
  if (/[\u0900-\u097F]/.test(text)) {
    // ळ (\u0933) is unique to Marathi in regular use compared to Hindi.
    // Also check for common Marathi words vs Hindi words.
    const hasMarathiLla = /[\u0933]/.test(text);
    const marathiWords = /\b(आहे|नाही|करून|पण|का|आणि|होता|होती|होते|आहेत|या|त्या|ह्या|तुझा|माझा|आपला|कसा|कशी|कसे|वर|खाली|मध्ये|नवीन|करणे|करतो|करते|शेतकरी)\b/;
    const hindiWords = /\b(है|हैं|था|थी|थे|और|का|की|के|को|ने|से|पर|नहीं|कर|रहा|रही|रहे|हो|सकता|सकती|सकते|क्या|किया|दिया|लिया)\b/;

    const isMarathi = hasMarathiLla || marathiWords.test(text);
    const isHindi = hindiWords.test(text);

    if (isMarathi && !isHindi) {
      return {
        lang: 'mr-IN',
        voiceSearch: ['mr-IN', 'mr_IN', 'marathi', 'hi-IN', 'hi_IN', 'hindi']
      };
    } else if (isHindi && !isMarathi) {
      return {
        lang: 'hi-IN',
        voiceSearch: ['hi-IN', 'hi_IN', 'hindi', 'mr-IN', 'mr_IN', 'marathi']
      };
    } else {
      // General fallback within Devanagari.
      // If Lla is present, it's Marathi.
      if (hasMarathiLla || text.includes('मराठी') || text.includes('शेतकरी')) {
        return {
          lang: 'mr-IN',
          voiceSearch: ['mr-IN', 'mr_IN', 'marathi', 'hi-IN', 'hi_IN', 'hindi']
        };
      }
      return {
        lang: 'hi-IN',
        voiceSearch: ['hi-IN', 'hi_IN', 'hindi', 'mr-IN', 'mr_IN', 'marathi']
      };
    }
  }

  // Tamil script
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return { lang: 'ta-IN', voiceSearch: ['ta-IN', 'ta_IN', 'tamil'] };
  }
  // Telugu script
  if (/[\u0C00-\u0C7F]/.test(text)) {
    return { lang: 'te-IN', voiceSearch: ['te-IN', 'te_IN', 'telugu'] };
  }
  // Kannada script
  if (/[\u0C80-\u0CFF]/.test(text)) {
    return { lang: 'kn-IN', voiceSearch: ['kn-IN', 'kn_IN', 'kannada'] };
  }
  // Bengali script
  if (/[\u0980-\u09FF]/.test(text)) {
    return { lang: 'bn-IN', voiceSearch: ['bn-IN', 'bn_IN', 'bengali'] };
  }
  // Gujarati script
  if (/[\u0A80-\u0AFF]/.test(text)) {
    return { lang: 'gu-IN', voiceSearch: ['gu-IN', 'gu_IN', 'gujarati'] };
  }
  // Gurmukhi (Punjabi) script
  if (/[\u0A00-\u0A7F]/.test(text)) {
    return { lang: 'pa-IN', voiceSearch: ['pa-IN', 'pa_IN', 'punjabi'] };
  }
  // Malayalam script
  if (/[\u0D00-\u0D7F]/.test(text)) {
    return { lang: 'ml-IN', voiceSearch: ['ml-IN', 'ml_IN', 'malayalam'] };
  }

  // Default: English (India/US/Generic)
  return {
    lang: 'en-IN',
    voiceSearch: ['en-IN', 'en_IN', 'en-US', 'en_US', 'english']
  };
};

/**
 * Pre-warms the speechSynthesis audio context on browser user-gestures (e.g. click).
 * Required for autoplaying speech on mobile Safari/iOS and mobile Chrome.
 */
export const unlockSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const utterance = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(utterance);
      console.log('TTS engine pre-warmed / unlocked successfully.');
    } catch (e) {
      console.warn('Failed to pre-warm TTS:', e);
    }
  }
};

/**
 * Stops/cancels any active speech synthesis.
 */
export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      delete (window as any)._activeUtterance;
      console.log('Speech synthesis cancelled/stopped.');
    } catch (e) {
      console.warn('Failed to stop speech synthesis:', e);
    }
  }
};

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onstart?: () => void;
  onend?: () => void;
  onerror?: (e: any) => void;
  onboundary?: (event: any) => void;
}

/**
 * Universal cross-browser text-to-speech speaker that automatically selects the appropriate
 * voice based on language detection and supports graceful fallbacks.
 */
export const speakText = (text: string, options?: SpeakOptions) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.error('SpeechSynthesis is not supported on this device/browser.');
    if (options?.onerror) options.onerror(new Error('SpeechSynthesis not supported'));
    return;
  }

  try {
    // 1. Cancel any active speech
    window.speechSynthesis.cancel();

    // 2. Create the utterance object
    const utterance = new SpeechSynthesisUtterance(text);

    // Keep global reference to avoid garbage collection bug on long speech in Chrome
    (window as any)._activeUtterance = utterance;

    // 3. Set basic parameters
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;

    // 4. Detect language and configure voice selection
    const { lang, voiceSearch } = detectLanguage(text);
    utterance.lang = lang;

    // 5. Select the best voice from available voices
    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) {
        return null;
      }

      for (const pattern of voiceSearch) {
        const match = voices.find(v => {
          const vLang = v.lang.toLowerCase().replace('_', '-');
          const p = pattern.toLowerCase();
          return vLang === p || vLang.startsWith(p + '-') || v.name.toLowerCase().includes(p);
        });
        if (match) return match;
      }
      return null;
    };

    const bestVoice = selectVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
      console.log(`TTS Voice selected: ${bestVoice.name} (${bestVoice.lang}) for text language: ${lang}`);
    } else {
      console.warn(`No specific voice found matching language search patterns: ${voiceSearch.join(', ')}. Relying on browser default for lang: ${lang}`);
    }

    // 6. Hook up event listeners
    if (options?.onstart) utterance.onstart = options.onstart;
    
    // Wrap onend and onerror to clean up the global reference when done
    utterance.onend = () => {
      delete (window as any)._activeUtterance;
      if (options?.onend) options.onend();
    };

    utterance.onerror = (event) => {
      delete (window as any)._activeUtterance;
      if (options?.onerror) options.onerror(event);
    };

    if (options?.onboundary) utterance.onboundary = options.onboundary;

    // 7. Execute speech synthesis
    window.speechSynthesis.speak(utterance);

    // 8. Fix chrome/safari getVoices loading delay:
    // If voices are empty, wait for voiceschanged and re-apply voice if speech is still active.
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      const handleVoicesChanged = () => {
        const freshVoice = selectVoice();
        if (freshVoice && (window as any)._activeUtterance === utterance) {
          utterance.voice = freshVoice;
          console.log(`TTS Voices changed: dynamically updated active utterance to voice: ${freshVoice.name}`);
        }
        window.speechSynthesis.onvoiceschanged = null; // cleanup
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }
  } catch (error: any) {
    console.error('Error in speakText:', error);
    if (options?.onerror) options.onerror(error);
  }
};

// Warm up the voices cache on module load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  } catch (e) {
    console.warn('Failed to pre-warm speechSynthesis voices list:', e);
  }
}
