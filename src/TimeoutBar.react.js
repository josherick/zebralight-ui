// @flow
import * as React from 'react';
import { useRef, useImperativeHandle, forwardRef } from 'react';

export type TimeoutBarHandle = {
  start: (durationMs: number) => void,
  stop: () => void,
};

const TimeoutBar = forwardRef<{}, TimeoutBarHandle>(function TimeoutBar(
  _props,
  ref,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    start: (durationMs: number) => {
      const el = innerRef.current;
      if (!el) return;
      // Restart animation: remove, force reflow, re-apply.
      el.style.animation = 'none';
      // Force reflow to reset the animation.
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

  return (
    <div className="timeout-bar">
      <div className="timeout-bar-inner" ref={innerRef} />
    </div>
  );
});

export default TimeoutBar;
