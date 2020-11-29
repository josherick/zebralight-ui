// @flow
require('file-loader?name=[name].[ext]!./index.html');
import * as React from 'react';
import ReactDOM from 'react-dom';
import App from './App.react.js';
ReactDOM.render(<App />, document.getElementById('root'));
