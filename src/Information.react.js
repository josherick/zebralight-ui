// @flow
import * as React from 'react';
import { useState } from 'react';

import type { StateType } from './state_machine/implementations/basic_ui/enums.js';
import type { MemoryInterface } from './state_machine/implementations/basic_ui/memory.js';

import { State } from './state_machine/implementations/basic_ui/enums.js';

import { getInformation, getLongestDescription } from './lampInformation.js';

import ModeGrid from './ModeGrid.react.js';

type Props = {
  lampState: StateType,
  memory: MemoryInterface,
};

export default function Information(props: Props): React.Element<'div'> | null {
  const { lampState } = props;
  const info = getInformation(lampState);
  const longestDescription = getLongestDescription();
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

  let descriptionClassName = 'description';
  let longestDescriptionPlaceholderClassName =
    'longest-description-placeholder';
  if (isExpanded && lampState !== State.OFF) {
    descriptionClassName += ' expanded';
    longestDescriptionPlaceholderClassName += ' expanded';
  }
  return (
    <div className={boxClassName}>
      <div className="top-section">
        {lampState !== State.BATTERY_INDICATOR && (
          <div className="top-section-unit">{info.lumens}</div>
        )}
        <div className="top-section-unit emphasized">{info.level}</div>
        {lampState !== State.BATTERY_INDICATOR && (
          <div className="top-section-unit">{info.runtime}</div>
        )}
      </div>
      <div className="bottom-section">
        <div className={descriptionClassName}>{info.description}</div>
        <div className={longestDescriptionPlaceholderClassName}>
          {longestDescription}
        </div>
      </div>
      {collapseExpand}
      {isExpanded && <ModeGrid {...props} />}
    </div>
  );
}
