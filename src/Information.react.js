// @flow
import * as React from 'react';

import type { StateType } from './state_machine/implementations/basic_ui/enums.js';

import { getInformation } from './lampInformation.js';

type Props = {
  lampState: StateType,
};

export default function Information({
  lampState,
}: Props): React.Element<'div'> | null {
  const info = getInformation(lampState);
  return (
    <div className="information-box">
      <div className="top-section">
        <div className="top-section-unit">{info.lumens}</div>
        <div className="top-section-unit emphasized">{info.level}</div>
        <div className="top-section-unit">{info.runtime}</div>
      </div>
      <div className="bottom-section">{info.description}</div>
    </div>
  );
}
