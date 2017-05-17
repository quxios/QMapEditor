import fs from 'fs'
import path from 'path'
import { observe } from 'mobx'
import { ipcRenderer } from 'electron'

import Store from './store'

document.getElementById('cssLight').disabled = true;
document.getElementById('cssDark').disabled  = true;

if (process.env.PRODUCTION === 'false') {
  fs.watch(path.join(__dirname, './../css'), (eventType, filename) => {
    if (eventType === 'change') {
      const links = document.getElementsByTagName('link');
      for (let i = 0; i < links.length; i++) {
        let link = links[i];
        if (link.rel === 'stylesheet') {
          const time = `?${Date.now()}`
          link.href = link.href.replace(/\?.*$/, time);
        }
      }
    }
  })
}

observe(Store, 'theme', ({newValue}) => {
  document.getElementById('cssLight').disabled = true;
  document.getElementById('cssDark').disabled = true;
  if (newValue === 'light') {
    document.getElementById('cssLight').disabled = false;
  } else {
    document.getElementById('cssDark').disabled = false;
  }
})

Store.theme = ipcRenderer.sendSync('getTheme');
