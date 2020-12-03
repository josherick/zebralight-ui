// @flow

import * as React from 'react';

import type {
  StateType,
  StatePrefixType,
} from './state_machine/implementations/basic_ui/enums.js';
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
  getLumens as get604cLumens,
  getRuntime as get604cRuntime,
} from './configurations/604c.js';

export function getLumens(statePrefix: StatePrefixType): number {
  return get604cLumens()[statePrefix];
}

export function getRuntime(statePrefix: StatePrefixType): string {
  return get604cRuntime()[statePrefix];
}

export function getBrightnessLinearOrder(statePrefix: StatePrefixType): string {
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

  const level = parseLevel(state);
  if (level === Level.STROBE) {
    return 'Strobe';
  }
  const sublevel = parseSublevel(state);
  return `${level.toUpperCase()}${sublevel}`;
}

function getDescription(state: StateType): React.Element<'div'> {
  if (state === State.OFF) {
    return (
      <div>
        <div>
          Single click to turn the light to H, double click to go to M, triple
          click to go to Strobe, or quadruple click to show a battery indicator.
        </div>
        <div>
          At any time, press and hold to cycle L, M, H. When the lamp is on, you
          can always press a single time to turn off.
        </div>
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

  const level = parseLevel(state);
  if (level === Level.STROBE) {
    return <div>Double click to cycle through the four strobe levels.</div>;
  }

  const sublevel = parseSublevel(state);
  const humanLevel = `${level.toUpperCase()}${sublevel}`;
  const oppositeSublevel = sublevel === 1 ? 2 : 1;
  const humanOppositeLevel = `${level.toUpperCase()}${oppositeSublevel}`;
  const humanLevel2 = `${level.toUpperCase()}${2}`;

  const stateSuffix = parseSuffix(state);
  console.log('stateSuffix', stateSuffix);
  switch (stateSuffix) {
    case StateSuffix.CYCLE:
      // This state is used for cycle up and down.
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
      return (
        <div>
          Strobe is about to start. You can wait, or as always: press once to
          turn the light off or press and hold to cycle L, M, H.
        </div>
      );
    case StateSuffix.CYCLE_PRE_BATTERY_INDICATOR:
      return (
        <div>
          Release to go to Battery Indicator, or continue holding to cycle L, M,
          H.
        </div>
      );
    case StateSuffix.STABLE:
      return (
        <div>
          <div>{`Double click to toggle to ${humanOppositeLevel}.`}</div>
          <div>
            At any time, press and hold to cycle L, M, H. Any time the lamp is
            on, press a single time to turn off.
          </div>
        </div>
      );

    case StateSuffix.TOGGLE_INTERMEDIATE_1:
    case StateSuffix.TOGGLE_INTERMEDIATE_2:
    case StateSuffix.TOGGLE_INTERMEDIATE_3:
    case StateSuffix.TOGGLE_INTERMEDIATE_4:
    case StateSuffix.TOGGLE_INTERMEDIATE_5:
    case StateSuffix.TOGGLE_INTERMEDIATE_6:
      return <div>{`Click once more to toggle to ${humanOppositeLevel}.`}</div>;

    case StateSuffix.TOGGLE_1:
    case StateSuffix.TOGGLE_2:
    case StateSuffix.TOGGLE_3:
    case StateSuffix.TOGGLE_4:
    case StateSuffix.TOGGLE_5:
      return (
        <div>
          <div>{`Double click to toggle to ${humanOppositeLevel}.`}</div>
          <div>
            {`If you toggle ${
              7 - parseInt(stateSuffix.slice(-1), 10)
            } more times, you'll go into ${humanLevel2} programming mode where you can set the lumen level for ${humanLevel2}.`}
          </div>
        </div>
      );

    case StateSuffix.TOGGLE_6:
      return (
        <div>{`Double click to go into ${humanLevel2} programming mode.`}</div>
      );
    case StateSuffix.TOGGLE_INTERMEDIATE_7:
      return (
        <div>{`Click once more to go into ${humanLevel2} programming mode.`}</div>
      );

    case StateSuffix.SUBCYCLE_INTERMEDIATE:
      return (
        <div>{`Click once more to cycle to the next lumen level for ${humanLevel}`}</div>
      );
    case StateSuffix.SUBCYCLE:
      return (
        <div>
          <div>{`Double click to cycle through three lumen levels for ${humanLevel} from low to high.`}</div>
          <div>
            {`Wait 12 seconds to exit programming mode, press and hold to cycle L, M, H, or click once to turn the lamp off. The most recently used lumen level will be remembered for ${humanLevel}.`}
          </div>
        </div>
      );

    default:
      return <div />;
  }
}

export function getInformation(
  state: StateType,
): {
  level: string,
  lumens: string,
  runtime: string,
  description: React.Element<'div'>,
} {
  if (state === State.OFF || state === State.BATTERY_INDICATOR) {
    return {
      level: getLevel(state),
      lumens: '',
      runtime: '',
      description: getDescription(state),
    };
  }

  const statePrefix = parsePrefix(state);
  return {
    level: getLevel(state),
    lumens: `${getLumens(statePrefix)} Lm`,
    runtime: getRuntime(statePrefix),
    description: getDescription(state),
  };
}
