import { useEffect, useRef, useState } from 'react';
import { StockfishClient } from '../engine/stockfishClient';

/** Owns one Stockfish Web Worker while `enabled` is true, tearing it down otherwise. */
export function useStockfishEngine(enabled: boolean = true) {
  const clientRef = useRef<StockfishClient | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsReady(false);
      return;
    }
    const client = new StockfishClient();
    clientRef.current = client;
    setIsReady(false);
    client
      .init()
      .then(() => setIsReady(true))
      .catch(() => setIsReady(false));

    return () => {
      client.terminate();
      if (clientRef.current === client) clientRef.current = null;
    };
  }, [enabled]);

  return { engineRef: clientRef, isReady };
}
