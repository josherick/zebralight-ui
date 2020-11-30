// @flow

import type {
  LevelType,
  StateType,
  StatePrefixType,
} from './state_machine/implementations/basic_ui/enums';
import { State } from './state_machine/implementations/basic_ui/enums';
import {
  parseLevel,
  parseSublevel,
} from './state_machine/implementations/basic_ui/stateUtils';
import {
  getLumens as get604cLumens,
  getRuntime as get604cRuntime,
} from './configurations/604c';

export function getLumens(statePrefix: StatePrefixType): number {
  return get604cLumens()[statePrefix];
}

export function getRuntime(statePrefix: StatePrefixType): string {
  return get604cRuntime()[statePrefix];
}

export function getLevel(state: StateType): string {
  if (state === State.OFF) {
    return 'Off';
  } else if (state === State.BATTERY_INDICATOR) {
    return 'Battery Indicator';
  }
  const level = parseLevel(state).toUpperCase();
  const sublevel = parseSublevel(state);
  return `${level}${sublevel}`;
}
