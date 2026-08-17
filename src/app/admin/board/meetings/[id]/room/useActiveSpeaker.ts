"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Active speaker detection via the Web Audio API.
 *
 * Each stream gets an AnalyserNode; every 200 ms the loudest stream above a
 * floor wins. The floor matters — without it, room tone alone makes the
 * highlight flicker between silent participants, which is worse than no
 * highlight at all.
 *
 * A speaker stays highlighted for a moment after they stop (HOLD_MS), so the
 * border does not strobe through the natural gaps in a sentence.
 */

const SAMPLE_MS = 200;
const SPEAKING_FLOOR = 0.02;
const HOLD_MS = 1200;

type Source = { id: string; stream: MediaStream | null };

export function useActiveSpeaker(sources: Source[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const nodes = useRef<
    Map<string, { analyser: AnalyserNode; source: MediaStreamAudioSourceNode }>
  >(new Map());
  const lastSpoke = useRef<{ id: string | null; at: number }>({
    id: null,
    at: 0,
  });

  // A stable key so the effect re-runs when the set of streams changes, but not
  // on every render of the parent.
  const key = sources
    .map((s) => `${s.id}:${s.stream?.id ?? "none"}`)
    .sort()
    .join("|");

  useEffect(() => {
    const withAudio = sources.filter(
      (s) => s.stream && s.stream.getAudioTracks().length > 0
    );
    if (withAudio.length === 0) {
      setActive(null);
      return;
    }

    if (!contextRef.current) {
      try {
        contextRef.current = new AudioContext();
      } catch {
        // No Web Audio (or blocked before a user gesture). The grid simply
        // renders without a highlight rather than failing.
        return;
      }
    }
    const context = contextRef.current;

    // Attach analysers for new streams, drop ones that have gone.
    const seen = new Set<string>();
    for (const { id, stream } of withAudio) {
      seen.add(id);
      if (nodes.current.has(id)) continue;
      try {
        const source = context.createMediaStreamSource(stream as MediaStream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        // Deliberately NOT connected to the destination: this is measurement,
        // and routing it to the speakers would echo every participant.
        nodes.current.set(id, { analyser, source });
      } catch {
        /* stream ended between render and here */
      }
    }
    nodes.current.forEach((node, id) => {
      if (seen.has(id)) return;
      try {
        node.source.disconnect();
      } catch {
        /* already disconnected */
      }
      nodes.current.delete(id);
    });

    const buffer = new Uint8Array(256);
    const timer = window.setInterval(() => {
      let loudest: { id: string; level: number } | null = null;

      nodes.current.forEach(({ analyser }, id) => {
        analyser.getByteTimeDomainData(buffer);
        // RMS around the 128 midpoint of unsigned time-domain data.
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          const v = (buffer[i] - 128) / 128;
          sum += v * v;
        }
        const level = Math.sqrt(sum / buffer.length);
        if (!loudest || level > loudest.level) loudest = { id, level };
      });

      const now = Date.now();
      const winner = loudest as { id: string; level: number } | null;

      if (winner && winner.level >= SPEAKING_FLOOR) {
        lastSpoke.current = { id: winner.id, at: now };
        setActive(winner.id);
      } else if (now - lastSpoke.current.at > HOLD_MS) {
        setActive(null);
      }
    }, SAMPLE_MS);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Close the context only when the component using this goes away entirely.
  useEffect(() => {
    return () => {
      nodes.current.forEach((node) => {
        try {
          node.source.disconnect();
        } catch {
          /* already disconnected */
        }
      });
      nodes.current.clear();
      contextRef.current?.close().catch(() => {});
      contextRef.current = null;
    };
  }, []);

  return active;
}
