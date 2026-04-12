// @flow

import type {
  LevelType,
  MemoryVariableType,
  StateType,
  StatePrefixType,
  StateSuffixType,
} from './enums.js';
import { Level, MemoryVariable, StatePrefix } from './enums.js';

import { composeState, composePrefix } from './stateUtils.js';

const STORAGE_KEY = 'zebralight-ui-memory';

// Keys that should not be persisted (transient state).
const TRANSIENT_KEYS = new Set([
  MemoryVariable.PROGRAMMING_SLOT_LEVEL,
  MemoryVariable.PROGRAMMING_SLOT_SUBLEVEL,
  'extra_click_count',
]);

function loadFromStorage(): { [string]: any } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // localStorage unavailable or corrupted; start fresh.
  }
  return null;
}

function saveToStorage(memory: { [string]: any }): void {
  try {
    const toSave = {};
    for (const key in memory) {
      if (!TRANSIENT_KEYS.has(key)) {
        toSave[key] = memory[key];
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    // localStorage unavailable; silently fail.
  }
}

export type MemoryInterface = {
  setLastUsedSublevel: (LevelType, number) => void,

  setLastUsedOption: (LevelType, number) => void,

  getLastUsedOption: (LevelType) => number,

  // Returns the last used sublevel for a given state with the provided suffix.
  // E.g. if the user last used L2.2:
  //  (Level.L, StateSuffix.STABLE) => State.L2_2_STABLE
  getLastUsedSublevelState: (LevelType, StateSuffixType) => StateType,

  // Returns the prefix of the level/sublevel passed.
  // E.g. (Level.L, 2) => StatePrefix.L2_2
  getPrefix: (LevelType, sublevel: number) => StatePrefixType,

  // UI group methods.
  getUIGroup: () => string,
  setUIGroup: (group: string) => void,

  // Returns the effective brightness prefix for a slot.
  // For G5, returns composePrefix(level, sublevel, option).
  // For G6/G7, returns the programmed brightness from memory.
  getEffectivePrefixForSlot: (LevelType, sublevel: number) => StatePrefixType,

  // Returns the effective brightness prefix for a slot in a specific group.
  getEffectivePrefixForSlotInGroup: (
    group: string,
    LevelType,
    sublevel: number,
  ) => StatePrefixType,

  // Sets the programmed brightness for a slot in the current G6/G7 group.
  setProgrammedBrightness: (
    LevelType,
    sublevel: number,
    prefix: StatePrefixType,
  ) => void,

  // Programming slot tracking (transient, used during subcycle).
  getProgrammingSlot: () => { level: LevelType, sublevel: number },
  setProgrammingSlot: (LevelType, sublevel: number) => void,

  // Factory reset click counter (transient, tracks clicks 8+ from OFF).
  getExtraClickCount: () => number,
  incrementExtraClickCount: () => void,
  resetExtraClickCount: () => void,

  // Factory reset: restores a group's memory to defaults.
  factoryResetGroup: (group: string) => void,
};

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
 * Returns the memory name for the last used sublevel for a given level
 * within a specific group.
 */
function lastUsedVariableName(
  group: string,
  level: LevelType,
): MemoryVariableType {
  const lookup = {
    g5: {
      [Level.H]: MemoryVariable.G5_H_LAST_USED,
      [Level.M]: MemoryVariable.G5_M_LAST_USED,
      [Level.L]: MemoryVariable.G5_L_LAST_USED,
    },
    g6: {
      [Level.H]: MemoryVariable.G6_H_LAST_USED,
      [Level.M]: MemoryVariable.G6_M_LAST_USED,
      [Level.L]: MemoryVariable.G6_L_LAST_USED,
    },
    g7: {
      [Level.H]: MemoryVariable.G7_H_LAST_USED,
      [Level.M]: MemoryVariable.G7_M_LAST_USED,
      [Level.L]: MemoryVariable.G7_L_LAST_USED,
    },
  };
  const result = lookup[group] && lookup[group][level];
  if (!result) {
    throw new Error(`Unexpected group "${group}" or level "${level}"`);
  }
  return result;
}

/**
 * Returns the memory variable name for a programmed brightness slot.
 */
function brightnessVariableName(
  group: string,
  level: LevelType,
  sublevel: number,
): MemoryVariableType {
  const prefix = group === 'g6' ? 'g6' : 'g7';
  const levelStr = level === Level.STROBE ? 'strobe' : level;
  const key = `${prefix}.${levelStr}${sublevel}.brightness`;
  return ((key: any): MemoryVariableType);
}

export default function makeBasicUIMemory(): MemoryInterface {
  const memory = {
    // Per-group last used sublevel defaults.
    [MemoryVariable.G5_H_LAST_USED]: 1,
    [MemoryVariable.G5_M_LAST_USED]: 1,
    [MemoryVariable.G5_L_LAST_USED]: 1,
    [MemoryVariable.G6_H_LAST_USED]: 1,
    [MemoryVariable.G6_M_LAST_USED]: 1,
    [MemoryVariable.G6_L_LAST_USED]: 1,
    [MemoryVariable.G7_H_LAST_USED]: 1,
    [MemoryVariable.G7_M_LAST_USED]: 1,
    [MemoryVariable.G7_L_LAST_USED]: 1,

    [MemoryVariable.H2_OPTION]: 1,
    [MemoryVariable.M2_OPTION]: 1,
    [MemoryVariable.L2_OPTION]: 1,
    [MemoryVariable.STROBE_OPTION]: 4,

    [MemoryVariable.UI_GROUP]: 'g5',

    // G6 programmed brightness defaults (same as G5 defaults).
    [MemoryVariable.G6_H1_BRIGHTNESS]: StatePrefix.H1,
    [MemoryVariable.G6_H2_BRIGHTNESS]: StatePrefix.H2_1,
    [MemoryVariable.G6_M1_BRIGHTNESS]: StatePrefix.M1,
    [MemoryVariable.G6_M2_BRIGHTNESS]: StatePrefix.M2_1,
    [MemoryVariable.G6_L1_BRIGHTNESS]: StatePrefix.L1,
    [MemoryVariable.G6_L2_BRIGHTNESS]: StatePrefix.L2_1,

    // G7 programmed brightness defaults.
    [MemoryVariable.G7_H1_BRIGHTNESS]: StatePrefix.H1,
    [MemoryVariable.G7_H2_BRIGHTNESS]: StatePrefix.H2_1,
    [MemoryVariable.G7_M1_BRIGHTNESS]: StatePrefix.M1,
    [MemoryVariable.G7_M2_BRIGHTNESS]: StatePrefix.M2_1,
    [MemoryVariable.G7_L1_BRIGHTNESS]: StatePrefix.L1,
    [MemoryVariable.G7_L2_BRIGHTNESS]: StatePrefix.L2_1,

    // Transient programming slot.
    [MemoryVariable.PROGRAMMING_SLOT_LEVEL]: Level.H,
    [MemoryVariable.PROGRAMMING_SLOT_SUBLEVEL]: 1,

    // Transient factory reset click counter.
    'extra_click_count': 0,
  };

  // Load persisted memory, overwriting defaults.
  const stored = loadFromStorage();
  if (stored) {
    for (const key in stored) {
      if (Object.prototype.hasOwnProperty.call(stored, key)) {
        memory[key] = stored[key];
      }
    }
  }

  function persist() {
    saveToStorage(memory);
  }

  const self = {
    setLastUsedSublevel: (level, value) => {
      const group = memory[MemoryVariable.UI_GROUP];
      memory[lastUsedVariableName(group, level)] = value;
      persist();
    },

    setLastUsedOption: (level, value) => {
      memory[optionVariableName(level)] = value;
      persist();
    },

    getLastUsedOption: (level) => memory[optionVariableName(level)],

    getLastUsedSublevelState: (level, suffix) => {
      const group = memory[MemoryVariable.UI_GROUP];
      const sublevel =
        level === Level.STROBE ? 1 : memory[lastUsedVariableName(group, level)];
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

    getUIGroup: () => memory[MemoryVariable.UI_GROUP],

    setUIGroup: (group) => {
      memory[MemoryVariable.UI_GROUP] = group;
      persist();
    },

    getEffectivePrefixForSlot: (level, sublevel) => {
      const group = memory[MemoryVariable.UI_GROUP];
      return self.getEffectivePrefixForSlotInGroup(group, level, sublevel);
    },

    getEffectivePrefixForSlotInGroup: (group, level, sublevel) => {
      if (group === 'g5') {
        const option = memory[optionVariableName(level)];
        return composePrefix(level, sublevel, option);
      }
      return memory[brightnessVariableName(group, level, sublevel)];
    },

    setProgrammedBrightness: (level, sublevel, prefix) => {
      const group = memory[MemoryVariable.UI_GROUP];
      if (group === 'g5') {
        return; // G5 uses the option system, not direct brightness mapping.
      }
      memory[brightnessVariableName(group, level, sublevel)] = prefix;
      persist();
    },

    getProgrammingSlot: () => ({
      level: memory[MemoryVariable.PROGRAMMING_SLOT_LEVEL],
      sublevel: memory[MemoryVariable.PROGRAMMING_SLOT_SUBLEVEL],
    }),

    setProgrammingSlot: (level, sublevel) => {
      memory[MemoryVariable.PROGRAMMING_SLOT_LEVEL] = level;
      memory[MemoryVariable.PROGRAMMING_SLOT_SUBLEVEL] = sublevel;
    },

    getExtraClickCount: () => memory['extra_click_count'],

    incrementExtraClickCount: () => {
      memory['extra_click_count'] += 1;
    },

    resetExtraClickCount: () => {
      memory['extra_click_count'] = 0;
    },

    factoryResetGroup: (group) => {
      if (group === 'g5') {
        memory[MemoryVariable.G5_H_LAST_USED] = 1;
        memory[MemoryVariable.G5_M_LAST_USED] = 1;
        memory[MemoryVariable.G5_L_LAST_USED] = 1;
        memory[MemoryVariable.H2_OPTION] = 1;
        memory[MemoryVariable.M2_OPTION] = 1;
        memory[MemoryVariable.L2_OPTION] = 1;
      } else if (group === 'g6') {
        memory[MemoryVariable.G6_H_LAST_USED] = 1;
        memory[MemoryVariable.G6_M_LAST_USED] = 1;
        memory[MemoryVariable.G6_L_LAST_USED] = 1;
        memory[MemoryVariable.G6_H1_BRIGHTNESS] = StatePrefix.H1;
        memory[MemoryVariable.G6_H2_BRIGHTNESS] = StatePrefix.H2_1;
        memory[MemoryVariable.G6_M1_BRIGHTNESS] = StatePrefix.M1;
        memory[MemoryVariable.G6_M2_BRIGHTNESS] = StatePrefix.M2_1;
        memory[MemoryVariable.G6_L1_BRIGHTNESS] = StatePrefix.L1;
        memory[MemoryVariable.G6_L2_BRIGHTNESS] = StatePrefix.L2_1;
      } else if (group === 'g7') {
        memory[MemoryVariable.G7_H_LAST_USED] = 1;
        memory[MemoryVariable.G7_M_LAST_USED] = 1;
        memory[MemoryVariable.G7_L_LAST_USED] = 1;
        memory[MemoryVariable.G7_H1_BRIGHTNESS] = StatePrefix.H1;
        memory[MemoryVariable.G7_H2_BRIGHTNESS] = StatePrefix.H2_1;
        memory[MemoryVariable.G7_M1_BRIGHTNESS] = StatePrefix.M1;
        memory[MemoryVariable.G7_M2_BRIGHTNESS] = StatePrefix.M2_1;
        memory[MemoryVariable.G7_L1_BRIGHTNESS] = StatePrefix.L1;
        memory[MemoryVariable.G7_L2_BRIGHTNESS] = StatePrefix.L2_1;
      }
      persist();
    },
  };

  return self;
}
