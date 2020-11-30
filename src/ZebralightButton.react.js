// @flow
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { TransitionType } from './state_machine/implementations/basic_ui/enums';
import { Transition } from './state_machine/implementations/basic_ui/enums';
import useTimer from './useTimer';

import Button from './Button.react';

type Props = {
  onEvent: (TransitionType) => void,
};

const LONG_PRESS_BEAT_TIMEOUT_MS = 500;
const MULTI_SINGLE_PRESS_TIMEOUT_MS = 500;
const MULTI_DOUBLE_PRESS_TIMEOUT_MS = 12000;

export default function ZebralightButton({
  onEvent,
}: Props): React.Element<typeof Button> {
  const [longPressActive, setLongPressActive] = useState<boolean>(false);

  const onLongPressBeat = useCallback(
    (restart) => {
      console.log('Long press beat fired');
      setLongPressActive(true);
      onEvent(Transition.LONG_PRESS_BEAT);
      return true;
    },
    [onEvent, setLongPressActive],
  );

  const onMultiSinglePressTimeout = useCallback(
    (_) => {
      console.log('Multi single press timeout fired');
      onEvent(Transition.MULTI_SINGLE_PRESS_TIMEOUT);
      return false;
    },
    [onEvent],
  );
  const onMultiDoublePressTimeout = useCallback(
    (_) => {
      console.log('Multi double press time');
      onEvent(Transition.MULTI_DOUBLE_PRESS_TIMEOUT);
      return false;
    },
    [onEvent],
  );

  const [restartLongPressTimer, cancelLongPressTimer] = useTimer(
    LONG_PRESS_BEAT_TIMEOUT_MS,
    onLongPressBeat,
  );
  const [restartMultiSinglePressTimer, cancelMultiSinglePressTimer] = useTimer(
    MULTI_SINGLE_PRESS_TIMEOUT_MS,
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
    onEvent,
    restartMultiDoublePressTimer,
    restartMultiSinglePressTimer,
    setLongPressActive,
  ]);

  return <Button onPress={onPress} onRelease={onRelease} />;
}
