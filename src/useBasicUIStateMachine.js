// @flow

import { useCallback, useRef, useState } from 'react';
import type {
  StateType,
  TransitionType,
} from './state_machine/implementations/basic_ui/enums';
import makeBasicUIStateMachine from './state_machine/implementations/basic_ui/makeBasicUIStateMachine';

export default function useBasicUIStateMachine(): [
  StateType,
  (TransitionType) => void,
] {
  const machine = useRef(makeBasicUIStateMachine());
  const [state, setState] = useState(machine.current.getCurrentState());
  const transition = useCallback(
    (event) => {
      machine.current.transition(event);
      const newState = machine.current.getCurrentState();
      setState(newState);
    },
    [machine, setState],
  );
  return [state, transition];
}
