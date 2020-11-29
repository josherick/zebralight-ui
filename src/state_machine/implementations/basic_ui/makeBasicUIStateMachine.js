// @flow
import type { StateMachine } from '../../createStateMachine.js';

import type { StateType, StatePrefixType, TransitionType } from './enums.js';

import createStateMachine from '../../createStateMachine.js';

import {
  parseLevel,
  parsePrefix,
  composeState,
  parseOption,
  parseSublevel,
  highestOptionSubcycleStateForLevel,
  incrementLevelForLongPressCycle,
  levelForShortPressCycle,
  nextOptionSubcycleState,
  swapSuffix,
  incrementSuffixForToggleState,
  nextSuffixForIntermediateToggleState,
} from './stateUtils.js';

import {
  Level,
  MemoryVariable,
  State,
  StateSuffix,
  Transition,
} from './enums.js';

import { expandStateDef, makeStates } from './stateExpander.js';

import makeBasicUIMemory from './memory.js';

export default function makeZebralightUIStateMachine(): StateMachine {
  const m = makeBasicUIMemory();
  // Because there are over 100 states, use an "expansion" style to define
  // them, since most perform similar actions.
  const collapsedStateDef = [
    {
      forStates: [State.OFF],
      transitions: {
        [Transition.PRESS_START]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE_PRE_H),
      },
    },

    {
      forStates: [State.BATTERY_INDICATOR],
      transitions: {
        [Transition.BATTERY_INDICATOR_FINISHED]: (_state) => State.OFF,
      },
    },

    {
      forStates: makeStates(
        [Level.L],
        [StateSuffix.CYCLE_PRE_H, StateSuffix.CYCLE_PRE_M]
      ),
      transitions: {
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
        [Transition.SHORT_PRESS_RELEASE]: (state) =>
          m.getLastUsedSublevelState(
            levelForShortPressCycle(state),
            StateSuffix.CYCLE
          ),
      },
    },

    // Strobe holds waits at low for a multi single press timeout before
    // intiating.
    {
      forStates: makeStates([Level.L], [StateSuffix.CYCLE_PRE_STROBE]),
      transitions: {
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
        [Transition.SHORT_PRESS_RELEASE]: (state) =>
          swapSuffix(state, StateSuffix.CYCLE_STROBE_BEAT),
      },
    },
    {
      forStates: makeStates([Level.L], [StateSuffix.CYCLE_STROBE_BEAT]),
      transitions: {
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (state) =>
          m.getLastUsedSublevelState(Level.STROBE, StateSuffix.SUBCYCLE),
        [Transition.PRESS_START]: (state) =>
          m.getLastUsedSublevelState(
            Level.L,
            StateSuffix.CYCLE_PRE_BATTERY_INDICATOR
          ),
      },
    },
    {
      forStates: makeStates(
        [Level.L],
        [StateSuffix.CYCLE_PRE_BATTERY_INDICATOR]
      ),
      transitions: {
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
        [Transition.SHORT_PRESS_RELEASE]: (state) => State.BATTERY_INDICATOR,
      },
    },

    {
      forStates: makeStates(
        // Only the button down states are relevant for the L variants.
        [Level.L, Level.M, Level.H],
        [StateSuffix.CYCLE]
      ),
      transitions: {
        // Button is down.
        [Transition.LONG_PRESS_BEAT]: (state) =>
          m.getLastUsedSublevelState(
            incrementLevelForLongPressCycle(parseLevel(state)),
            StateSuffix.CYCLE
          ),
        [Transition.LONG_PRESS_RELEASE]: (state) =>
          swapSuffix(state, StateSuffix.STABLE),
        // Button is up.
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (state) =>
          swapSuffix(state, StateSuffix.STABLE),
        [Transition.PRESS_START]: (state) => {
          const level = parseLevel(state);
          if (level === Level.H) {
            return m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE_PRE_M);
          } else if (level === Level.M) {
            return m.getLastUsedSublevelState(
              Level.L,
              StateSuffix.CYCLE_PRE_STROBE
            );
          }
          throw new Error(`Invalid state "${state}".`);
        },
      },
    },

    {
      forStates: makeStates([Level.L, Level.M, Level.H], [StateSuffix.STABLE]),
      transitions: {
        [Transition.SHORT_PRESS_RELEASE]: (state) =>
          swapSuffix(state, StateSuffix.TOGGLE_INTERMEDIATE_1),
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
      },
    },

    {
      forStates: makeStates(
        [Level.L, Level.M, Level.H],
        [
          StateSuffix.TOGGLE_INTERMEDIATE_1,
          StateSuffix.TOGGLE_INTERMEDIATE_2,
          StateSuffix.TOGGLE_INTERMEDIATE_3,
          StateSuffix.TOGGLE_INTERMEDIATE_4,
          StateSuffix.TOGGLE_INTERMEDIATE_5,
          StateSuffix.TOGGLE_INTERMEDIATE_6,
        ]
      ),
      transitions: {
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (_state) => State.OFF,
        [Transition.SHORT_PRESS_RELEASE]: (state) => {
          // Swap the sublevel and move to the toggle state with the same number.
          const sublevel = parseSublevel(state);
          if (sublevel !== 1 && sublevel !== 2) {
            throw new Error(`Invalid sublevel ${sublevel}`);
          }
          const newPrefix = m.getPrefix(
            parseLevel(state),
            sublevel === 1 ? 2 : 1
          );
          const newSuffix = nextSuffixForIntermediateToggleState(state);
          return composeState(newPrefix, newSuffix);
        },
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
      },
    },

    {
      forStates: makeStates(
        [Level.L, Level.M, Level.H],
        [
          StateSuffix.TOGGLE_1,
          StateSuffix.TOGGLE_2,
          StateSuffix.TOGGLE_3,
          StateSuffix.TOGGLE_4,
          StateSuffix.TOGGLE_5,
          StateSuffix.TOGGLE_6,
        ]
      ),
      actions: {
        onEnter: (state) => {
          m.setLastUsedSublevel(parseLevel(state), parseSublevel(state));
        },
      },
      transitions: {
        [Transition.MULTI_DOUBLE_PRESS_TIMEOUT]: (state) =>
          swapSuffix(state, StateSuffix.STABLE),
        [Transition.SHORT_PRESS_RELEASE]: (state) =>
          swapSuffix(state, incrementSuffixForToggleState(state)),
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
      },
    },

    {
      forStates: makeStates(
        [Level.L, Level.M, Level.H],
        [StateSuffix.TOGGLE_INTERMEDIATE_7]
      ),
      transitions: {
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (_state) => State.OFF,
        [Transition.SHORT_PRESS_RELEASE]: (state) =>
          highestOptionSubcycleStateForLevel(parseLevel(state)),
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
      },
    },

    {
      forStates: makeStates(
        [Level.L, Level.M, Level.H, Level.STROBE],
        [StateSuffix.SUBCYCLE_INTERMEDIATE]
      ),
      transitions: {
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (_state) => State.OFF,
        [Transition.SHORT_PRESS_RELEASE]: (state) =>
          nextOptionSubcycleState(state),
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
      },
    },

    {
      forStates: makeStates(
        [Level.L, Level.M, Level.H],
        [StateSuffix.SUBCYCLE]
      ),
      actions: {
        onEnter: (state) => {
          m.setLastUsedOption(parseLevel(state), parseOption(state));
        },
      },
      transitions: {
        [Transition.MULTI_DOUBLE_PRESS_TIMEOUT]: (state) =>
          swapSuffix(state, StateSuffix.STABLE),
        [Transition.SHORT_PRESS_RELEASE]: (state) =>
          swapSuffix(state, StateSuffix.SUBCYCLE_INTERMEDIATE),
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
      },
    },

    {
      forStates: makeStates([Level.STROBE], [StateSuffix.SUBCYCLE]),
      actions: {
        onEnter: (state) => {
          m.setLastUsedOption(Level.STROBE, parseOption(state));
        },
      },
      transitions: {
        [Transition.SHORT_PRESS_RELEASE]: (state) =>
          swapSuffix(state, StateSuffix.SUBCYCLE_INTERMEDIATE),
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
      },
    },
  ];

  return createStateMachine(State.OFF, expandStateDef(collapsedStateDef));
}
