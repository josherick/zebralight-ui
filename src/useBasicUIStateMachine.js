// @flow

import { useCallback, useRef, useState } from 'react';
import type {
  StateType,
  TransitionType,
} from './state_machine/implementations/basic_ui/enums.js';
import type { MemoryInterface } from './state_machine/implementations/basic_ui/memory.js';
import type { StateMachine } from './state_machine/createStateMachine.js';
import makeBasicUIStateMachine from './state_machine/implementations/basic_ui/makeBasicUIStateMachine.js';

export default function useBasicUIStateMachine(): [
  StateType,
  (TransitionType) => StateType,
  MemoryInterface,
] {
  const ref = useRef<[StateMachine, MemoryInterface]>(
    makeBasicUIStateMachine(),
  );
  const [machine, memory] = ref.current;
  const [state, setState] = useState(machine.getCurrentState());
  const transition = useCallback(
    (event) => {
      machine.transition(event);
      const newState = machine.getCurrentState();
      setState(newState);
      return newState;
    },
    [machine, setState],
  );
  return [state, transition, memory];
}
