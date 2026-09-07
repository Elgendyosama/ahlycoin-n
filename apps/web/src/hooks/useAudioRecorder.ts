import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  resetRecording: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = useCallback(async () => {
    try {
      // Revoke previous url if exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
        else if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
        else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const cleanType = mimeType.split(';')[0] || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: cleanType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        cleanupStream();
      };

      mediaRecorder.start(100);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting audio recording:', err);
      setIsRecording(false);
      clearTimer();
      cleanupStream();
    }
  }, [audioUrl]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        const recorder = mediaRecorderRef.current;
        const previousOnStop = recorder.onstop;

        recorder.onstop = (e) => {
          if (previousOnStop) {
            previousOnStop.call(recorder, e);
          }
          const cleanType = (recorder.mimeType || 'audio/webm').split(';')[0] || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: cleanType });
          resolve(blob);
        };

        recorder.stop();
        setIsRecording(false);
        clearTimer();
      } else {
        resolve(audioBlob);
      }
    });
  }, [isRecording, audioBlob]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null; // Ignore onstop blob creation
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearTimer();
    cleanupStream();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  }, [isRecording, audioUrl]);

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      clearTimer();
      cleanupStream();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return {
    isRecording,
    recordingTime,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
  };
}
