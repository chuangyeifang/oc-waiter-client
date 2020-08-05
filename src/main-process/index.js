/* eslint-disable no-console */
'use strict'

import { app, protocol, BrowserWindow, dialog, ipcMain, globalShortcut } from 'electron'
import { autoUpdater } from 'electron-updater'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

global.session = {}

const message = {
  error: '检查更新出错',
  checking: '正在检查更新……',
  updateAva: '检测到新版本，正在下载……',
  updateNotAva: '现在使用的就是最新版本，不用更新'
}

let loginWindow
let workstandWindow

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true }}])

function createLoginWindow() {
  if (loginWindow) {
    return
  }
  loginWindow = new BrowserWindow({
    title: '欢迎登录',
    icon: 'src/assets/logo.png',
    width: 420,
    height: 362,
    opacity: 0,
    center: true,
    frame: false,
    movable: true,
    resizable: false,
    minimizable: true,
    maximizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: true
    }
  })
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    loginWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'login.html')
  } else {
    createProtocol('app')
    loginWindow.loadURL('app://./login.html')
  }
  loginWindow.once('ready-to-show', () => {
    loginWindow.show()
    let opacity = 0
    const interval = setInterval(() => {
      opacity += 0.1
      if (opacity >= 1) {
        clearInterval(interval)
        return
      }
      loginWindow.setOpacity(opacity)
    }, 50)
  })
  loginWindow.on('closed', () => {
    loginWindow = null
  })
}

function createWorkstandWindow() {
  if (workstandWindow) {
    workstandWindow.close()
    workstandWindow = null
  }
  workstandWindow = new BrowserWindow({
    title: '客服工作台',
    icon: 'src/assets/logo.png',
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 720,
    opacity: 0,
    center: true,
    frame: false,
    movable: true,
    resizable: true,
    minimizable: true,
    maximizable: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    workstandWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'index.html')
  } else {
    createProtocol('app')
    workstandWindow.loadURL('app://./index.html')
  }
  workstandWindow.on('closed', () => {
    workstandWindow = null
  })
}

ipcMain.on('workstand-open', (event, session) => {
  global.session = session
  createWorkstandWindow()
})

ipcMain.on('workstand-done', () => {
  if (loginWindow) {
    loginWindow.close()
    loginWindow = null
  }
  workstandWindow.show()
  let opacity = 0
  const interval = setInterval(() => {
    opacity += 0.1
    if (opacity >= 1) {
      clearInterval(interval)
      return
    }
    workstandWindow.setOpacity(opacity)
  }, 50)
})

ipcMain.on('workstand-error', (event, res) => {
  if (workstandWindow) {
    workstandWindow.close()
    workstandWindow = null
  }
  loginWindow.webContents.send('workstand-reply', res)
})

ipcMain.on('flash-frame', () => {
  workstandWindow.flashFrame(true)
})

ipcMain.on('login-window-opt', (event, opt) => {
  if (opt === 'min') {
    loginWindow.minimize()
  } else if (opt === 'close') {
    app.quit()
  }
})

ipcMain.on('win-operation', (event, opt) => {
  if (opt === 'min') {
    workstandWindow.minimize()
  } else if (opt === 'max') {
    if (workstandWindow.isMaximized()) {
      workstandWindow.unmaximize()
    } else {
      workstandWindow.maximize()
    }
  } else if (opt === 'close') {
    app.quit()
  }
})

ipcMain.on('system-exit', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  globalShortcut.unregisterAll()
})

app.on('ready', async() => {
  createLoginWindow()

  globalShortcut.unregisterAll()

  globalShortcut.register('CommandOrControl+R', () => {
    return false
  })
  globalShortcut.register('CommandOrControl+O', () => {
    if (loginWindow && loginWindow.isFocused()) {
      loginWindow.webContents.openDevTools()
    }
    if (workstandWindow && workstandWindow.isFocused) {
      workstandWindow.webContents.openDevTools()
    }
    return false
  })
  startAutoUpdater()
})

function startAutoUpdater() {
  autoUpdater.setFeedURL(process.env.VUE_APP_DOWNLOAD_URL)
  setTimeout(() => {
    autoUpdater.checkForUpdates()
  }, 1000)
}

app.on('browser-window-focus', () => {
  if (loginWindow) {
    loginWindow.flashFrame(false)
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

autoUpdater.on('update-downloaded', () => {
  const dialogOpts = {
    type: 'info',
    buttons: ['更新并重启', '稍后更新'],
    title: '新版本更新',
    message: '万象客服系统更新'
  }
  dialog.showMessageBox(dialogOpts, (response) => {
    if (response === 0) {
      autoUpdater.quitAndInstall()
    }
  })
})
autoUpdater.on('error', function() {
  sendUpdateMessage(message.error)
})
autoUpdater.on('checking-for-update', function() {
  sendUpdateMessage(message.checking)
})
autoUpdater.on('update-available', function() {
  sendUpdateMessage(message.updateAva)
})
autoUpdater.on('update-not-available', function() {
  sendUpdateMessage(message.updateNotAva)
})

autoUpdater.on('download-progress', function() {})

function sendUpdateMessage(text) {
  console.log(text)
}
