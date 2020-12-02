// @flow

import type { StatePrefixType } from '../state_machine/implementations/basic_ui/enums.js';
import { StatePrefix } from '../state_machine/implementations/basic_ui/enums.js';

export function getLumens(): { [StatePrefixType]: number } {
  return {
    [StatePrefix.H1]: 1616,
    [StatePrefix.H2_1]: 1010,
    [StatePrefix.H2_2]: 579,
    [StatePrefix.H2_3]: 305,

    [StatePrefix.M1]: 147,
    [StatePrefix.M2_1]: 65,
    [StatePrefix.M2_2]: 26.4,
    [StatePrefix.M2_3]: 9.9,

    [StatePrefix.L1]: 3.4,
    [StatePrefix.L2_1]: 1.06,
    [StatePrefix.L2_2]: 0.3,
    [StatePrefix.L2_3]: 0.08,
  };
}

export function getRuntime(): { [StatePrefixType]: string } {
  return {
    [StatePrefix.H1]: '2.5 hours',
    [StatePrefix.H2_1]: '2.9 hours',
    [StatePrefix.H2_2]: '3.1 hours',
    [StatePrefix.H2_3]: '5.3 hours',

    [StatePrefix.M1]: '12.5 hours',
    [StatePrefix.M2_1]: '27.5 hours',
    [StatePrefix.M2_2]: '2.77 days',
    [StatePrefix.M2_3]: '7.1 days',

    [StatePrefix.L1]: '17.5 days',
    [StatePrefix.L2_1]: '2 months',
    [StatePrefix.L2_2]: '3.8 months',
    [StatePrefix.L2_3]: '5.4 months',
  };
}
