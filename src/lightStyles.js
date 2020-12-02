// @flow

import type {
  StatePrefixType,
  StateType,
} from './state_machine/implementations/basic_ui/enums.js';
import {
  StatePrefix,
  State,
  Level,
} from './state_machine/implementations/basic_ui/enums.js';

import { getLumens } from './configurations/604c.js';
import {
  parseLevel,
  parsePrefix,
} from './state_machine/implementations/basic_ui/stateUtils.js';

function getProportionalLevel(
  proportion: number,
  min: number,
  max: number,
): number {
  return (max - min) * proportion + min;
}

export function getLightBackgroundStyles(
  _statePrefix: StatePrefixType,
): { [string]: any } {
  return {
    backgroundColor: 'black',
  };
}

export function getBulbStyles(state: StateType): { [string]: any } {
  if (state === State.OFF) {
    return { opacity: 0 };
  } else if (state === State.BATTERY_INDICATOR) {
    return { opacity: 0 };
  }

  const level = parseLevel(state);
  if (level === Level.STROBE) {
    return { opacity: 0 };
  }

  const statePrefix = parsePrefix(state);
  const proportion = getLumens()[statePrefix] / getLumens()[StatePrefix.H1];
  const boxShadow = getProportionalLevel(proportion, 50, 250);
  const opacity = getProportionalLevel(proportion, 0.05, 1);
  return {
    boxShadow: `0px 0px ${boxShadow}px ${boxShadow}px hsl(27, 100%, 90.4%)`,
    opacity,
  };
}
