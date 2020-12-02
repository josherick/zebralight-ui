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

function makeBoxShadow(value: number) {
  return `0px 0px ${value}px ${value}px hsl(27, 100%, 90.4%)`;
}

function makeStrobeAnimation(statePrefix: StatePrefixType) {
  let frequency = 0;
  let animation = 'blinker';
  switch (statePrefix) {
    case StatePrefix.STROBE1_1:
      frequency = 1 / 19;
      animation = 'blinker-fast';
      break;
    case StatePrefix.STROBE1_2:
      frequency = 1 / 4;
      animation = 'blinker-fast';
      break;
    case StatePrefix.STROBE1_3:
      frequency = 1 / 0.2;
      break;
    case StatePrefix.STROBE1_4:
      frequency = 1 / 0.2;
      break;
    default:
      throw new Error(`Invalid strobe prefix: ${statePrefix}`);
  }
  return `${animation} ${frequency}s step-start infinite`;
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
    const boxShadow = getProportionalLevel(1, 50, 250);
    const opacity = getProportionalLevel(1, 0.05, 1);
    return {
      animation: 'blinker 1s step-start infinite',
      boxShadow: makeBoxShadow(boxShadow),
      opacity,
    };
  }

  const level = parseLevel(state);
  const statePrefix = parsePrefix(state);

  const proportion = getLumens()[statePrefix] / getLumens()[StatePrefix.H1];
  const boxShadow = getProportionalLevel(proportion, 50, 250);
  const opacity = getProportionalLevel(proportion, 0.05, 1);
  const styles = ({
    boxShadow: makeBoxShadow(boxShadow),
    opacity,
  }: { [string]: any });
  if (level === Level.STROBE) {
    styles.animation = makeStrobeAnimation(statePrefix);
  }

  return styles;
}
