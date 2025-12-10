"use client";

import { useState, useRef, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export type VoiceInputState =
  | "idle"
  | "recording"
  | "processing"
  | "error";

interface UseVoiceInputOptions {
  token: string | null;
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  model?: "whisper-large-v3-turbo" | "whisper-large-v3";
  language?: string;
}

interface UseVoiceInputResult {
  state: VoiceInputState;
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  cancelRecording: () => void;
  duration: number;
}

/**
 * Hook for voice input with Groq Whisper transcription
 */
export function useVoiceInput(
  options: UseVoiceInputOptions,
): UseVoiceInputResult {
  const { token, onTranscript, onError, model, language } = options;

  const [state, setState] = useState<VoiceInputState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    chunksRef.current = [];
    setDuration(0);
  }, []);

  const startRecording = useCallback(async () => {
    if (!token) {
      setError("Please log in to use voice input");
      setState("error");
      onError?.("Please log in to use voice input");
      return;
    }

    try {
      cleanup();
      setError(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder with webm format (widely supported)
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setError("Recording error occurred");
        setState("error");
        onError?.("Recording error occurred");
        cleanup();
      };

      // Start recording
      recorder.start(100); // Collect data every 100ms
      setState("recording");

      // Start duration timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to access microphone";
      setError(message);
      setState("error");
      onError?.(message);
    }
  }, [token, cleanup, onError]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!mediaRecorderRef.current || state !== "recording") {
      return null;
    }

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        resolve(null);
        return;
      }

      recorder.onstop = async () => {
        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Stop stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Create audio blob
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];

        // Check minimum duration (at least 0.5 seconds)
        if (duration < 0.5) {
          setError("Recording too short");
          setState("idle");
          resolve(null);
          return;
        }

        // Send to backend for transcription
        setState("processing");

        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          if (model) formData.append("model", model);
          if (language) formData.append("language", language);

          const response = await fetch(`${API_BASE}/ai/transcribe`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(
              data.message || `Transcription failed (${response.status})`,
            );
          }

          const data = await response.json();
          const transcript = data.text?.trim() || "";

          if (transcript) {
            onTranscript?.(transcript);
          }

          setState("idle");
          resolve(transcript);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Transcription failed";
          setError(message);
          setState("error");
          onError?.(message);
          resolve(null);
        }
      };

      recorder.stop();
    });
  }, [state, duration, token, model, language, onTranscript, onError]);

  const cancelRecording = useCallback(() => {
    cleanup();
    setState("idle");
    setError(null);
  }, [cleanup]);

  return {
    state,
    isRecording: state === "recording",
    isProcessing: state === "processing",
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    duration,
  };
}
