// const { MenuItem } = require('@electron/remote/main')
const { app, BrowserWindow, Menu, Tray, ipcMain, dialog, ipcRenderer } = require('electron')
const fs = require('fs');
const path = require('path');
const ipc = require('electron').ipcMain;
// require('@electron/remote/main').initialize()
// require("@electron/remote/main").enable(win.webContents)

var win;
const createWindow = () => {
  // 创建浏览器窗口
    win = new BrowserWindow({
    width: 420,
    height: 318,
    transparent: true,
    frame: false,
    roundedCorners: false,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      // enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
      // preload: path.join(__dirname, 'preload.js')
    }
  })
  // 并且为你的应用加载index.html
  win.loadFile('index.html')
} // end createWindow
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


// ================== 渲染进程通讯 ================= //


// 红绿灯按钮
ipcMain.on("windowsRendeCommand", function (e, data) {
  switch (data.name) {
    case 'close':
      win.close();
      break;
    case 'min':
      win.minimize();
  }
})

// 其他



// 打开开发者工具
// win.webContents.openDevTools()

// } // end createWindow


// ============ 窗口相关 ============

//接收通知 改变窗口高度
ipc.on("setMainWindow", function (e, data) {
  win.setSize(data.width, data.height, false);
})
ipc.on("setAwaysOnTop", function (e, boolean) {
  win.setAlwaysOnTop(boolean);
})
ipc.on("isAwaysOnTop", function (e) {
  console.log("isAwaysOnTop 收到渲染进程请求");
  win.isAlwaysOnTop();
  // mainWindow.webContents.send('is-pin-window', true)
})
ipc.on("setClickThroughWindow", function (e, boolean) {
  win.setIgnoreMouseEvents(boolean)
})
ipc.on('win-set-resizable', (event, vl) => {
  console.log('收到窗口可调命令')
  win.setResizable(vl)
})
// 窗口穿透相关
ipc.on("setIgnoreMouse", function (e, vl) {
  win.setIgnoreMouseEvents(vl, { forward: true });
  console.log(`目前窗口点击穿透？${vl}`)
})
// 检测窗口状态，以控制相关显示
app.on('browser-window-blur', (event, vl) => {
  console.log('窗口已失去焦点');
  win.webContents.send('winFocus', false)
})
app.on('browser-window-focus', (event, vl) => {
  console.log('窗口已激活！');
  win.webContents.send('winFocus', true)
})




// ============ MENU ===========
// 测试的右键菜单
ipcMain.on('show-context-menu', (event, tempName) => {
  console.log(`已接收参数：${tempName}`)
  switch (tempName) {
    case 'mainTemplate':
      var template = [
        {
          label: '打开...',
          click: () => {
            event.sender.send('context-menu-command', { "name": "open-dialog" })
          }
        },
        { type: 'separator' },
        {
          label: '窗口置顶',
          type: 'checkbox',
          checked: false,
          click: (menuItem) => {
            menuItem.checked = !menuItem.checked;
          },
        }
      ]
      break;
    case 'imgViewTemplate':
      var template = [
        {
          label: '放大',
          click: () => {
            event.sender.send('context-menu-command', { "name": "zoom-in" })
          }
        },
        {
          label: '缩小',
          click: () => {
            event.sender.send('context-menu-command', { "name": "zoom-out" })
          }
        },
        {
          label: '实际大小',
          click: () => {
            event.sender.send('context-menu-command', { "name": "zoom-actual" })
          }
        },
        {
          label: '固定比例',
          submenu: [
            {
              label: '50%',
              click: () => {
                event.sender.send('context-menu-command', { "name": "zoom-half" })
                // do sth
              }
            },
            {
              label: '100%',
              click: () => {
                event.sender.send('context-menu-command', { "name": "zoom-actual" })
              }
            },
            {
              label: '200%',
              click: () => {
                event.sender.send('context-menu-command', { "name": "zoom-double" })
              }
            },
          ]
        },
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
          type: 'checkbox',
          checked: false,
          // 直接召唤主进程窗口置顶方案
          click: (menuItem) => {
            // win.setAlwaysOnTop(true);
            let isChecked = menuItem.checked;
            if (isChecked == true) {
              isChecked = false;
              console.log(isChecked);
              console.log("窗口取消置顶");
            } else {
              isChecked = true;
              console.log(isChecked);
              console.log("窗口已置顶");
            }
          }
        },
      ]
      break;
  }


  const menu = Menu.buildFromTemplate(template)
  menu.popup(BrowserWindow.fromWebContents(event.sender))
})

/*
================ 全局菜单 ================
*/

const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { label: '关于', role: 'about' },
      { type: 'separator' },
      { label: '服务', role: 'services' },
      { type: 'separator' },
      { label: '隐藏', role: 'hide' },
      { label: '隐藏其它', role: 'hideOthers' },
      { label: '全部显示', role: 'unhide' },
      { type: 'separator' },
      { label: '退出', role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: '文件',
    submenu: [
      {
        label: '新建窗口',
        accelerator: 'CommandOrControl+n',
        role: 'new',
        click: () => {
          // 暂时注释掉，还没进行多窗口适配
          createWindow();
        }
      },
      { type: 'separator' },
      {
        label: '打开...',
        accelerator: 'CommandOrControl+o',
        click: () => {
          // 这里要想法怎么打开
          win.webContents.send('menuCommand', {'name': 'open-file'})
        }
      },
      { 
        label: '清空画布',
        role: 'reload',
        accelerator: 'CommandOrControl+backspace',
       },
      { type: 'separator' },
      ...(isMac ? [
        { label: '关闭', role: 'close' }
      ] : [
        { role: 'quit' }
      ])
    ]
  },
  // 编辑
  {
    label: '编辑',
    submenu: [
      { role: 'copy'},
      { role: 'paste'},
    ]
  },
  // { role: '' }
  {
    label: '显示',
    submenu: [
      {
        label: '放大',
        accelerator: 'CommandOrControl+=',
        click: () => {
          win.webContents.send('menuCommand', { 'name': 'zoom-in' })
        }
      },
      {
        label: '缩小',
        accelerator: 'CommandOrControl+-',
        click: () => {
          win.webContents.send('menuCommand', { 'name': 'zoom-out' })
        }
      },
      {
        label: '实际尺寸',
        accelerator: 'CommandOrControl+0',
        click: () => {
          win.webContents.send('menuCommand', { 'name': 'zoom-actual' })
        }
      },
      { type: 'separator' },
      {
        label: '总在最上',
        type: 'checkbox',
        checked: false,
        accelerator: '',
        click: (menuItem) => {
          console.log(menuItem.checked);
          let isChecked = menuItem.checked;
          if (!isChecked) {
            win.webContents.send('menuCommand', { 'name': 'pin-window', 'vl': false })
          } else {
            win.webContents.send('menuCommand', { 'name': 'pin-window', 'vl': true })
          }
        }
      },
    ]
  },
  // { role: 'viewMenu' }
  {
    label: '视图',
    submenu: [
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
    ]
  },
  // { role: 'windowMenu' }
  {
    label: '窗口',
    submenu: [
      { role: 'minimize' },
      { type: 'separator' },
      { type: 'separator' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)


// 打开文件
function openSendImgData(event, arg) {
  console.log("已接收打开文件命令")
  dialog.showOpenDialog({
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg', 'tiff', 'webp'] },
    ]
  }).then(result => {
    console.log(result);        //输出结果
    result.filePaths.length > 0 && event.sender.send("selectedItem", result);
    let filePath = result.filePaths[0];
    let fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
    var fileBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
    var fileDataUrl = 'data:image/*;base64,' + fileBase64;
    //得到文件
    event.sender.send("file-data-url", { 'fileDataUrl': fileDataUrl, 'fileName': fileName });
  })
}
ipcMain.on('openDialog', (event, arg) => {
  openSendImgData(event, arg);
})


// 



app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 您可以把应用程序其他的流程写在在此文件中
// 代码 也可以拆分成几个文件，然后用 require 导入。


