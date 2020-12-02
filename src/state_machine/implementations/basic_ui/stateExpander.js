// @flow

import type {
  LevelType,
  StateType,
  StateSuffixType,
  StatePrefixType,
  TransitionType,
} from './enums.js';

import type { StateMachineDefinition } from '../../createStateMachine.js';

import { Level, StatePrefix, State } from './enums.js';

export type CollapsedConfigurationType = {
  forStates: StateType[],
  actions?: {
    onEnter?: (StateType) => void,
  },
  transitions: {
    [TransitionType]: (StateType) => StateType,
  },
}[];

export function expandStateDef(
  collapsedStates: CollapsedConfigurationType,
): StateMachineDefinition {
  // Since there is lots of sketchy type conversions involved, ensure that all
  // states are valid.
  const validStates = new Set(Object.values(State));
  // Process expansions, applying the same configuration to each state.
  const expandedStateDefinition = {};
  collapsedStates.forEach((definition) => {
    const states = definition.forStates;
    states.forEach((state) => {
      if (!validStates.has(state)) {
        throw new Error(`Invalid state "${state}"`);
      }
      if (
        Object.prototype.hasOwnProperty.call(expandedStateDefinition, state)
      ) {
        throw new Error(`Duplicate state "${state}"`);
      }
      expandedStateDefinition[state] = definition;
    });
  });
  return expandedStateDefinition;
}

function makeCombinations(
  componentSets: Array<Array<StateSuffixType> | Array<StatePrefixType>>,
): string[][] {
  // $FlowIgnore[incompatible-return] TyPe sYsTeMs ArE fUn
  return componentSets.reduce((solutionAcc, componentSet) =>
    // $FlowIgnore[speculation-ambiguous] tYpE SyStEmS aRe Fun
    // $FlowIgnore[incompatible-call] TyPe sYsTeMs ArE fUn
    solutionAcc.reduce(
      (incrementalSolutionAcc, incrementalSolution) =>
        incrementalSolutionAcc.concat(
          componentSet.map((component) =>
            // $FlowIgnore[incompatible-call] tYpE SyStEmS aRe FuN
            [].concat(incrementalSolution, component),
          ),
        ),
      [],
    ),
  );
}

export function makeStates(
  levels: Array<LevelType>,
  suffixes: Array<StateSuffixType>,
): StateType[] {
  const prefixes = ([]: Array<StatePrefixType>);
  levels.forEach((level) => {
    switch (level) {
      case Level.L:
        prefixes.push(
          StatePrefix.L1,
          StatePrefix.L2_1,
          StatePrefix.L2_2,
          StatePrefix.L2_3,
        );
        break;
      case Level.M:
        prefixes.push(
          StatePrefix.M1,
          StatePrefix.M2_1,
          StatePrefix.M2_2,
          StatePrefix.M2_3,
        );
        break;
      case Level.H:
        prefixes.push(
          StatePrefix.H1,
          StatePrefix.H2_1,
          StatePrefix.H2_2,
          StatePrefix.H2_3,
        );
        break;
      case Level.STROBE:
        prefixes.push(
          StatePrefix.STROBE1_1,
          StatePrefix.STROBE1_2,
          StatePrefix.STROBE1_3,
          StatePrefix.STROBE1_4,
        );
        break;
      default:
        throw new Error(`Invalid level "${level}"`);
    }
  });
  const combinations = makeCombinations([prefixes, suffixes]);
  return combinations.map((arr) => ((arr.join('.'): any): StateType));
}
