// @flow
import * as React from 'react';

type Props = {
  onPress: () => void,
  onRelease: () => void,
};

export default function Button({
  onPress,
  onRelease,
}: Props): React.Element<'button'> {
  return (
    <button
      onMouseDown={onPress}
      onMouseUp={onRelease}
      type="button"
      label="Zebralight Button"
      className="zebralight-button"
    />
  );
}
