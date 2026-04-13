// @flow
import * as React from 'react';
import { useRef, useImperativeHandle, forwardRef } from 'react';

export type TimeoutBarHandle = {
  start: (durationMs: number) => void,
  stop: () => void,
};

type Props = {
  mode: string,
};

const TimeoutBar = forwardRef<Props, TimeoutBarHandle>(function TimeoutBar(
  { mode },
  ref,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    start: (durationMs: number) => {
      const el = innerRef.current;
      if (!el) return;
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = `timeout-shrink ${durationMs}ms linear forwards`;
    },
    stop: () => {
      const el = innerRef.current;
      if (!el) return;
      el.style.animation = 'none';
      el.style.width = '0';
    },
  }));

  const className = mode === 'prominent'
    ? 'timeout-bar prominent'
    : 'timeout-bar';

  return (
    <div className={className}>
      <div className="timeout-bar-inner" ref={innerRef} />
    </div>
  );
});

export default TimeoutBar;
