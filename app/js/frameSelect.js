import React from 'react'
import ReactDOM from 'react-dom'
import { ipcRenderer } from 'electron'

import Layout from './components/frameSelectLayout'

ipcRenderer.on('init', (event, data) => {
  const oh = window.outerHeight - window.innerHeight;
  var h1 = data.height * data.rows;
  let height = Math.min(h1 + oh + 50, screen.height - 100);
  window.resizeTo(window.innerWidth, height);
  ReactDOM.render(
    <Layout data={data} height={height}/>,
    document.getElementById('frameSelect')
  )
})
