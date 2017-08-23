import React from 'react'
import ReactDOM from 'react-dom'
import { ipcRenderer } from 'electron'

import Layout from './components/selectFrameLayout'

ipcRenderer.on('init', (event, data) => {
  ReactDOM.render(
    <Layout data={data} height={window.innerHeight} />,
    document.getElementById('frameSelect')
  )
})
