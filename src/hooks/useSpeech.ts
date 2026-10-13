import { useCallback, useEffect, useState } from 'react';
import { isSpeechSupported, loadVoices, speak, stopSpeaking, subscribeVoicesChanged } from '../speech/speechService';

export function useSpeech() {
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [voiceURI, setVoiceURI] = useState<string | undefined>(undefined);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setVoices(loadVoices());
    return subscribeVoicesChanged(() => setVoices(loadVoices()));
  }, []);

  const say = useCallback(
    (text: string, overrideVoiceURI?: string) => {
      if (muted) return;
      speak(text, { voiceURI: overrideVoiceURI ?? voiceURI, rate });
    },
    [muted, voiceURI, rate],
  );

  /** Speaks as a given coach: applies the coach's own pitch/rate "voice", scaled by the user's speed slider. */
  const sayAs = useCallback(
    (coachVoice: { pitch: number; rate: number }, text: string) => {
      if (muted) return;
      speak(text, { voiceURI, rate: rate * coachVoice.rate, pitch: coachVoice.pitch });
    },
    [muted, voiceURI, rate],
  );

  return {
    supported: isSpeechSupported,
    muted,
    setMuted,
    rate,
    setRate,
    voiceURI,
    setVoiceURI,
    voices,
    say,
    sayAs,
    stop: stopSpeaking,
  };
}

export type UseSpeech = ReturnType<typeof useSpeech>;
