// @flow
import * as React from 'react';

import Light from './Light.react';

export default function App(): React.Element<'div'> {
  return (
    <div className="app-background">
      <Light />
    </div>
  );
}
