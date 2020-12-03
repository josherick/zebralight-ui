// @flow
import * as React from 'react';
import { useState } from 'react';

import type { StateType } from './state_machine/implementations/basic_ui/enums.js';

import { getInformation } from './lampInformation.js';

import ModeGrid from './ModeGrid.react.js';

type Props = {
  lampState: StateType,
};

export default function Information({
  lampState,
}: Props): React.Element<'div'> | null {
  const info = getInformation(lampState);
  const [isExpanded, setIsExpanded] = useState(false);

  const collapseExpand = (
    <div
      className="expand-collapse-button unselectable"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className={isExpanded ? 'up-caret' : 'down-caret'} />
      {isExpanded ? 'Collapse' : 'Expand'}
      <div className={isExpanded ? 'up-caret' : 'down-caret'} />
    </div>
  );
  let boxClassName = 'information-box';
  if (isExpanded) {
    boxClassName += ' expanded';
  }
  return (
    <div className={boxClassName}>
      <div className="top-section">
        <div className="top-section-unit">{info.lumens}</div>
        <div className="top-section-unit emphasized">{info.level}</div>
        <div className="top-section-unit">{info.runtime}</div>
      </div>
      <div className="bottom-section">{info.description}</div>
      {collapseExpand}
      {isExpanded && <ModeGrid lampState={lampState} />}
    </div>
  );
}
