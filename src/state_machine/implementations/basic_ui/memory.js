// @flow

import type {
  LevelType,
  MemoryVariableType,
  StateType,
  StatePrefixType,
  StateSuffixType,
} from './enums.js';
import { Level, MemoryVariable } from './enums.js';

import { composeState, composePrefix } from './stateUtils.js';

type MemoryInterface = {
  setLastUsedSublevel: (LevelType, number) => void,

  setLastUsedOption: (LevelType, number) => void,

  // Returns the last used sublevel for a given state with the provided suffix.
  // E.g. if the user last used L2.2:
  //  (Level.L, StateSuffix.STABLE) => State.L2_2_STABLE
  getLastUsedSublevelState: (LevelType, StateSuffixType) => StateType,

  // Returns the prefix of the level/sublevel passed.
  // E.g. (Level.L, 2) => StatePrefix.L2_2
  getPrefix: (LevelType, sublevel: number) => StatePrefixType,
};

export default function makeBasicUIMemory(): MemoryInterface {
  const memory = {
    [MemoryVariable.H_LAST_USED]: 1,
    [MemoryVariable.M_LAST_USED]: 1,
    [MemoryVariable.L_LAST_USED]: 1,

    [MemoryVariable.H2_OPTION]: 1,
    [MemoryVariable.M2_OPTION]: 1,
    [MemoryVariable.L2_OPTION]: 1,
    [MemoryVariable.STROBE_OPTION]: 4,
  };

  return {
    setLastUsedSublevel: (level, value) => {
      memory[lastUsedVariableName(level)] = value;
    },

    setLastUsedOption: (level, value) => {
      memory[optionVariableName(level)] = value;
    },

    getLastUsedSublevelState: (level, suffix) => {
      const sublevel =
        level === Level.STROBE ? 1 : memory[lastUsedVariableName(level)];
      const option = memory[optionVariableName(level)];
      if (sublevel !== 1 && sublevel !== 2) {
        throw new Error(`Sublevel "${sublevel}" is invalid.`);
      }
      return composeState(composePrefix(level, sublevel, option), suffix);
    },

    getPrefix: (level, sublevel) => {
      const option = memory[optionVariableName(level)];
      return composePrefix(level, sublevel, option);
    },
  };
}

/**
 * Returns the memory name for the last used subcycle option for a given level.
 */
function optionVariableName(level: LevelType): MemoryVariableType {
  switch (level) {
    case Level.L:
      return MemoryVariable.L2_OPTION;
    case Level.M:
      return MemoryVariable.M2_OPTION;
    case Level.H:
      return MemoryVariable.H2_OPTION;
    case Level.STROBE:
      return MemoryVariable.STROBE_OPTION;
    default:
      throw new Error(`Unexpected level "${level}"`);
  }
}

/*
 * Returns the memory name for the last used sublevel for a given level.
 */
function lastUsedVariableName(level: LevelType): MemoryVariableType {
  switch (level) {
    case Level.L:
      return MemoryVariable.L_LAST_USED;
    case Level.M:
      return MemoryVariable.M_LAST_USED;
    case Level.H:
      return MemoryVariable.H_LAST_USED;
    default:
      throw new Error(`Unexpected level "${level}"`);
  }
}
