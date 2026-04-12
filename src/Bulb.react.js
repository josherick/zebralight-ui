// @flow
import * as React from 'react';

import type { StateType } from './state_machine/implementations/basic_ui/enums.js';
import type { MemoryInterface } from './state_machine/implementations/basic_ui/memory.js';

import { getBulbStyles } from './lightStyles.js';
import { getEffectivePrefix } from './lampInformation.js';

type Props = {
  lampState: StateType,
  memory: MemoryInterface,
};

export default function Bulb({
  lampState,
  memory,
}: Props): React.Element<'div'> | null {
  const effectivePrefix = getEffectivePrefix(lampState, memory);
  return <div className="bulb" style={getBulbStyles(lampState, effectivePrefix)} />;
}
