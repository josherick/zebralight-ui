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
        <div>When the light is off:</div>
        <ul>
          <li>1 short click to High</li>
          <li>2 short clicks to Medium</li>
          <li>3 short clicks to Strobe</li>
          <li>4 short clicks to indicate battery level</li>
          <li>
            Press and hold to cycle L, M, H.
            <ul>
              <li>Press/hold also works when the light is on.</li>
            </ul>
          </li>
        </ul>
        <div>When the light is on, one short click turns off the light.</div>
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
    return (
      <div>
        <div>Double click to cycle through the four strobe levels.</div>
        <div>
          Press and hold to cycle L, M, H. Press a single time to turn off.
        </div>
      </div>
    );
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
      return <div>Strobe is about to start.</div>;
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
          <div>
            Press and hold to cycle L, M, H. Press a single time to turn off.
          </div>
        </div>
      );

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
      return (
        <div>{`Click once more to cycle to the next lumen level for ${humanLevel}, or wait for the lamp to turn off.`}</div>
      );
    case StateSuffix.SUBCYCLE:
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

export function getLongestDescription(): React.Element<'div'> {
  return (
    <div>
      <div>Double click to cycle through brightness levels for H2.</div>
      <div>
        Wait 12 seconds to exit programming mode. The most recently used lumen
        level will be remembered for H2.
      </div>
      <div>
        Press and hold to cycle L, M, H. Press a single time to turn off.
      </div>
    </div>
  );
}
