// @flow
import type { StateMachine } from '../../createStateMachine.js';

import type { MemoryInterface } from './memory.js';

import createStateMachine from '../../createStateMachine.js';

import {
  parseLevel,
  parsePrefix,
  parseSuffix,
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
  nextBrighterPrefix,
  nextDimmerPrefix,
} from './stateUtils.js';

import { Level, State, StateSuffix, Transition } from './enums.js';

import { expandStateDef, makeStates } from './stateExpander.js';

import makeBasicUIMemory from './memory.js';

export default function makeBasicUIStateMachine(): [
  StateMachine,
  MemoryInterface,
] {
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

    // Group selection states (5/6/7+ clicks from OFF).
    // Light stays at L1 brightness during selection.
    {
      forStates: [
        State.GROUP_SELECT_5_INTERMEDIATE,
        State.GROUP_SELECT_6_INTERMEDIATE,
        State.GROUP_SELECT_7_INTERMEDIATE,
        State.GROUP_SELECT_EXTRA_INTERMEDIATE,
      ],
      transitions: {
        [Transition.SHORT_PRESS_RELEASE]: (state) => {
          switch (state) {
            case State.GROUP_SELECT_5_INTERMEDIATE:
              return State.GROUP_SELECT_5;
            case State.GROUP_SELECT_6_INTERMEDIATE:
              return State.GROUP_SELECT_6;
            case State.GROUP_SELECT_7_INTERMEDIATE:
              return State.GROUP_SELECT_7;
            case State.GROUP_SELECT_EXTRA_INTERMEDIATE:
              return State.GROUP_SELECT_EXTRA;
            default:
              throw new Error(`Unexpected state "${state}"`);
          }
        },
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
      },
    },
    {
      forStates: [State.GROUP_SELECT_5],
      transitions: {
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (_state) => {
          m.setUIGroup('g5');
          return State.OFF;
        },
        [Transition.PRESS_START]: (_state) =>
          State.GROUP_SELECT_6_INTERMEDIATE,
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
      },
    },
    {
      forStates: [State.GROUP_SELECT_6],
      transitions: {
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (_state) => {
          m.setUIGroup('g6');
          return State.OFF;
        },
        [Transition.PRESS_START]: (_state) =>
          State.GROUP_SELECT_7_INTERMEDIATE,
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
      },
    },
    {
      forStates: [State.GROUP_SELECT_7],
      transitions: {
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (_state) => {
          m.setUIGroup('g7');
          return State.OFF;
        },
        [Transition.PRESS_START]: (_state) =>
          State.GROUP_SELECT_EXTRA_INTERMEDIATE,
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
      },
    },
    {
      forStates: [State.GROUP_SELECT_EXTRA],
      transitions: {
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (_state) => State.OFF,
        [Transition.PRESS_START]: (_state) =>
          State.GROUP_SELECT_EXTRA_INTERMEDIATE,
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
      },
    },

    {
      forStates: makeStates(
        [Level.L],
        [StateSuffix.CYCLE_PRE_H, StateSuffix.CYCLE_PRE_M],
      ),
      transitions: {
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
        [Transition.SHORT_PRESS_RELEASE]: (state) =>
          m.getLastUsedSublevelState(
            levelForShortPressCycle(state),
            StateSuffix.CYCLE,
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
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (_state) =>
          m.getLastUsedSublevelState(Level.STROBE, StateSuffix.SUBCYCLE),
        [Transition.PRESS_START]: (_state) =>
          m.getLastUsedSublevelState(
            Level.L,
            StateSuffix.CYCLE_PRE_BATTERY_INDICATOR,
          ),
      },
    },
    {
      forStates: makeStates(
        [Level.L],
        [StateSuffix.CYCLE_PRE_BATTERY_INDICATOR],
      ),
      transitions: {
        [Transition.LONG_PRESS_BEAT]: (_state) =>
          m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE),
        [Transition.SHORT_PRESS_RELEASE]: (state) =>
          swapSuffix(state, StateSuffix.CYCLE_BATTERY_INDICATOR_BEAT),
      },
    },
    {
      forStates: makeStates(
        [Level.L],
        [StateSuffix.CYCLE_BATTERY_INDICATOR_BEAT],
      ),
      transitions: {
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (_state) =>
          State.BATTERY_INDICATOR,
        [Transition.PRESS_START]: (_state) =>
          State.GROUP_SELECT_5_INTERMEDIATE,
      },
    },

    {
      forStates: makeStates(
        // Only the button down states are relevant for the L variants.
        [Level.L, Level.M, Level.H],
        [StateSuffix.CYCLE],
      ),
      transitions: {
        // Button is down.
        [Transition.LONG_PRESS_BEAT]: (state) =>
          m.getLastUsedSublevelState(
            incrementLevelForLongPressCycle(parseLevel(state)),
            StateSuffix.CYCLE,
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
              StateSuffix.CYCLE_PRE_STROBE,
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
        ],
      ),
      transitions: {
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (_state) => State.OFF,
        [Transition.SHORT_PRESS_RELEASE]: (state) => {
          const sublevel = parseSublevel(state);
          if (sublevel !== 1 && sublevel !== 2) {
            throw new Error(`Invalid sublevel ${sublevel}`);
          }
          const level = parseLevel(state);
          const newSublevel = sublevel === 1 ? 2 : 1;
          const suffix = parseSuffix(state);

          // In G6/G7, toggle_intermediate_6 enters programming mode.
          if (
            suffix === StateSuffix.TOGGLE_INTERMEDIATE_6 &&
            m.getUIGroup() !== 'g5'
          ) {
            m.setProgrammingSlot(level, newSublevel);
            const brightnessPrefix = m.getEffectivePrefixForSlot(
              level,
              newSublevel,
            );
            return composeState(brightnessPrefix, StateSuffix.SUBCYCLE);
          }

          // Swap the sublevel and move to the toggle state with the same number.
          const newPrefix = m.getPrefix(level, newSublevel);
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
        ],
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
        [StateSuffix.TOGGLE_INTERMEDIATE_7],
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
        [StateSuffix.SUBCYCLE_INTERMEDIATE],
      ),
      transitions: {
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (state) => {
          if (m.getUIGroup() !== 'g5' && parseLevel(state) !== Level.STROBE) {
            // G6/G7: single-click exits programming, stays on at slot.
            const slot = m.getProgrammingSlot();
            return composeState(
              m.getPrefix(slot.level, slot.sublevel),
              StateSuffix.STABLE,
            );
          }
          return State.OFF;
        },
        [Transition.SHORT_PRESS_RELEASE]: (state) => {
          if (m.getUIGroup() !== 'g5' && parseLevel(state) !== Level.STROBE) {
            // G6/G7: go to pending state to distinguish double vs triple click.
            return swapSuffix(state, StateSuffix.SUBCYCLE_PENDING);
          }
          return nextOptionSubcycleState(state);
        },
        [Transition.LONG_PRESS_BEAT]: (state) => {
          if (m.getUIGroup() !== 'g5' && parseLevel(state) !== Level.STROBE) {
            const slot = m.getProgrammingSlot();
            return composeState(
              m.getPrefix(slot.level, slot.sublevel),
              StateSuffix.STABLE,
            );
          }
          return m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE);
        },
      },
    },

    {
      forStates: makeStates(
        [Level.L, Level.M, Level.H],
        [StateSuffix.SUBCYCLE],
      ),
      actions: {
        onEnter: (state) => {
          if (m.getUIGroup() === 'g5') {
            m.setLastUsedSublevel(parseLevel(state), parseSublevel(state));
            m.setLastUsedOption(parseLevel(state), parseOption(state));
          } else {
            // G6/G7: save the current preview brightness for the programming slot.
            const slot = m.getProgrammingSlot();
            const prefix = parsePrefix(state);
            m.setProgrammedBrightness(slot.level, slot.sublevel, prefix);
          }
        },
      },
      transitions: {
        [Transition.MULTI_DOUBLE_PRESS_TIMEOUT]: (state) => {
          if (m.getUIGroup() !== 'g5') {
            // G6/G7: exit programming, return to slot.
            const slot = m.getProgrammingSlot();
            return composeState(
              m.getPrefix(slot.level, slot.sublevel),
              StateSuffix.STABLE,
            );
          }
          return swapSuffix(state, StateSuffix.STABLE);
        },
        [Transition.SHORT_PRESS_RELEASE]: (state) =>
          swapSuffix(state, StateSuffix.SUBCYCLE_INTERMEDIATE),
        [Transition.LONG_PRESS_BEAT]: (_state) => {
          if (m.getUIGroup() !== 'g5') {
            const slot = m.getProgrammingSlot();
            return composeState(
              m.getPrefix(slot.level, slot.sublevel),
              StateSuffix.STABLE,
            );
          }
          return m.getLastUsedSublevelState(Level.L, StateSuffix.CYCLE);
        },
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

    // G6/G7 SUBCYCLE_PENDING: waiting to distinguish double-click (UP) from
    // triple-click (DOWN).
    {
      forStates: makeStates(
        [Level.L, Level.M, Level.H],
        [StateSuffix.SUBCYCLE_PENDING],
      ),
      transitions: {
        [Transition.MULTI_SINGLE_PRESS_TIMEOUT]: (state) => {
          // Confirmed double-click: go UP (brighter).
          const prefix = parsePrefix(state);
          return composeState(
            nextBrighterPrefix(prefix),
            StateSuffix.SUBCYCLE,
          );
        },
        [Transition.SHORT_PRESS_RELEASE]: (state) => {
          // Triple-click: go DOWN (dimmer).
          const prefix = parsePrefix(state);
          return composeState(nextDimmerPrefix(prefix), StateSuffix.SUBCYCLE);
        },
        [Transition.LONG_PRESS_BEAT]: (_state) => {
          const slot = m.getProgrammingSlot();
          return composeState(
            m.getPrefix(slot.level, slot.sublevel),
            StateSuffix.STABLE,
          );
        },
      },
    },
  ];

  return [createStateMachine(State.OFF, expandStateDef(collapsedStateDef)), m];
}
