// @flow
import * as React from 'react';
import { useState } from 'react';

type Props = {
  isActive: boolean,
  isHumanLevelVisible: boolean,
  humanLevel: string,
  lumens?: number,
  tooltip?: string,
};

export default function ModeGridCell({
  isActive,
  isHumanLevelVisible,
  humanLevel,
  lumens,
  tooltip,
}: Props): React.Element<'div'> | null {
  const [showTooltip, setShowTooltip] = useState(false);

  let cellClassName = 'cell';
  if (isActive) {
    cellClassName += ' active';
  }

  let humanLevelClassName = 'human-level';
  if (!isHumanLevelVisible) {
    humanLevelClassName += ' invisible';
  }
  return (
    <div
      className={cellClassName}
      onClick={tooltip ? () => setShowTooltip(!showTooltip) : undefined}
    >
      <div className={humanLevelClassName}>{humanLevel}</div>
      {lumens != null && <div>{`${lumens} Lm`}</div>}
      {tooltip && showTooltip && (
        <div className="cell-tooltip">{tooltip}</div>
      )}
    </div>
  );
}
