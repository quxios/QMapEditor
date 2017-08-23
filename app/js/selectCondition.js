import React from 'react'
import ReactDOM from 'react-dom'
import { ipcRenderer } from 'electron'

import Layout from './components/selectConditionLayout'

ipcRenderer.on('init', (event, data) => {
  ReactDOM.render(
    <Layout {...data} />,
    document.getElementById('conditionSelect')
  )
})
