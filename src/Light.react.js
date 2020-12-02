// @flow
import * as React from 'react';
import { useCallback } from 'react';
import ZebralightButton from './ZebralightButton.react.js';
import useBasicUIStateMachine from './useBasicUIStateMachine.js';
import { getLevel } from './lampInformation.js';
import Bulb from './Bulb.react.js';

type Props = {};

export default function Light(_props: Props): React.Element<'div'> {
  const [state, transition] = useBasicUIStateMachine();
  const onEvent = useCallback(
    (event) => {
      transition(event);
    },
    [transition],
  );

  return (
    <div className="light-background">
      <div className="bulb-container">
        <div className="centered-in-container unselectable">
          <Bulb lampState={state} />
        </div>
      </div>
      <div className="button-container">
        <div className="centered-in-container">
          <ZebralightButton onEvent={onEvent} />
        </div>
      </div>
      <div className="text-container">
        <div className="centered-in-container unselectable">
          {getLevel(state)}
        </div>
      </div>
    </div>
  );
}
