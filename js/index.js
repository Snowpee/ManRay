const { BrowserWindow, Menu, MenuItem, screen } = require('@electron/remote')
// const { remote } = require('electron');
// const { BrowserWindow, Menu, MenuItem, screen } = remote;

let { ipcRenderer } = require('electron')


// 定义基本变量
var img = document.getElementById("simg");
let titleBar = document.getElementById("gbtitle");
let ctInfo = document.getElementById("ctinfo");
let content = document.getElementsByClassName("content")[0]
let dfContentTips = document.getElementById("ctinfo").innerHTML;
let errContentTips = "错误：不支持的格式"

// 重置窗口基本属性
rsWindow(420, 320);

// 重置titlebar
function rsTiltleBar(){
  titleBar.innerHTML = "Plankton";
}
// 改变窗口大小
function rsWindow(w,h) {
  newW = w + 0;
  newH = h + 0;
  // remote.getCurrentWindow().setSize(newW , newH);
  ipcRenderer.send('setMainWindow', { "width": w, "height": h })
}
// 窗口置顶
function pinWindow(boolean) {
  ipcRenderer.send('setAwaysOnTop', boolean );
}
function isPinWindow() {
  ipcRenderer.send('isAwaysOnTop');
}
// 清空画布
function clCanvas() {
  var elem = document.getElementById("img1");
  while (elem.hasChildNodes()) //当elem下还存在子节点时 循环继续
  {
    elem.removeChild(elem.firstChild);
  }
  document.getElementById("app").className = "wrapper";
  dragLeave();
}

// 图片有关

// 改变图片尺寸
 function rsImg(w,h) {
   var img = document.getElementById("img1").childNodes[0];
   img.width = w;
   img.height = h;
   rsWindow(w, h);
 }

// 改变图片比例，注意是按原始尺寸计算的比例
function scaleImg(n) {
  let img = document.querySelector("#simg");
  console.log("执行图片缩放后图片宽高：" + img.width + ", " + img.height)
  // 将图片修改为自然大小的 n 倍
  img.setAttribute("style","transform: scale(" + n + ");");

  // 修改窗口大小，如果超出，则显示为指定大小，不再超出屏幕外
  fnWidth = Math.round(img.naturalWidth * n);
  fnHeight = Math.round(img.naturalHeight * n);
  var winWidth = screen.getPrimaryDisplay().workAreaSize.width;
  var winHeight = screen.getPrimaryDisplay().workAreaSize.height;
    if (fnWidth >= winWidth) {
      rsWindow(winWidth, winHeight);
  } else {
      rsWindow(fnWidth, fnHeight);
  }
  console.log("========修改图片尺寸完成========")
}

// 放大，缩小图片
var number = 0;
function zoomImg(type, elemId) {
  return function () {
    var elem = document.getElementById(elemId);
    switch (type) {
      case 'add':
        elem.setAttribute("data-zoom", ++number);
        break;
      case 'minus':
        elem.setAttribute("data-zoom", --number);
        break;
      case 'actual':
        number = Math.pow(number, 0) - 1; //  变量中的将 number 归零
        elem.setAttribute("data-zoom", number);
        // var number = 0; // 此时重设内存中此变量值
        break;
    }
    let dataZoom = elem.getAttribute("data-zoom");
    console.log(elem.getAttribute("data-zoom"));
    // 判断 zoom 参数，放大缩小使用不同的函数曲线
    if (parseInt(dataZoom) >= 0) {
      // 正比例函数曲线，可无限放大
      var newNumber = parseInt(dataZoom) / 2 + 1;
    } else {
      // 反比例函数，防止出现负数等情况
      var newNumber = 1 / (- parseInt(dataZoom) / 2 + 1);
    }
    elem.setAttribute("style", `transform: scale(${newNumber})`);
    elem.setAttribute("data-zoom", newNumber);
    let viewWidth = Math.round(elem.width * newNumber);
    let viewHeight = Math.round(elem.height * newNumber);
    // console.log(viewWidth, viewHeight)
    rsWindow(viewWidth, viewHeight);
    
  }
}
var zoomIn = zoomImg("add", "simg");
var zoomOut = zoomImg("minus", "simg");
var zoomActual = zoomImg("actual", "simg");

// 拖动事件相关
function dragStart(e) {
  e.dataTransfer.setData("id", e.target.id);//将img的id写入
}

function dragOver(e) {
  e.preventDefault();//阻止拖拽结束的默认行为，会把文件作为链接打开。
  console.log("++++已拖放到合适位置++++");
  console.log(ctInfo);
  ctInfo.innerHTML = "松开吧";
  content.className = "content active"
}
function dragLeave() {
  console.log("++++已离开合适位置++++");
  var ctInfo = document.getElementById("ctinfo");
  ctInfo.innerHTML = dfContentTips;
  content.className = "content"
}
function drop(e) {
  var id = e.dataTransfer.getData("id");//得到img的id
  var img = document.getElementById(id);//通过id得到img
  var div = document.getElementById(e.target.id);//通过拖拽的目标的id得到要放入的div
  div.appendChild(img);//将img加入div
  console.log("++++这是++++");
}
// 图片进入后的操作
function loadImage(fileDataUrl, gbFileName) {
  // 首先判断文件类型是否合法，合法则继续执行显示图片操作，否则报错
  var strRegex = "(.jpg|.png|.jpeg)$"; //用于验证图片扩展名的正则表达式
  var imgdom = document.createElement("img");
  var re = new RegExp(strRegex);
  // if (re.test(gbFileName.toLowerCase())) {
    console.log(`可接受的图片文件：${gbFileName}`);
    document.getElementById("app").className = "wrapper showimg";
    let img = document.querySelector("#simg");
    var box = document.getElementById("img1");//通过id得到div
    // 设定标题栏为文件名
    titleBar.innerText = gbFileName;
    //判断是否有图片，无则为div添加一个图片，图片路径为拖拽的文件路径，有则替换
    if (img == null) {
      imgdom.src = fileDataUrl;
      imgdom.setAttribute("id", "simg");
      box.appendChild(imgdom);
      // 加载专有右键菜单
      contextMenu('imgViewTemplate');
    } else {
      console.log("已有图片")
      img.src = fileDataUrl;
    }
    imgdom.onload = () => {
      console.log(imgdom.width + " " + imgdom.height);
      rsWindow(imgdom.width, imgdom.height);
      box.setAttribute("for", "");
    }
  // } else {
  //   content.className = "content";
  //   toast('error', errContentTips);
  //   ctInfo.innerHTML = dfContentTips;
  // }
}

// 图片创建与替换相关
function picture(e) {
  e.preventDefault();//阻止拖拽结束的默认行为，会把文件作为链接打开。
  var file = e.dataTransfer.files[0];//得到文件
  var fileReader = new FileReader();
  fileReader.readAsDataURL(file);//将file读为url
  fileReader.fileName = file.name;

  // 非图片则不执行，返回 false
  if (!/image\/\w+/.test(file.type)) {
    toast("error", errContentTips);
    return false;
  }

  // 文件准备完毕之后的后续操作
  fileReader.onload = () => {
    let gbFileName = file.name;
    let fileDataUrl = fileReader.result;
    loadImage(fileDataUrl, gbFileName);
  }
  console.log("++++已执行 picture 函数++++");
}

// 给指定 dom 绑定函数
const imgwrapper = document.querySelector("#img1");

imgwrapper.ondrop = (event) => {
  picture(event);
  console.log('图片已添加完毕');
}

// 窗口改变时，图片适应窗口大小
window.onresize = function() {
  console.log(window.innerWidth + ", " + window.innerHeight);
  let img = document.getElementById("simg");
  // 检查i mg 是否被创建，有则执行相关操作
  if (img){
    let wSc = ( window.innerWidth ) / img.width;
    let hSc = ( window.innerHeight ) / img.height;
    // 比较这两个比例，谁小就使用谁。以使图片始终适配最短边
    if (wSc < hSc) {
      img.setAttribute("style", "transform: translateZ(0) scale(" + wSc + ")");
      img.setAttribute("datascale", wSc);
    } else {
      img.setAttribute("style", "transform: translateZ(0) scale(" + hSc + ")");
      img.setAttribute("datascale", hSc);
    }
  }
}

/*
======== 文件读取 ========
*/

function openDialog() {
  ipcRenderer.send('openDialog');
}

ipcRenderer.on('selectedItem', (event, files) => {
  let filePath = files.filePaths[0];
  console.log(`通过原生方法打开文件：${filePath}`);//输出选择的文件
})

// html 5 文件读取

var upimg = document.querySelector('#upimg');
upimg.addEventListener('change', function (e) {
  var files = this.files;
  console.log(`通过 HTML5 读取文件：${files}`)
  if (files.length) {
    // 对文件进行处理，下面会讲解checkFile()会做什么
    checkFile(this.files);

  }
});

// 图片处理
// 这里可以构造一个函数，输入二进制文件 ==> 输出 DataUrl
function checkFile(files) {
  var file = files[0];
  // show表示<div id=‘show‘></div>，用来展示图片预览的
  if (!/image\/\w+/.test(file.type)) {
    toast("error", errContentTips);
    return false;
  }
  // onload是异步操作
  var file = files[0];
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.fileName = file.name;

  reader.onload = () => {
    let gbFileName = file.name;
    let fileDataUrl = reader.result;
    loadImage(fileDataUrl, gbFileName);
  }
}



/*
======== 全局菜单 ========
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
        role: 'new',
        click: function(){

          // do sth

        }
      },
      { type: 'separator' },
      {
        label: '打开...',
        accelerator: 'CommandOrControl+o',
        click: function () {
          document.querySelector('#img1').click();
        }
      },
      { label: '清空画布' },
      { type: 'separator' },
      ...(isMac ? [
        { label: '关闭', role: 'close' }
      ]:[
        { role: 'quit' }
      ])
    ]
  },
  {
    label: '编辑',
    submenu: [
      {role: "copy"},
      {role: "paste"},
      {role: "cut"},
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
          zoomIn();
        } 
      },
      { 
        label: '缩小',
        accelerator: 'CommandOrControl+-',
        click: () => {
          zoomOut();
        } 
      },
      { 
        label: '实际尺寸',
        accelerator: 'CommandOrControl+0',
        click: () => {
          zoomActual();
        }
      },
    ]
  },
  // { role: 'viewMenu' }
  {
    label: '视图',
    submenu: [
      { 
        label: '清空画布',
        role: 'reload'
       },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
    ]
  },
  // { role: 'windowMenu' }
  {
    label: '窗口',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
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


/*
======== 右键菜单 ========
*/
// renderer
function contextMenu(tempName) {
  window.addEventListener('contextmenu', (e) => {
    console.log(`开始执行显示菜单命令：${tempName}`)
    e.preventDefault()
    ipcRenderer.send('show-context-menu', tempName)
    console.log(`已执行完毕：${tempName}`)
  })
}
// 这里先注释掉，默认展示一个菜单，但不知道怎么回事，每次都自己运行一次取代了自定义菜单。
// let mainMenu = contextMenu('mainTemplate')
// window.onload = mainMenu

// 接收主进程返回的数据
ipcRenderer.on('context-menu-command', (e, data) => {
  // ...
  console.log(`执行以下命令：${data.name}, 数值 ${data.val}`);
  let command = data.name;
  let val = data.val;
  switch (command) {
    case 'scale-img':
      scaleImg(val);
      break;
    case 'zoom-in':
      zoomIn();
      break;
    case 'zoom-out':
      zoomOut();
      break;
    case 'zoom-actual':
      zoomActual();
      break;
    case 'clean-canvas':
      clCanvas();
      console.log("清空已执行");
      rsWindow(420, 320);
      console.log("已重置窗口大小");
      rsTiltleBar();
      break;
    default:
      console.log(`Sorry, we are out of ${command}.`);
  }
})

/*
======== 通知等 ========
*/
function toast(type, content){
  let notifContent = document.getElementById("notif");
  notifContent.classList.add('active');
  notifContent.innerText = content;
  notifContent.setAttribute("data-notif-type",type);
  setTimeout(() => {
    notifContent.classList.remove("active");
    notifContent.innerText = "";
    notifContent.setAttribute("data-notif-type", "");
  }, 3000);
}