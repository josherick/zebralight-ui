// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import App from './App.react';

/* eslint-disable */
require('file-loader?name=[name].[ext]!./index.html');
require('./containerStyles.css');
require('./lightStyles.css');
/* eslint-enable */

ReactDOM.render(<App />, document.getElementById('root'));
