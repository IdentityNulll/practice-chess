export interface SpeakOptions {
  voiceURI?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function loadVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported) return [];
  return window.speechSynthesis.getVoices();
}

/** Browsers load the voice list asynchronously; callers should re-read loadVoices() when this fires. */
export function subscribeVoicesChanged(callback: () => void): () => void {
  if (!isSpeechSupported) return () => {};
  window.speechSynthesis.addEventListener('voiceschanged', callback);
  return () => window.speechSynthesis.removeEventListener('voiceschanged', callback);
}

/** Cancels any utterance in progress and speaks this one — coach lines should never overlap or queue. */
export function speak(text: string, options: SpeakOptions = {}): void {
  if (!isSpeechSupported || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (options.voiceURI) {
    const voice = loadVoices().find((v) => v.voiceURI === options.voiceURI);
    if (voice) utterance.voice = voice;
  }
  utterance.rate = options.rate ?? 1;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.volume ?? 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (!isSpeechSupported) return;
  window.speechSynthesis.cancel();
}
