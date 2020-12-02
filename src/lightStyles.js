// @flow

import type { StatePrefixType } from './state_machine/implementations/basic_ui/enums.js';

export function getLightBackgroundStyles(
  _statePrefix: StatePrefixType,
): { [string]: any } {
  return {
    backgroundColor: 'black',
  };
}

export function getLightStyles(
  _statePrefix: StatePrefixType,
): { [string]: any } {
  return {
    backgroundColor: 'black',
  };
}
