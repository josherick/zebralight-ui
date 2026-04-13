// @flow
import * as React from 'react';

import Light from './Light.react.js';
import { SettingsProvider } from './SettingsContext.js';

export default function App(): React.Element<'div'> {
  return (
    <SettingsProvider>
      <div className="app-background">
        <Light />
      </div>
    </SettingsProvider>
  );
}
