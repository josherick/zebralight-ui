// @flow

import type {
  LevelType,
  StatePrefixType,
  StateSuffixType,
  StateType,
} from './enums.js';

import { Level, StatePrefix, StateSuffix } from './enums.js';

export function parseLevel(state: StateType): LevelType {
  const level = state[0];
  if (level !== 's') {
    return ((level: any): LevelType);
  }
  return 'strobe';
}

export function parseSublevel(state: StateType): number {
  if (state[0] === 's') {
    return parseInt(state.slice(6, 7)[0], 10);
  }
  return parseInt(state.slice(1, 2)[0], 10);
}

export function parseOption(state: StateType): number {
  if (state[0] === 's') {
    return parseInt(state.slice(8, 9)[0], 10);
  }
  return parseInt(state.split('.').slice(1, 2)[0], 10);
}

export function composePrefix(
  level: LevelType,
  sublevel: number,
  option: number,
): StatePrefixType {
  const firstComponent = `${level}${sublevel}`;
  return (((sublevel === 2 || level === Level.STROBE
    ? `${firstComponent}.${option}`
    : firstComponent): any): StatePrefixType);
}

export function composeState(
  prefix: StatePrefixType,
  suffix: StateSuffixType,
): StateType {
  return ((`${prefix}.${suffix}`: any): StateType);
}

export function parsePrefix(state: StateType): StatePrefixType {
  return ((state.split('.').slice(0, -1).join('.'): any): StatePrefixType);
}

export function swapSuffix(
  state: StateType,
  suffix: StateSuffixType,
): StateType {
  const prefix = parsePrefix(state);
  return ((`${prefix}.${suffix}`: any): StateType);
}

/**
 * L -> M -> H -> L
 */
export function incrementLevelForLongPressCycle(level: LevelType): LevelType {
  switch (level) {
    case Level.L:
      return Level.M;
    case Level.M:
      return Level.H;
    case Level.H:
      return Level.L;
    default:
      throw new Error(`Unexpected level "${level}"`);
  }
}

/**
 * H -> M -> STROBE
 * Requires preCycleState to include PRE_CYCLE in its name. Does not go beyond
 * strobe since battery indicator is not a level.
 */
export function levelForShortPressCycle(preCycleState: StateType): LevelType {
  return ((preCycleState.split('_').slice(-1)[0]: any): LevelType);
}

/**
 * Returns a toggle suffix with the same number as the passed intermediate
 * toggle state.
 * E.g. State.M2_1_TOGGLE_INTERMEDIATE_1 => State.M2_1_TOGGLE_1
 */
export function nextSuffixForIntermediateToggleState(
  intermediateToggleState: StateType,
): StateSuffixType {
  const suffix = intermediateToggleState.split('.').slice(-1)[0];
  return ((suffix.replace('_intermediate', ''): any): StateSuffixType);
}

/**
 * Returns a intermediate toggle suffix with a number one greater than the
 * passed toggle state.
 * E.g. State.M2_1_TOGGLE_1 => State.M2_1_TOGGLE_INTERMEDIATE_1
 */
export function incrementSuffixForToggleState(
  toggleState: StateType,
): StateSuffixType {
  const nextToggleNumber = parseInt(toggleState.slice(-1)[0], 10) + 1;
  return ((`toggle_intermediate_${nextToggleNumber}`: any): StateSuffixType);
}

/**
 * Returns the next option subcycle state, incremented from the option in the
 * intermediateSubcycleState.
 * E.g. State.H2_3_SUBCYCLE => State.H2_2_SUBCYCLE
 */
export function nextOptionSubcycleState(
  intermediateSubcycleState: StateType,
): StateType {
  let newOption = parseOption(intermediateSubcycleState) - 1;
  const level = parseLevel(intermediateSubcycleState);
  if (newOption === 0) {
    newOption = level === Level.STROBE ? 4 : 3;
  }
  const sublevelPrefix = ((intermediateSubcycleState
    .split('.')
    .slice(0, 1)[0]: any): string);
  return ((`${sublevelPrefix}.${newOption}.${StateSuffix.SUBCYCLE}`: any): StateType);
}

/**
 * Returns the highest numbered (dimmest) option subcycle state for a given
 * level.
 * E.g. Level.H => State.H2_3_SUBCYCLE
 */
export function highestOptionSubcycleStateForLevel(
  level: LevelType,
): StateType {
  let prefix = '';
  switch (level) {
    case Level.L:
      prefix = StatePrefix.L2_3;
      break;
    case Level.M:
      prefix = StatePrefix.M2_3;
      break;
    case Level.H:
      prefix = StatePrefix.H2_3;
      break;
    default:
      throw new Error(`Unexpected level "${level}"`);
  }
  return ((`${prefix}.${StateSuffix.SUBCYCLE}`: any): StateType);
}
