// @flow
import * as React from 'react';

import type { StateType } from './state_machine/implementations/basic_ui/enums.js';

import { getBulbStyles } from './lightStyles.js';

type Props = {
  lampState: StateType,
};

export default function ZebralightButton({
  lampState,
}: Props): React.Element<'div'> | null {
  return <div className="bulb" style={getBulbStyles(lampState)} />;
}
