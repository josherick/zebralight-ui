// @flow
import * as React from 'react';
import { useCallback } from 'react';
import ZebralightButton from './ZebralightButton.react';
import { parsePrefix } from './state_machine/implementations/basic_ui/stateUtils';
import { getLightBackgroundStyles } from './lightStyles';
import useBasicUIStateMachine from './useBasicUIStateMachine';
import { getLevel } from './lampInformation';

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
    <div
      className="light-background"
      styles={getLightBackgroundStyles(parsePrefix(state))}
    >
      <div className="text-container">
        <div className="centered-in-container">{getLevel(state)}</div>
      </div>
      <div className="button-container">
        <div className="centered-in-container">
          <ZebralightButton onEvent={onEvent} />
        </div>
      </div>
    </div>
  );
}
