// @flow
import * as React from 'react';
import { useState } from 'react';

type TooltipItem = {
  label: string,
  isLastUsed: boolean,
};

type Props = {
  isActive: boolean,
  isLastUsed?: boolean,
  isHumanLevelVisible: boolean,
  humanLevel: string,
  lumens?: number,
  tooltipItems?: TooltipItem[],
};

export default function ModeGridCell({
  isActive,
  isLastUsed,
  isHumanLevelVisible,
  humanLevel,
  lumens,
  tooltipItems,
}: Props): React.Element<'div'> | null {
  const [showTooltip, setShowTooltip] = useState(false);

  let cellClassName = 'cell';
  if (isActive) {
    cellClassName += ' active';
  } else if (isLastUsed) {
    cellClassName += ' last-used';
  }

  let humanLevelClassName = 'human-level';
  if (!isHumanLevelVisible) {
    humanLevelClassName += ' invisible';
  }
  return (
    <div
      className={cellClassName}
      onClick={tooltipItems ? () => setShowTooltip(!showTooltip) : undefined}
    >
      <div className={humanLevelClassName}>{humanLevel}</div>
      {lumens != null && <div>{`${lumens} Lm`}</div>}
      {tooltipItems && showTooltip && (
        <div className="cell-tooltip">
          {tooltipItems.map((item, i) => (
            <span key={item.label}>
              {i > 0 && ', '}
              <span className={item.isLastUsed ? 'tooltip-last-used' : ''}>
                {item.label}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
