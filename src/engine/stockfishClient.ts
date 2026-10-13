import { parseInfoLine, parseBestMoveLine, type ParsedInfoLine } from './uci';
import type { EngineEvalInfo } from '../types';

const ENGINE_URL = `${import.meta.env.BASE_URL}stockfish/stockfish-19-lite-single.js`;

export interface GoOptions {
  depth?: number;
  movetimeMs?: number;
  multipv?: number;
}

/**
 * Promise/callback wrapper around the Stockfish WASM Web Worker.
 * Each instance owns its own worker so bot play and an analysis eval bar
 * can run independent engines without fighting over UCI state.
 */
export class StockfishClient {
  private worker: Worker;
  private uciOkResolvers: Array<() => void> = [];
  private readyOkResolvers: Array<() => void> = [];
  private goResolver: ((result: EngineEvalInfo) => void) | null = null;
  private infoByMultipv = new Map<number, ParsedInfoLine>();
  private lastDepth = 0;
  private queue: Promise<unknown> = Promise.resolve();
  private terminated = false;

  /** Streaming callback fired on every parsed "info" line during a go(). */
  onInfo: ((info: EngineEvalInfo) => void) | null = null;

  constructor() {
    this.worker = new Worker(ENGINE_URL, { name: 'stockfish' });
    this.worker.onmessage = (ev: MessageEvent<string>) => this.handleLine(ev.data);
    this.worker.onerror = (ev) => {
      // eslint-disable-next-line no-console
      console.error('Stockfish worker error', ev);
    };
  }

  private handleLine(line: string) {
    if (typeof line !== 'string') return;
    if (line === 'uciok') {
      this.uciOkResolvers.shift()?.();
      return;
    }
    if (line === 'readyok') {
      this.readyOkResolvers.shift()?.();
      return;
    }
    if (line.startsWith('info ')) {
      const parsed = parseInfoLine(line);
      if (parsed && parsed.pv.length > 0) {
        this.infoByMultipv.set(parsed.multipv, parsed);
        this.lastDepth = Math.max(this.lastDepth, parsed.depth);
        this.onInfo?.(this.buildEvalInfo());
      }
      return;
    }
    if (line.startsWith('bestmove')) {
      const { bestMoveUci } = parseBestMoveLine(line);
      const result = this.buildEvalInfo(bestMoveUci);
      this.goResolver?.(result);
      this.goResolver = null;
    }
  }

  private buildEvalInfo(bestMoveUciOverride?: string | null): EngineEvalInfo {
    const lines = [...this.infoByMultipv.values()].sort((a, b) => a.multipv - b.multipv);
    const top = lines[0] ?? null;
    return {
      depth: this.lastDepth,
      cp: top?.cp ?? null,
      mate: top?.mate ?? null,
      bestMoveUci: bestMoveUciOverride ?? top?.pv[0] ?? null,
      pvUci: top?.pv ?? [],
      multipv: lines.map((l) => ({ moveUci: l.pv[0], cp: l.cp, mate: l.mate, rank: l.multipv })),
    };
  }

  private send(cmd: string) {
    if (this.terminated) return;
    this.worker.postMessage(cmd);
  }

  /** Serializes engine interactions so concurrent callers (hint + bot move, etc.) don't interleave UCI commands. */
  private exclusive<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(fn, fn);
    // Swallow rejections in the chain anchor so one failure doesn't jam the queue.
    this.queue = run.catch(() => undefined);
    return run;
  }

  async init(): Promise<void> {
    await this.exclusive(async () => {
      await new Promise<void>((resolve) => {
        this.uciOkResolvers.push(resolve);
        this.send('uci');
      });
      await this.isReady();
    });
  }

  isReady(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.readyOkResolvers.push(resolve);
      this.send('isready');
    });
  }

  setOption(name: string, value: string | number | boolean): void {
    this.send(`setoption name ${name} value ${value}`);
  }

  newGame(): void {
    this.send('ucinewgame');
  }

  setPositionFen(fen: string): void {
    this.send(`position fen ${fen}`);
  }

  stop(): void {
    this.send('stop');
  }

  go(options: GoOptions = {}): Promise<EngineEvalInfo> {
    return this.exclusive(async () => {
      if (options.multipv && options.multipv > 1) {
        this.setOption('MultiPV', options.multipv);
      } else {
        this.setOption('MultiPV', 1);
      }
      await this.isReady();
      this.infoByMultipv.clear();
      this.lastDepth = 0;
      return new Promise<EngineEvalInfo>((resolve) => {
        this.goResolver = resolve;
        const parts = ['go'];
        if (options.depth) parts.push('depth', String(options.depth));
        if (options.movetimeMs) parts.push('movetime', String(options.movetimeMs));
        if (!options.depth && !options.movetimeMs) parts.push('depth', '12');
        this.send(parts.join(' '));
      });
    });
  }

  terminate(): void {
    this.terminated = true;
    this.worker.terminate();
  }
}
