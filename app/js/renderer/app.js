import PIXI from 'pixi.js'

import React from 'react'
import ReactDOM from 'react-dom'

import Store from './store'
import Style from './style'
import Layout from './components/layout'


ReactDOM.render(
  <Layout store={Store} />,
  document.getElementById('app')
);

window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
  Store.notify('ERROR', `${errorMsg}\n${url}:${lineNumber}`);
};
