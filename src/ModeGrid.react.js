// @flow
import * as React from 'react';

import type { StateType } from './state_machine/implementations/basic_ui/enums.js';
import type { MemoryInterface } from './state_machine/implementations/basic_ui/memory.js';
import {
  Level,
  State,
  StatePrefix,
} from './state_machine/implementations/basic_ui/enums.js';

import { getLumens } from './lampInformation.js';
import {
  parseLevel,
  parseSublevel,
  parseOption,
  parsePrefixMaybe,
} from './state_machine/implementations/basic_ui/stateUtils.js';

import ModeGridCell from './ModeGridCell.react.js';

type Props = {
  lampState: StateType,
  memory: MemoryInterface,
};

export default function ModeGrid({
  lampState,
  memory,
}: Props): React.Element<'div'> | null {
  const activePrefix = parsePrefixMaybe(lampState);
  const cells = [
    <ModeGridCell
      key={State.OFF}
      isHumanLevelVisible={true}
      isActive={lampState === State.OFF}
      humanLevel="Off"
    />,
    <ModeGridCell
      key={State.BATTERY_INDICATOR}
      isHumanLevelVisible={true}
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

      StatePrefix.STROBE1_1,
      StatePrefix.STROBE1_2,
      StatePrefix.STROBE1_3,
      StatePrefix.STROBE1_4,
    ].map((prefix) => (
      <ModeGridCell
        key={prefix}
        isActive={prefix === activePrefix}
        isHumanLevelVisible={
          parseLevel(prefix) === Level.STROBE ||
          parseSublevel(prefix) === 1 ||
          memory.getLastUsedOption(parseLevel(prefix)) === parseOption(prefix)
        }
        humanLevel={
          parseLevel(prefix) === Level.STROBE
            ? `S${prefix.split('.').slice(-1)[0]}`
            : prefix.split('.').slice(0, 1)[0].toUpperCase()
        }
        lumens={getLumens(prefix)}
      />
    )),
  ].flat();
  return <div className="mode-grid">{cells}</div>;
}
