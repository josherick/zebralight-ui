// @flow
import * as React from 'react';
import { useState, useEffect } from 'react';

import type { StateType } from './state_machine/implementations/basic_ui/enums.js';
import type { MemoryInterface } from './state_machine/implementations/basic_ui/memory.js';
import {
  Level,
  State,
  StatePrefix,
} from './state_machine/implementations/basic_ui/enums.js';

import { getLumens, getEffectivePrefix } from './lampInformation.js';
import {
  parseLevel,
  parseSublevel,
  parseOption,
} from './state_machine/implementations/basic_ui/stateUtils.js';

import ModeGridCell from './ModeGridCell.react.js';
import { useSettings } from './SettingsContext.js';

type Props = {
  lampState: StateType,
  memory: MemoryInterface,
};

const ALL_PREFIXES = [
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
];

// The 6 programmable slots.
const SLOTS = [
  { level: Level.H, sublevel: 1, label: 'H1' },
  { level: Level.H, sublevel: 2, label: 'H2' },
  { level: Level.M, sublevel: 1, label: 'M1' },
  { level: Level.M, sublevel: 2, label: 'M2' },
  { level: Level.L, sublevel: 1, label: 'L1' },
  { level: Level.L, sublevel: 2, label: 'L2' },
];

function getSlotLabelsForPrefix(
  prefix: string,
  group: string,
  memory: MemoryInterface,
): string[] {
  const labels = [];
  for (const slot of SLOTS) {
    const effectivePrefix = memory.getEffectivePrefixForSlotInGroup(
      group,
      slot.level,
      slot.sublevel,
    );
    if (effectivePrefix === prefix) {
      labels.push(slot.label);
    }
  }
  return labels;
}

function SingleGrid({
  group,
  lampState,
  memory,
  isActiveGroup,
  hideLabel,
}: {
  group: string,
  lampState: StateType,
  memory: MemoryInterface,
  isActiveGroup: boolean,
  hideLabel?: boolean,
}): React.Element<'div'> {
  const activeEffectivePrefix = isActiveGroup
    ? getEffectivePrefix(lampState, memory)
    : null;

  const cells = [
    <ModeGridCell
      key={State.OFF}
      isHumanLevelVisible={true}
      isActive={isActiveGroup && lampState === State.OFF}
      humanLevel="Off"
    />,
    <ModeGridCell
      key={State.BATTERY_INDICATOR}
      isHumanLevelVisible={true}
      isActive={isActiveGroup && lampState === State.BATTERY_INDICATOR}
      humanLevel="Battery Indicator"
    />,
    ...ALL_PREFIXES.map((prefix) => {
      const slotLabels = getSlotLabelsForPrefix(prefix, group, memory);
      let humanLevel;
      let tooltip;
      if (parseLevel(prefix) === Level.STROBE) {
        humanLevel = `S${prefix.split('.').slice(-1)[0]}`;
      } else if (slotLabels.length === 0) {
        humanLevel = '';
      } else if (slotLabels.length === 1) {
        humanLevel = slotLabels[0];
      } else {
        humanLevel = `${slotLabels.length} levels`;
        tooltip = slotLabels.join(', ');
      }

      return (
        <ModeGridCell
          key={`${group}-${prefix}`}
          isActive={isActiveGroup && prefix === activeEffectivePrefix}
          isHumanLevelVisible={humanLevel !== ''}
          humanLevel={humanLevel || '\u00A0'}
          lumens={getLumens(prefix)}
          tooltip={tooltip}
        />
      );
    }),
  ];
  return (
    <div className="mode-grid-single">
      {!hideLabel && <div className="mode-grid-label">{group.toUpperCase()}</div>}
      <div className="mode-grid">{cells}</div>
    </div>
  );
}

export default function ModeGrid({
  lampState,
  memory,
}: Props): React.Element<'div'> {
  const { settings, updateSetting } = useSettings();
  const activeGroup = memory.getUIGroup();
  const [selectedGroup, setSelectedGroup] = useState(activeGroup);

  // Sync selected group when active group changes, and disable
  // hideG6G7 if the user enters G6/G7.
  useEffect(() => {
    setSelectedGroup(activeGroup);
    if (settings.hideG6G7 && activeGroup !== 'g5') {
      updateSetting('hideG6G7', false);
    }
  }, [activeGroup, settings.hideG6G7, updateSetting]);

  const hideG6G7 = settings.hideG6G7 && activeGroup === 'g5';

  if (hideG6G7) {
    return (
      <div className="mode-grid-container">
        <SingleGrid
          group="g5"
          lampState={lampState}
          memory={memory}
          isActiveGroup={true}
          hideLabel={true}
        />
      </div>
    );
  }

  const groups = ['g5', 'g6', 'g7'];

  return (
    <div className="mode-grid-container">
      <div className="group-selector">
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            className={`group-selector-button${
              g === selectedGroup ? ' selected' : ''
            }${g === activeGroup ? ' active-group' : ''}`}
            onClick={() => setSelectedGroup(g)}
          >
            {g.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="mode-grids">
        <div className="mode-grids-narrow">
          <SingleGrid
            group={selectedGroup}
            lampState={lampState}
            memory={memory}
            isActiveGroup={selectedGroup === activeGroup}
          />
        </div>
        <div className="mode-grids-wide">
          {groups.map((g) => (
            <SingleGrid
              key={g}
              group={g}
              lampState={lampState}
              memory={memory}
              isActiveGroup={g === activeGroup}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
