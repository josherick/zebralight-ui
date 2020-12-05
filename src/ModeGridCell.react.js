// @flow
import * as React from 'react';

type Props = {
  isActive: boolean,
  isHumanLevelVisible: boolean,
  humanLevel: string,
  lumens?: number,
};

export default function ModeGridCell({
  isActive,
  isHumanLevelVisible,
  humanLevel,
  lumens,
}: Props): React.Element<'div'> | null {
  let cellClassName = 'cell';
  if (isActive) {
    cellClassName += ' active';
  }

  let humanLevelClassName = 'human-level';
  if (!isHumanLevelVisible) {
    humanLevelClassName += ' invisible';
  }
  return (
    <div className={cellClassName}>
      <div className={humanLevelClassName}>{humanLevel}</div>
      {lumens && <div className="lumens">{lumens} Lm</div>}
    </div>
  );
}
