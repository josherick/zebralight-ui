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
        &#9881;
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
            <div className="settings-item-title">Timeout Speed</div>
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
            <div className="settings-item-title">Timeout Indicator</div>
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
            the screen. Subtle shows a thin grey bar, prominent makes it more
            visible, and off hides it entirely.
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
