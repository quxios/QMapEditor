import React from 'react'
import ReactDOM from 'react-dom'
import PIXI from 'pixi.js'

import Store from './manager/store'
import Manager from './manager'
import Layout from './components/layout'

ReactDOM.render(
  <Layout store={Store} />,
  document.getElementById('app')
);

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  Manager.notify('ERROR', `${errorMsg}\n${url}:${lineNumber}`);
};
