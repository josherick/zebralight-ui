// @flow
import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';

import ZebralightButton from './ZebralightButton.react.js';
import Bulb from './Bulb.react.js';
import Information from './Information.react.js';
import TimeoutBar from './TimeoutBar.react.js';

import useTimer from './useTimer.js';
import useBasicUIStateMachine from './useBasicUIStateMachine.js';

import {
  State,
  Transition,
} from './state_machine/implementations/basic_ui/enums.js';

import { useSettings } from './SettingsContext.js';

import type { TimeoutBarHandle } from './TimeoutBar.react.js';

type Props = {};

const BATTERY_INDICATOR_TIMEOUT_MS = 1920;
const BASE_LONG_PRESS_BEAT_TIMEOUT_MS = 600;
const BASE_MULTI_SINGLE_PRESS_TIMEOUT_MS = 600;
const MULTI_DOUBLE_PRESS_TIMEOUT_MS = 12000;

function isButtonDownEvent(event: string): boolean {
  return (
    event === Transition.PRESS_START || event === Transition.LONG_PRESS_BEAT
  );
}

function isButtonUpUserEvent(event: string): boolean {
  return (
    event === Transition.SHORT_PRESS_RELEASE ||
    event === Transition.LONG_PRESS_RELEASE
  );
}

export default function Light(_props: Props): React.Element<'div'> {
  const { settings } = useSettings();
  const multiplier = settings.timeoutMultiplier === '4x' ? 4 : settings.timeoutMultiplier === '2x' ? 2 : 1;
  const [state, transition, memory, hasTransition, fullFactoryReset] =
    useBasicUIStateMachine();
  const timeoutBarRef = useRef<TimeoutBarHandle | null>(null);
  const onBatteryIndicatorFinished = useCallback(() => {
    transition(Transition.BATTERY_INDICATOR_FINISHED);
    return false;
  }, [transition]);

  const [resetBatteryIndicatorTimer] = useTimer(
    BATTERY_INDICATOR_TIMEOUT_MS,
    onBatteryIndicatorFinished,
  );

  const prevStateRef = useRef(state);
  useEffect(() => {
    if (prevStateRef.current !== state && state === State.BATTERY_INDICATOR) {
      resetBatteryIndicatorTimer();
      if (timeoutBarRef.current) {
        timeoutBarRef.current.stop();
      }
    }
    prevStateRef.current = state;
  }, [state, resetBatteryIndicatorTimer]);

  const updateTimeoutBar = useCallback(
    (event) => {
      const bar = timeoutBarRef.current;
      if (!bar) return;

      if (isButtonDownEvent(event)) {
        if (hasTransition(Transition.LONG_PRESS_BEAT)) {
          bar.start(BASE_LONG_PRESS_BEAT_TIMEOUT_MS * multiplier);
        } else {
          bar.stop();
        }
      } else {
        if (hasTransition(Transition.MULTI_SINGLE_PRESS_TIMEOUT)) {
          bar.start(BASE_MULTI_SINGLE_PRESS_TIMEOUT_MS * multiplier);
        } else if (hasTransition(Transition.MULTI_DOUBLE_PRESS_TIMEOUT)) {
          bar.start(MULTI_DOUBLE_PRESS_TIMEOUT_MS);
        } else {
          bar.stop();
        }
      }
    },
    [hasTransition, multiplier],
  );

  const onEvent = useCallback(
    (event) => {
      const prevState = state;
      const newState = transition(event);
      const stateChanged = prevState !== newState;
      // Only update the bar if the state changed, or if this is a
      // user-initiated event (button press/release). Don't restart
      // the bar on no-op timer events (e.g. MULTI_SINGLE_PRESS_TIMEOUT
      // firing on a state that doesn't handle it).
      if (stateChanged || isButtonDownEvent(event) || isButtonUpUserEvent(event)) {
        updateTimeoutBar(event);
      }
    },
    [state, transition, updateTimeoutBar],
  );

  return (
    <div className="light-background">
      <div className="information-container">
        {settings.timeoutIndicator !== 'off' && (
          <TimeoutBar
            ref={timeoutBarRef}
            mode={settings.timeoutIndicator}
          />
        )}
        <Information lampState={state} memory={memory} onFactoryReset={fullFactoryReset} />
      </div>
      <div className="bulb-container">
        <div className="centered-in-container">
          <Bulb lampState={state} memory={memory} />
        </div>
      </div>
      <div className="button-container">
        <div className="centered-in-container">
          <ZebralightButton onEvent={onEvent} />
        </div>
      </div>
    </div>
  );
}
