// @flow
import * as React from 'react';

type Props = {
  isActive: boolean,
  humanLevel: string,
  lumens?: number,
};

export default function ModeGridCell({
  isActive,
  humanLevel,
  lumens,
}: Props): React.Element<'div'> | null {
  let cellClassName = 'cell';
  if (isActive) {
    cellClassName += ' active';
  }
  return (
    <div className={cellClassName}>
      <div className="human-level">{humanLevel}</div>
      {lumens && <div className="lumens">{lumens} Lm</div>}
    </div>
  );
}
