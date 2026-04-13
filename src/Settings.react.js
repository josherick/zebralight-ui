// @flow
import * as React from 'react';
import { useState } from 'react';

import type { MemoryInterface } from './state_machine/implementations/basic_ui/memory.js';
import { useSettings } from './SettingsContext.js';
import LampSelector from './LampSelector.react.js';

type Props = {
  memory: MemoryInterface,
  onFactoryReset: () => void,
};

export default function Settings({ memory, onFactoryReset }: Props): React.Element<'div'> {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting } = useSettings();
  const [confirmReset, setConfirmReset] = useState(false);

  function closeDialog() {
    setIsOpen(false);
    setConfirmReset(false);
  }
  const inG6G7 = memory.getUIGroup() !== 'g5';

  if (!isOpen) {
    return (
      <div className="settings-cog unselectable" onClick={() => setIsOpen(true)}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.48.48 0 00-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="settings-overlay" onClick={() => closeDialog()}>
      <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-title">Settings</div>
          <div
            className="settings-close unselectable"
            onClick={() => closeDialog()}
          >
            &#10005;
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-header">
            <div className="settings-item-title">Slower Click Timeouts</div>
            <div className="settings-item-control">
              <div className="toggle-switch">
                <button
                  type="button"
                  className={`toggle-option${
                    settings.timeoutMultiplier === '1x' ? ' selected' : ''
                  }`}
                  onClick={() => updateSetting('timeoutMultiplier', '1x')}
                >
                  1x
                </button>
                <button
                  type="button"
                  className={`toggle-option${
                    settings.timeoutMultiplier === '2x' ? ' selected' : ''
                  }`}
                  onClick={() => updateSetting('timeoutMultiplier', '2x')}
                >
                  2x
                </button>
                <button
                  type="button"
                  className={`toggle-option${
                    settings.timeoutMultiplier === '4x' ? ' selected' : ''
                  }`}
                  onClick={() => updateSetting('timeoutMultiplier', '4x')}
                >
                  4x
                </button>
              </div>
            </div>
          </div>
          <div className="settings-item-description">
            Allows slower double-clicks, triple-clicks, and long-press cycling.
            Useful if you find the default timing too fast.
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-header">
            <div className="settings-item-title">Click Timeout Indicator</div>
            <div className="settings-item-control">
              <select
                className="settings-select"
                value={settings.timeoutIndicator}
                onChange={(e) => updateSetting('timeoutIndicator', e.target.value)}
              >
                <option value="subtle">Subtle</option>
                <option value="prominent">Prominent</option>
                <option value="off">Off</option>
              </select>
            </div>
          </div>
          <div className="settings-item-description">
            Controls the visibility of the timeout countdown bar at the top of
            the screen.
          </div>
        </div>

        <div className={`settings-item${inG6G7 ? ' disabled' : ''}`}>
          <div className="settings-item-header">
            <div className="settings-item-title">Hide G6/G7 Groups</div>
            <div className="settings-item-control">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.hideG6G7}
                  disabled={inG6G7}
                  onChange={(e) => updateSetting('hideG6G7', e.target.checked)}
                />
              </label>
            </div>
          </div>
          <div className="settings-item-description">
            {inG6G7
              ? 'Cannot hide G6/G7 while currently in a G6 or G7 group.'
              : 'Hides the G6 and G7 groups from the mode grid for a simpler interface. They will reappear if you switch into one of them.'}
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-header">
            <div className="settings-item-title">Select Lamp</div>
          </div>
          <div className="settings-item-description">
            Select a lamp to show its lumen and runtime values. Some lamps in the list may have a slightly different UI, but
            this setting only changes the displayed lumen and runtime values.
          </div>
          <LampSelector
            value={settings.selectedLamp}
            onChange={(name) => updateSetting('selectedLamp', name)}
          />
        </div>

        <div className="settings-item">
          <div className="settings-item-header">
            <div className="settings-item-title">Factory Reset</div>
            <div className="settings-item-control">
              <button
                type="button"
                className={`settings-button${confirmReset ? ' confirm' : ''}`}
                onClick={() => {
                  if (confirmReset) {
                    onFactoryReset();
                    setConfirmReset(false);
                    closeDialog();
                  } else {
                    setConfirmReset(true);
                  }
                }}
              >
                {confirmReset ? 'Confirm' : 'Reset'}
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
