// @flow
import * as React from 'react';
import { useState } from 'react';

type Props = {};

export default function Settings(_props: Props): React.Element<'div'> {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutMultiplier, setTimeoutMultiplier] = useState('1x');

  if (!isOpen) {
    return (
      <div className="settings-cog unselectable" onClick={() => setIsOpen(true)}>
        &#9881;
      </div>
    );
  }

  return (
    <div className="settings-overlay" onClick={() => setIsOpen(false)}>
      <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-title">Settings</div>
          <div
            className="settings-close unselectable"
            onClick={() => setIsOpen(false)}
          >
            &#10005;
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-header">
            <div className="settings-item-title">Timeout Speed</div>
            <div className="settings-item-control">
              <div className="toggle-switch">
                <button
                  type="button"
                  className={`toggle-option${
                    timeoutMultiplier === '1x' ? ' selected' : ''
                  }`}
                  onClick={() => setTimeoutMultiplier('1x')}
                >
                  1x
                </button>
                <button
                  type="button"
                  className={`toggle-option${
                    timeoutMultiplier === '2x' ? ' selected' : ''
                  }`}
                  onClick={() => setTimeoutMultiplier('2x')}
                >
                  2x
                </button>
              </div>
            </div>
          </div>
          <div className="settings-item-description">
            Doubles the time window for double-clicks, triple-clicks, and
            timeouts. Useful if you find the default timing too fast.
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-header">
            <div className="settings-item-title">Hide G6/G7 Groups</div>
            <div className="settings-item-control">
              <label className="checkbox-label">
                <input type="checkbox" />
              </label>
            </div>
          </div>
          <div className="settings-item-description">
            Hides the G6 and G7 groups from the mode grid for a simpler
            interface. They will reappear if you switch into one of them.
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-header">
            <div className="settings-item-title">Factory Reset</div>
            <div className="settings-item-control">
              <button type="button" className="settings-button">
                Reset
              </button>
            </div>
          </div>
          <div className="settings-item-description">
            Resets all memory to factory defaults, including UI group selection,
            last-used sublevels, and all programmed brightness levels.
          </div>
        </div>
      </div>
    </div>
  );
}
