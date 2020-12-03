// @flow
import * as React from 'react';

import type { StateType } from './state_machine/implementations/basic_ui/enums.js';
import {
  State,
  StatePrefix,
} from './state_machine/implementations/basic_ui/enums.js';

import { getLumens } from './lampInformation.js';
import { parsePrefixMaybe } from './state_machine/implementations/basic_ui/stateUtils.js';

import ModeGridCell from './ModeGridCell.react.js';

type Props = {
  lampState: StateType,
};

export default function ModeGrid({
  lampState,
}: Props): React.Element<'div'> | null {
  const activePrefix = parsePrefixMaybe(lampState);
  const cells = [
    <ModeGridCell isActive={lampState === State.OFF} humanLevel="Off" />,
    <ModeGridCell
      isActive={lampState === State.BATTERY_INDICATOR}
      humanLevel="Battery Indicator"
    />,
    [
      StatePrefix.H1,
      StatePrefix.H2_1,
      StatePrefix.H2_2,
      StatePrefix.H2_3,

      StatePrefix.M1,
      StatePrefix.M2_1,
      StatePrefix.M2_2,
      StatePrefix.M2_3,

      StatePrefix.L1,
      StatePrefix.L2_1,
      StatePrefix.L2_2,
      StatePrefix.L2_3,
    ].map((prefix) => (
      <ModeGridCell
        isActive={prefix === activePrefix}
        humanLevel={prefix.split('.').slice(0, 1)[0].toUpperCase()}
        lumens={getLumens(prefix)}
      />
    )),
    [
      StatePrefix.STROBE1_1,
      StatePrefix.STROBE1_2,
      StatePrefix.STROBE1_3,
      StatePrefix.STROBE1_4,
    ].map((strobePrefix) => (
      <ModeGridCell
        isActive={strobePrefix === activePrefix}
        humanLevel={`S${strobePrefix.split('.').slice(-1)[0]}`}
        lumens={getLumens(strobePrefix)}
      />
    )),
  ].flat();
  return <div className="mode-grid">{cells}</div>;
}
