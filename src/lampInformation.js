// @flow

import * as React from 'react';

import type {
  StateType,
  StatePrefixType,
} from './state_machine/implementations/basic_ui/enums.js';
import type { MemoryInterface } from './state_machine/implementations/basic_ui/memory.js';
import {
  Level,
  State,
  StatePrefix,
  StateSuffix,
} from './state_machine/implementations/basic_ui/enums.js';
import {
  parseLevel,
  parseSublevel,
  parsePrefix,
  parseSuffix,
} from './state_machine/implementations/basic_ui/stateUtils.js';
import {
  getLumensForLamp,
  getRuntimeForLamp,
} from './lampData.js';

function isGroupSelectState(state: StateType): boolean {
  return state.startsWith('group_select');
}

export function getEffectivePrefix(
  state: StateType,
  memory: MemoryInterface,
): StatePrefixType | null {
  if (state === State.OFF || state === State.BATTERY_INDICATOR) {
    return null;
  }

  // Group select states display at L1 brightness.
  if (isGroupSelectState(state)) {
    return StatePrefix.L1;
  }

  const prefix = parsePrefix(state);

  // G5: prefix always equals brightness.
  if (memory.getUIGroup() === 'g5') {
    return prefix;
  }

  // G6/G7 in programming mode: prefix is the preview brightness.
  const suffix = parseSuffix(state);
  if (
    suffix === StateSuffix.SUBCYCLE ||
    suffix === StateSuffix.SUBCYCLE_INTERMEDIATE ||
    suffix === StateSuffix.SUBCYCLE_PENDING
  ) {
    return prefix;
  }

  // G6/G7 normal operation: look up programmed brightness.
  const level = parseLevel(state);
  const sublevel = parseSublevel(state);
  return memory.getEffectivePrefixForSlot(level, sublevel);
}

export function getLumens(
  statePrefix: StatePrefixType,
  lampName: string,
): number | null {
  return getLumensForLamp(lampName)[statePrefix] ?? null;
}

export function getRuntime(
  statePrefix: StatePrefixType,
  lampName: string,
): string | null {
  return getRuntimeForLamp(lampName)[statePrefix] ?? null;
}

export function getBrightnessLinearOrder(statePrefix: StatePrefixType): number {
  const order = {
    [StatePrefix.H1]: 12,
    [StatePrefix.H2_1]: 11,
    [StatePrefix.H2_2]: 10,
    [StatePrefix.H2_3]: 9,

    [StatePrefix.M1]: 8,
    [StatePrefix.M2_1]: 7,
    [StatePrefix.M2_2]: 6,
    [StatePrefix.M2_3]: 5,

    [StatePrefix.L1]: 4,
    [StatePrefix.L2_1]: 3,
    [StatePrefix.L2_2]: 2,
    [StatePrefix.L2_3]: 1,

    [StatePrefix.STROBE1_1]: 12,
    [StatePrefix.STROBE1_2]: 12,
    [StatePrefix.STROBE1_3]: 12,
    [StatePrefix.STROBE1_4]: 4,
  };
  return order[statePrefix];
}

export function getLevel(state: StateType): string {
  if (state === State.OFF) {
    return 'Off';
  } else if (state === State.BATTERY_INDICATOR) {
    return 'Battery Indicator';
  }

  if (isGroupSelectState(state)) {
    const label = getGroupSelectLabel(state);
    return label || '';
  }

  const level = parseLevel(state);
  if (level === Level.STROBE) {
    return 'Strobe';
  }
  const sublevel = parseSublevel(state);
  return `${level.toUpperCase()}${sublevel}`;
}

function getGroupSelectLabel(state: StateType): string {
  if (
    state === State.GROUP_SELECT_5_INTERMEDIATE ||
    state === State.GROUP_SELECT_5
  ) {
    return 'G5';
  }
  if (
    state === State.GROUP_SELECT_6_INTERMEDIATE ||
    state === State.GROUP_SELECT_6
  ) {
    return 'G6';
  }
  if (
    state === State.GROUP_SELECT_7_INTERMEDIATE ||
    state === State.GROUP_SELECT_7
  ) {
    return 'G7';
  }
  return '';
}

function getDescription(
  state: StateType,
  memory: MemoryInterface,
): React.Element<'div'> {
  if (state === State.OFF) {
    return (
      <div>
        <div>Press and hold to cycle L, M, H.</div>
        <div>1, 2, 3 or 4 short presses for H, M, Strobe, Battery Indicator.</div>
        <div>5/6/7 short presses to select G5/G6/G7. 15/18/21 to factory reset G5/G6/G7.</div>
      </div>
    );
  } else if (state === State.BATTERY_INDICATOR) {
    return (
      <div>
        The lamp will flash 1-4 times indicating the amount of battery life
        remaining.
      </div>
    );
  }

  // Group selection states.
  if (isGroupSelectState(state)) {
    const groupLabel = getGroupSelectLabel(state);
    if (groupLabel) {
      return (
        <div>{`Release and wait to select ${groupLabel}, or continue clicking.`}</div>
      );
    }
    // GROUP_SELECT_EXTRA: show factory reset info based on click count.
    const clickCount = memory.getExtraClickCount();
    if (clickCount === 8) {
      return <div>Release and wait to factory reset G5.</div>;
    } else if (clickCount === 11) {
      return <div>Release and wait to factory reset G6.</div>;
    } else if (clickCount === 14) {
      return <div>Release and wait to factory reset G7.</div>;
    }
    const nextReset =
      clickCount < 8
        ? `${15 - 7 - clickCount} more short presses to factory reset G5.`
        : clickCount < 11
          ? `${18 - 7 - clickCount} more short presses to factory reset G6.`
          : clickCount < 14
            ? `${21 - 7 - clickCount} more short presses to factory reset G7.`
            : null;
    return (
      <div>
        {nextReset
          ? `Release and wait to turn off. ${nextReset}`
          : 'Release and wait to turn off.'}
      </div>
    );
  }

  const level = parseLevel(state);
  if (level === Level.STROBE) {
    return (
      <div>
        <div>Double click to cycle through the four strobe levels.</div>
        <div>
          Press and hold to cycle L, M, H. Press a single time to turn off.
        </div>
      </div>
    );
  }

  const isG5 = memory.getUIGroup() === 'g5';
  const sublevel = parseSublevel(state);
  const humanLevel = `${level.toUpperCase()}${sublevel}`;
  const oppositeSublevel = sublevel === 1 ? 2 : 1;
  const humanOppositeLevel = `${level.toUpperCase()}${oppositeSublevel}`;
  const humanLevel2 = `${level.toUpperCase()}${2}`;

  const stateSuffix = parseSuffix(state);
  switch (stateSuffix) {
    case StateSuffix.CYCLE:
      return <div>Continue pressing to cycle. Release to stop cycling.</div>;
    case StateSuffix.CYCLE_PRE_H:
      return (
        <div>Release to go to H, or continue holding to cycle L, M, H.</div>
      );
    case StateSuffix.CYCLE_PRE_M:
      return (
        <div>Release to go to M, or continue holding to cycle L, M, H.</div>
      );
    case StateSuffix.CYCLE_PRE_STROBE:
      return (
        <div>
          Release to go to Strobe, or continue holding to cycle L, M, H.
        </div>
      );
    case StateSuffix.CYCLE_STROBE_BEAT:
      return <div>Strobe is about to start.</div>;
    case StateSuffix.CYCLE_PRE_BATTERY_INDICATOR:
      return (
        <div>
          Release to go to Battery Indicator, or continue holding to cycle L, M,
          H.
        </div>
      );
    case StateSuffix.CYCLE_BATTERY_INDICATOR_BEAT:
      return <div>Battery indicator is about to start.</div>;
    case StateSuffix.STABLE:
      return (
        <div>
          <div>{`Double click to toggle to ${humanOppositeLevel}.`}</div>
          <div>
            {isG5
              ? `If you toggle 6 times, you'll go into ${humanLevel2} programming mode.`
              : `If you toggle 6 times, you'll go into ${humanLevel} programming mode.`}
          </div>
          <div>
            Press and hold to cycle L, M, H. Press a single time to turn off.
          </div>
        </div>
      );

    case StateSuffix.TOGGLE_INTERMEDIATE_1:
    case StateSuffix.TOGGLE_INTERMEDIATE_2:
    case StateSuffix.TOGGLE_INTERMEDIATE_3:
    case StateSuffix.TOGGLE_INTERMEDIATE_4:
    case StateSuffix.TOGGLE_INTERMEDIATE_5:
    case StateSuffix.TOGGLE_INTERMEDIATE_6:
      return (
        <div>{`Click once more to toggle to ${humanOppositeLevel}, or wait for the lamp to turn off.`}</div>
      );

    case StateSuffix.TOGGLE_1:
    case StateSuffix.TOGGLE_2:
    case StateSuffix.TOGGLE_3:
    case StateSuffix.TOGGLE_4: {
      const remaining = 6 - parseInt(stateSuffix.slice(-1), 10);
      const toggleNum = parseInt(stateSuffix.slice(-1), 10);
      // In G6/G7, 6 double-clicks programs the starting sublevel.
      // Odd toggle numbers have swapped sublevel, even are same as start.
      const programmingTarget = isG5
        ? humanLevel2
        : toggleNum % 2 === 0 ? humanLevel : humanOppositeLevel;
      return (
        <div>
          <div>{`Double click to toggle to ${humanOppositeLevel}.`}</div>
          <div>
            {`If you toggle ${remaining} more times, you'll go into ${programmingTarget} programming mode.`}
          </div>
          <div>
            Press and hold to cycle L, M, H. Press a single time to turn off.
          </div>
        </div>
      );
    }

    case StateSuffix.TOGGLE_5: {
      // Toggle 5 is odd → sublevel is swapped from start → target is opposite
      const programmingTarget = isG5 ? humanLevel2 : humanOppositeLevel;
      return (
        <div>
          <div>{`Double click once more to go into ${programmingTarget} programming mode.`}</div>
          <div>
            Press and hold to cycle L, M, H. Press a single time to turn off.
          </div>
        </div>
      );
    }

    case StateSuffix.TOGGLE_6:
      return (
        <div>
          <div>{`Double click once more to go into ${humanLevel2} programming mode.`}</div>
          <div>
            Press and hold to cycle L, M, H. Press a single time to turn off.
          </div>
        </div>
      );
    case StateSuffix.TOGGLE_INTERMEDIATE_7:
      return (
        <div>{`Click once more to go into ${humanLevel2} programming mode, or wait for the lamp to turn off.`}</div>
      );

    case StateSuffix.SUBCYCLE_INTERMEDIATE:
      if (!isG5) {
        return (
          <div>
            Click once more to increase brightness, or wait to exit
            programming.
          </div>
        );
      }
      return (
        <div>{`Click once more to cycle to the next lumen level for ${humanLevel}, or wait for the lamp to turn off.`}</div>
      );

    case StateSuffix.SUBCYCLE:
      if (!isG5) {
        return (
          <div>
            <div>
              Double-click to increase brightness. Triple-click to decrease.
            </div>
            <div>
              Single-click or press and hold to exit programming mode.
              Will also exit after 12 seconds of inactivity.
            </div>
          </div>
        );
      }
      return (
        <div>
          <div>{`Double click to cycle through brightness levels for ${humanLevel}.`}</div>
          <div>
            {`Wait 12 seconds to exit programming mode. The most recently used lumen level will be remembered for ${humanLevel}.`}
          </div>
          <div>
            Press and hold to cycle L, M, H. Press a single time to turn off.
          </div>
        </div>
      );

    case StateSuffix.SUBCYCLE_PENDING:
      return (
        <div>
          Click once more to decrease brightness, or wait to increase.
        </div>
      );

    default:
      return <div />;
  }
}

export function getInformation(
  state: StateType,
  memory: MemoryInterface,
  lampName: string,
): {
  level: string,
  lumens: string,
  runtime: string,
  description: React.Element<'div'>,
} {
  if (
    state === State.OFF ||
    state === State.BATTERY_INDICATOR ||
    isGroupSelectState(state)
  ) {
    return {
      level: getLevel(state),
      lumens: '',
      runtime: '',
      description: getDescription(state, memory),
    };
  }

  const effectivePrefix = getEffectivePrefix(state, memory);
  if (effectivePrefix == null) {
    return {
      level: getLevel(state),
      lumens: '',
      runtime: '',
      description: getDescription(state, memory),
    };
  }
  return {
    level: getLevel(state),
    lumens: getLumens(effectivePrefix, lampName) != null
      ? `${getLumens(effectivePrefix, lampName)} Lm`
      : '',
    runtime: getRuntime(effectivePrefix, lampName) || '',
    description: getDescription(state, memory),
  };
}

export function getLongestDescription(): React.Element<'div'> {
  return (
    <div>
      <div>Double click to cycle through brightness levels for M2.</div>
      <div>
        Wait 12 seconds to exit programming mode. The most recently used lumen
        level will be remembered for M2.
      </div>
      <div>
        Press and hold to cycle L, M, H. Press a single time to turn off.
      </div>
    </div>
  );
}
