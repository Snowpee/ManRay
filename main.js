const { MenuItem } = require('@electron/remote/main')
const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron')
// const path = require('path')

const createWindow = () => {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 420,
    height: 318,
    transparent: true,
    frame: false,
    roundedCorners: false,
    hasShadow: false,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
      // preload: path.join(__dirname, 'preload.js')
    }
  })
  require('@electron/remote/main').initialize()
  require("@electron/remote/main").enable(win.webContents)
  // 并且为你的应用加载index.html
  win.loadFile('index.html')

  // 打开开发者工具
  win.webContents.openDevTools()
  //接收通知 改变窗口高度
  const ipc = require('electron').ipcMain;
  ipc.on("setMainWindow", function (e, data) {
    win.setSize(data.width, data.height);
  })
  ipc.on("setAwaysOnTop", function (e, boolean) {
    win.setAlwaysOnTop(boolean);
  })
  ipc.on("isAwaysOnTop", function (e) {
    console.log("isAwaysOnTop 收到渲染进程请求");
    win.isAlwaysOnTop();
    // mainWindow.webContents.send('is-pin-window', true)
  })
  
  // 测试的右键菜单
  ipcMain.on('show-context-menu', (event, tempName) => {
    console.log(`已接收参数：${tempName}`)
    switch (tempName) {
      case 'mainTemplate':
        var template = [
          {
            label: '窗口置顶',
            click: () => {
            }
          }
        ]
        break;
      case 'imgViewTemplate':
        var template = [
          {
            label: '放大',
            click: () => {
              event.sender.send('context-menu-command', { "name": "scale-img", "val": 1 })
            }
          },
          {
            label: '缩小',
            click: () => {
              event.sender.send('context-menu-command', { "name": "scale-img", "val": .5 })
            }
          },
          {
            label: '实际大小',
            click: () => {
              event.sender.send('context-menu-command', { "name": "scale-img", "val": 1 })
            }
          },
          {
            label: '固定比例',
            submenu: [
            {
              label: '50%',
              click: () => {
                event.sender.send('context-menu-command', { "name": "scale-img", "val": .5 })
              }
            },
            {
              label: '100% 原始尺寸',
              click: () => {
                event.sender.send('context-menu-command', { "name": "scale-img", "val": 1 })
              }
            },
            {
              label: '200%',
              click: () => {
                event.sender.send('context-menu-command', { "name": "scale-img", "val": 2 })
              }
            },
          ]},
          { type: 'separator' },
          {
            label: '清空画布',
            click: () => {
              // event.sender.send('context-menu-command', { "name": "clean-canvas" })
              win.reload()
            }
          },
          { type: 'separator' },
          {
            label: '置顶窗口',
            // 直接召唤主进程窗口置顶方案
            click: () => {
              win.setAlwaysOnTop(true)
              console.log("窗口已置顶");
            }
          },
          {
            label: '不置顶窗口',
            // 点击则向渲染进程发送数据
            click: () => {
              win.setAlwaysOnTop(false)
              console.log("取消置顶");
            }
          }
        ]
        break;
    }

    
    const menu = Menu.buildFromTemplate(template)
    menu.popup(BrowserWindow.fromWebContents(event.sender))
  })
}
// Electron会在初始化完成并且准备好创建浏览器窗口时调用这个方法
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 您可以把应用程序其他的流程写在在此文件中
// 代码 也可以拆分成几个文件，然后用 require 导入。

//设置菜单

let tray = null
app.whenReady().then(() => {
  tray = new Tray('img/AppIcon.icns')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
})