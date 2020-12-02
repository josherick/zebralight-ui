// @flow
import type {
  StateType,
  TransitionType,
} from './implementations/basic_ui/enums.js';

export type StateMachineDefinition = {
  [StateType]: {
    actions?: {
      onEnter?: (StateType) => void,
    },
    transitions: {
      [TransitionType]: (StateType) => StateType,
    },
  },
};

export type StateMachine = {
  getCurrentState: () => StateType,
  transition: (TransitionType) => void,
};

export default function createStateMachine(
  initialState: StateType,
  states: StateMachineDefinition,
): StateMachine {
  let currentState = initialState;
  return {
    getCurrentState: () => currentState,
    transition: (event) => {
      const stateFn = states[currentState].transitions[event];
      if (stateFn == null) {
        // Keep the same state if there is no transition specified.
        console.log(
          `[transition] ${currentState} --(${event})--> ${currentState}`,
        );
        return;
      }
      const newState = stateFn(currentState);
      console.log(`[transition] ${currentState} --(${event})--> ${newState}`);
      currentState = newState;
      states[newState].actions &&
        states[newState].actions.onEnter &&
        states[newState].actions.onEnter(newState);
    },
  };
}
