// @flow
import * as React from 'react';
import { useCallback, useState } from 'react';

import type { TransitionType } from './state_machine/implementations/basic_ui/enums.js';
import { Transition } from './state_machine/implementations/basic_ui/enums.js';
import useTimer from './useTimer.js';
import { useSettings } from './SettingsContext.js';

import Button from './Button.react.js';

type Props = {
  onEvent: (TransitionType) => void,
};

const BASE_LONG_PRESS_BEAT_TIMEOUT_MS = 600;
const BASE_MULTI_SINGLE_PRESS_TIMEOUT_MS = 600;
const MULTI_DOUBLE_PRESS_TIMEOUT_MS = 12000;

export default function ZebralightButton({
  onEvent,
}: Props): React.Element<typeof Button> {
  const { settings } = useSettings();
  const multiplier = settings.timeoutMultiplier === '4x' ? 4 : settings.timeoutMultiplier === '2x' ? 2 : 1;
  const [longPressActive, setLongPressActive] = useState<boolean>(false);

  const onLongPressBeat = useCallback(() => {
    setLongPressActive(true);
    onEvent(Transition.LONG_PRESS_BEAT);
    return true;
  }, [onEvent, setLongPressActive]);

  const onMultiSinglePressTimeout = useCallback(() => {
    onEvent(Transition.MULTI_SINGLE_PRESS_TIMEOUT);
    return false;
  }, [onEvent]);
  const onMultiDoublePressTimeout = useCallback(() => {
    onEvent(Transition.MULTI_DOUBLE_PRESS_TIMEOUT);
    return false;
  }, [onEvent]);

  const [restartLongPressTimer, cancelLongPressTimer] = useTimer(
    BASE_LONG_PRESS_BEAT_TIMEOUT_MS * multiplier,
    onLongPressBeat,
  );
  const [restartMultiSinglePressTimer, cancelMultiSinglePressTimer] = useTimer(
    BASE_MULTI_SINGLE_PRESS_TIMEOUT_MS * multiplier,
    onMultiSinglePressTimeout,
  );
  const [restartMultiDoublePressTimer, cancelMultiDoublePressTimer] = useTimer(
    MULTI_DOUBLE_PRESS_TIMEOUT_MS,
    onMultiDoublePressTimeout,
  );

  const onPress = useCallback(() => {
    onEvent(Transition.PRESS_START);
    cancelMultiSinglePressTimer();
    cancelMultiDoublePressTimer();
    restartLongPressTimer();
  }, [
    cancelMultiDoublePressTimer,
    cancelMultiSinglePressTimer,
    onEvent,
    restartLongPressTimer,
  ]);
  const onRelease = useCallback(() => {
    cancelLongPressTimer();
    if (longPressActive) {
      onEvent(Transition.LONG_PRESS_RELEASE);
      setLongPressActive(false);
    } else {
      onEvent(Transition.SHORT_PRESS_RELEASE);
    }
    restartMultiSinglePressTimer();
    restartMultiDoublePressTimer();
  }, [
    cancelLongPressTimer,
    longPressActive,
    onEvent,
    restartMultiDoublePressTimer,
    restartMultiSinglePressTimer,
    setLongPressActive,
  ]);

  return <Button onPress={onPress} onRelease={onRelease} />;
}
