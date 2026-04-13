// @flow

import type { StatePrefixType } from './state_machine/implementations/basic_ui/enums.js';
import { StatePrefix } from './state_machine/implementations/basic_ui/enums.js';

import products from '../zebralight_products.json';

// Map from JSON key format (e.g. "H2.1") to StatePrefix (e.g. "h2.1").
const KEY_TO_PREFIX: { [string]: StatePrefixType } = {
  'H1': StatePrefix.H1,
  'H2.1': StatePrefix.H2_1,
  'H2.2': StatePrefix.H2_2,
  'H2.3': StatePrefix.H2_3,
  'M1': StatePrefix.M1,
  'M2.1': StatePrefix.M2_1,
  'M2.2': StatePrefix.M2_2,
  'M2.3': StatePrefix.M2_3,
  'L1': StatePrefix.L1,
  'L2.1': StatePrefix.L2_1,
  'L2.2': StatePrefix.L2_2,
  'L2.3': StatePrefix.L2_3,
};

// Strobe values are not in the JSON; use defaults.
const STROBE_LUMENS = {
  [StatePrefix.STROBE1_1]: 0,
  [StatePrefix.STROBE1_2]: 0,
  [StatePrefix.STROBE1_3]: 0,
  [StatePrefix.STROBE1_4]: 0,
};

const STROBE_RUNTIME = {
  [StatePrefix.STROBE1_1]: '19 Hz',
  [StatePrefix.STROBE1_2]: '4 Hz',
  [StatePrefix.STROBE1_3]: '0.2 Hz',
  [StatePrefix.STROBE1_4]: '0.2 Hz',
};

export function getProductNames(): string[] {
  return Object.keys(products);
}

export function getLumensForLamp(
  lampName: string,
): { [StatePrefixType]: number } {
  const product = products[lampName];
  if (!product) return {};
  const result = {};
  for (const key in KEY_TO_PREFIX) {
    const prefix = KEY_TO_PREFIX[key];
    if (product[key]) {
      result[prefix] = product[key].lm;
    }
  }
  // Strobe lumens default to H1 lumens.
  const h1Lumens = result[StatePrefix.H1] || 0;
  result[StatePrefix.STROBE1_1] = h1Lumens;
  result[StatePrefix.STROBE1_2] = h1Lumens;
  result[StatePrefix.STROBE1_3] = h1Lumens;
  result[StatePrefix.STROBE1_4] = result[StatePrefix.L1] || 0;
  return result;
}

export function getRuntimeForLamp(
  lampName: string,
): { [StatePrefixType]: string } {
  const product = products[lampName];
  if (!product) return {};
  const result = {};
  for (const key in KEY_TO_PREFIX) {
    const prefix = KEY_TO_PREFIX[key];
    if (product[key]) {
      result[prefix] = product[key].runtime;
    }
  }
  // Strobe runtime is frequency-based, not from the product data.
  Object.assign(result, STROBE_RUNTIME);
  return result;
}
