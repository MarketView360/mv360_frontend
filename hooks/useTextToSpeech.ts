"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type TTSState = "idle" | "speaking" | "paused";

interface UseTextToSpeechOptions {
  rate?: number; // 0.1 to 10, default 1
  pitch?: number; // 0 to 2, default 1
  volume?: number; // 0 to 1, default 1
  voiceURI?: string; // Specific voice to use
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface Voice {
  name: string;
  lang: string;
  voiceURI: string;
  default: boolean;
}

interface UseTextToSpeechResult {
  state: TTSState;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: Voice[];
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVoice: (voiceURI: string) => void;
  currentVoice: Voice | null;
}

/**
 * Hook for Text-to-Speech using Web Speech API
 */
export function useTextToSpeech(
  options: UseTextToSpeechOptions = {},
): UseTextToSpeechResult {
  const { rate = 1, pitch = 1, volume = 1, voiceURI, onEnd, onError } = options;

  const [state, setState] = useState<TTSState>("idle");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(
    voiceURI ?? null,
  );
  const [isSupported, setIsSupported] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if Web Speech API is supported
  useEffect(() => {
    const supported =
      typeof window !== "undefined" && "speechSynthesis" in window;
    setIsSupported(supported);

    if (!supported) {
      return;
    }

    // Load voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const voiceList: Voice[] = availableVoices.map((v) => ({
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        default: v.default,
      }));
      setVoices(voiceList);

      // Set default voice if not already set
      if (!selectedVoiceURI && voiceList.length > 0) {
        const defaultVoice =
          voiceList.find((v) => v.default) ||
          voiceList.find((v) => v.lang.startsWith("en")) ||
          voiceList[0];
        if (defaultVoice) {
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      }
    };

    // Voices may not be immediately available
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoiceURI]);

  // Get current voice object
  const currentVoice =
    voices.find((v) => v.voiceURI === selectedVoiceURI) ?? null;

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) {
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Set voice if specified
      if (selectedVoiceURI) {
        const voice = speechSynthesis
          .getVoices()
          .find((v) => v.voiceURI === selectedVoiceURI);
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.onstart = () => {
        setState("speaking");
      };

      utterance.onend = () => {
        setState("idle");
        onEnd?.();
      };

      utterance.onerror = (event) => {
        setState("idle");
        if (event.error !== "canceled") {
          onError?.(`Speech error: ${event.error}`);
        }
      };

      utterance.onpause = () => {
        setState("paused");
      };

      utterance.onresume = () => {
        setState("speaking");
      };

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [isSupported, rate, pitch, volume, selectedVoiceURI, onEnd, onError],
  );

  const pause = useCallback(() => {
    if (isSupported && state === "speaking") {
      speechSynthesis.pause();
    }
  }, [isSupported, state]);

  const resume = useCallback(() => {
    if (isSupported && state === "paused") {
      speechSynthesis.resume();
    }
  }, [isSupported, state]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setState("idle");
    }
  }, [isSupported]);

  const setVoice = useCallback((uri: string) => {
    setSelectedVoiceURI(uri);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    state,
    isSpeaking: state === "speaking",
    isPaused: state === "paused",
    isSupported,
    voices,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    currentVoice,
  };
}
