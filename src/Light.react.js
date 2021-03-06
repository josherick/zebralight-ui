// @flow
import * as React from 'react';
import { useCallback } from 'react';

import ZebralightButton from './ZebralightButton.react.js';
import Bulb from './Bulb.react.js';
import Information from './Information.react.js';

import useTimer from './useTimer.js';
import useBasicUIStateMachine from './useBasicUIStateMachine.js';

import {
  State,
  Transition,
} from './state_machine/implementations/basic_ui/enums.js';
import { getLevel } from './lampInformation.js';

type Props = {};

const BATTERY_INDICATOR_TIMEOUT_MS = 4000;

export default function Light(_props: Props): React.Element<'div'> {
  const [state, transition, memory] = useBasicUIStateMachine();
  const onBatteryIndicatorFinished = useCallback(() => {
    transition(Transition.BATTERY_INDICATOR_FINISHED);
    return false;
  }, [transition]);

  const [resetBatteryIndicatorTimer, _] = useTimer(
    BATTERY_INDICATOR_TIMEOUT_MS,
    onBatteryIndicatorFinished,
  );

  const onEvent = useCallback(
    (event) => {
      const newState = transition(event);
      if (state !== newState && newState === State.BATTERY_INDICATOR) {
        resetBatteryIndicatorTimer();
      }
    },
    [resetBatteryIndicatorTimer, state, transition],
  );

  return (
    <div className="light-background">
      <div className="information-container">
        <Information lampState={state} memory={memory} />
      </div>
      <div className="bulb-container">
        <div className="centered-in-container">
          <Bulb lampState={state} />
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
