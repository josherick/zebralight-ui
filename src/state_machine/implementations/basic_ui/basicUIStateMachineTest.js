// @flow
import type { StateType } from './enums.js';
import type { StateMachine } from '../../createStateMachine.js';

import { State, Transition } from './enums.js';
import makeBasicUIStateMachine from './makeBasicUIStateMachine.js';

let stateMachine: StateMachine;

function expectState(
  expectedState: StateType,
  failureReason: ?string = null
): void {
  if (stateMachine.getCurrentState() === expectedState) {
    return;
  }
  throw new Error(
    `Assertion failed. "${stateMachine.getCurrentState()}" differed from expected state "${expectedState}". ${
      failureReason ?? ''
    }`
  );
}

function assert(expressionResult: boolean, failureReason: string): void {
  if (expressionResult == true) {
    return;
  }
  throw new Error(`Assertion failed: ${failureReason}`);
}

// Helper functions
function repeat(repetitions: number, workFn: () => void): void {
  for (let i = 0; i < repetitions; i++) {
    workFn();
  }
}
function shortPress(repetitions: number = 1): void {
  repeat(repetitions, () => {
    stateMachine.transition(Transition.PRESS_START);
    stateMachine.transition(Transition.SHORT_PRESS_RELEASE);
  });
}

function longPressStartAndHoldBeat(repetitions: number = 1): void {
  repeat(repetitions, () => {
    stateMachine.transition(Transition.PRESS_START);
    stateMachine.transition(Transition.LONG_PRESS_BEAT);
  });
}

function longPressHoldAdditionalBeat(repetitions: number = 1): void {
  repeat(repetitions, () =>
    stateMachine.transition(Transition.LONG_PRESS_BEAT)
  );
}

function longPressRelease(repetitions: number = 1): void {
  repeat(repetitions, () =>
    stateMachine.transition(Transition.LONG_PRESS_RELEASE)
  );
}

function shortPause(repetitions: number = 1): void {
  repeat(repetitions, () =>
    stateMachine.transition(Transition.MULTI_SINGLE_PRESS_TIMEOUT)
  );
}

function longPause(repetitions: number = 1): void {
  repeat(repetitions, () =>
    stateMachine.transition(Transition.MULTI_DOUBLE_PRESS_TIMEOUT)
  );
}

function batteryIndicatorTimeout(repetitions: number = 1): void {
  repeat(repetitions, () =>
    stateMachine.transition(Transition.BATTERY_INDICATOR_FINISHED)
  );
}

// Tests

const testCases = [
  function testTurnOnHighFromTop() {
    shortPress();
    shortPause();
    expectState(State.H1_STABLE);
    shortPress();
    shortPause();
    expectState(State.OFF);
  },

  function testTurnOnMediumFromTop() {
    shortPress(2);
    shortPause();
    expectState(State.M1_STABLE);
    shortPress();
    shortPause();
    expectState(State.OFF);
  },

  function testTurnOnStrobeFromTop() {
    shortPress(3);
    shortPause();
    expectState(State.STROBE1_4_SUBCYCLE);
    shortPress();
    shortPause();
    expectState(State.OFF);
  },

  function testBatteryIndicator() {
    shortPress(4);
    expectState(State.BATTERY_INDICATOR);
    batteryIndicatorTimeout();
    expectState(State.OFF);
  },

  function testTurnOnLowFromBottom() {
    longPressStartAndHoldBeat();
    longPressRelease();
    expectState(State.L1_STABLE);
  },

  function testTurnOnMediumFromBottom() {
    longPressStartAndHoldBeat();
    longPressHoldAdditionalBeat();
    longPressRelease();
    expectState(State.M1_STABLE);
  },

  function testTurnOnHighFromBottom() {
    longPressStartAndHoldBeat();
    longPressHoldAdditionalBeat(2);
    longPressRelease();
    expectState(State.H1_STABLE);
  },

  function testTurnOnLowFromBottomViaWrapAround() {
    longPressStartAndHoldBeat();
    longPressHoldAdditionalBeat(3);
    longPressRelease();
    expectState(State.L1_STABLE);
  },

  function testH2Stable() {
    shortPress();
    shortPause();
    expectState(State.H1_STABLE);
    shortPress(2);
    expectState(State.H2_1_TOGGLE_1);
    longPause();
    expectState(State.H2_1_STABLE);
  },

  function testLowSublevelMemoryThroughOff() {
    longPressStartAndHoldBeat();
    longPressRelease();
    expectState(State.L1_STABLE);
    shortPress(2);
    longPause();
    expectState(State.L2_1_STABLE);
    shortPress();
    shortPause();
    expectState(State.OFF);

    longPressStartAndHoldBeat();
    longPressRelease();
    expectState(State.L2_1_STABLE);
  },

  function testH2ProgrammingMode() {
    shortPress();
    shortPause();
    shortPress(13);
    expectState(State.H1_TOGGLE_INTERMEDIATE_7);
    shortPress();
    expectState(State.H2_3_SUBCYCLE);
    shortPress(2);
    expectState(State.H2_2_SUBCYCLE);
    shortPress(2);
    expectState(State.H2_1_SUBCYCLE);
    shortPress(2);
    expectState(State.H2_3_SUBCYCLE);

    longPause();
    shortPress(2);
    longPause();
    expectState(State.H1_STABLE);
    shortPress(2);
    longPause();
    expectState(State.H2_3_STABLE);
  },

  function testStrobeSubcycleMode() {
    shortPress(3);
    shortPause();
    expectState(State.STROBE1_4_SUBCYCLE);
    shortPress(2);
    expectState(State.STROBE1_3_SUBCYCLE);
    shortPress(2);
    expectState(State.STROBE1_2_SUBCYCLE);
    shortPress(2);
    expectState(State.STROBE1_1_SUBCYCLE);
    shortPress(2);
    expectState(State.STROBE1_4_SUBCYCLE);

    longPressStartAndHoldBeat();
    longPressRelease();
    expectState(State.L1_STABLE);
  },

  function testM2SubcycleProgrammingModeThroughOff() {
    shortPress(2);
    shortPause();
    shortPress(13);
    expectState(State.M1_TOGGLE_INTERMEDIATE_7);
    shortPress();
    expectState(State.M2_3_SUBCYCLE);
    longPause();
    shortPress(2);
    longPause();
    expectState(State.M1_STABLE);
    shortPress();
    shortPause();
    expectState(State.OFF);

    longPressStartAndHoldBeat();
    longPressHoldAdditionalBeat();
    longPressRelease();
    expectState(State.M1_STABLE);

    shortPress(2);
    longPause();
    expectState(State.M2_3_STABLE);
  },
];

export default function runAllTestCases() {
  testCases.forEach((caseFn) => {
    console.log(`\nRunning "${caseFn.name}"`);
    stateMachine = makeBasicUIStateMachine();
    caseFn();
  });
}
