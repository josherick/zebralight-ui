// @flow

import { useCallback, useEffect, useRef, useState } from 'react';

export default function useResettableTimer(
  delayMs: number,
  callback: () => boolean,
): [() => void, () => void] {
  const timer = useRef(null);
  const [startMs, setStartMs] = useState<number>(Date.now());
  const [hasTriggered, setHasTriggered] = useState<boolean>(true);

  const restart = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = null;
    setStartMs(Date.now());
    setHasTriggered(false);
  }, [setStartMs, setHasTriggered]);

  const cancel = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = null;
    setHasTriggered(true);
  }, [setStartMs, setHasTriggered]);

  useEffect(() => {
    if (hasTriggered) {
      return () => {};
    }
    const timerDelayMs = delayMs - (Date.now() - startMs);
    timer.current = setTimeout(() => {
      const shouldRestart = callback();
      if (!shouldRestart) {
        setHasTriggered(true);
      } else {
        restart();
      }
    }, timerDelayMs);

    return () => clearTimeout(timer.current);
  }, [callback, delayMs, restart, startMs, setHasTriggered, timer]);

  return [restart, cancel];
}
