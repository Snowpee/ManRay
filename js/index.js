const { BrowserWindow, Menu, MenuItem, screen } = require('electron')
// const { remote } = require('electron');
// const { BrowserWindow, Menu, MenuItem, screen } = remote;

let { ipcRenderer } = require('electron')


// 定义基本变量
const imgwrapper = document.querySelector("#imgwrapper");
let titleBar = document.getElementById("gbtitle");
let ctInfo = document.getElementById("ctinfo");
let content = document.getElementsByClassName("content")[0]
let dfContentTips = document.getElementById("ctinfo").innerHTML;
let errContentTips = "错误：不支持的格式"
const appRoot = document.getElementById("app");
const btnWinClose = document.getElementById("wcl");
const btnWinMin = document.getElementById("wmin");
const winDfWidth = 440;
const winDfHeight = 340;


// 重置窗口基本属性
rsWindow(winDfWidth, winDfHeight);
pinWindow(false);
winSetResizable(false);

/*
================ 定义一些函数 ================
*/

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
// 设定是否可调节窗口
function winSetResizable(boolean){
  ipcRenderer.send('win-set-resizable', boolean);
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
  while (imgwrapper.hasChildNodes()) //当elem下还存在子节点时 循环继续
  {
    imgwrapper.removeChild(imgwrapper.firstChild);
  }
  document.getElementById("app").className = "wrapper";
  dragLeave();
}

function clThroughWindow(boolean){
  ipcRenderer.send('setClickThroughWindow', boolean);
}

// 图片有关

// 改变图片尺寸
 function rsImg(w,h) {
   var img = imgwrapper.childNodes[0];
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
  console.log("================修改图片尺寸完成================")
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
        number = Math.pow(number, 0) - 1;
        elem.setAttribute("data-zoom", number);
        break;
      case 'half':
        // - 诡异的问题，data-zoom 未被设定，或者被设定为 1
        // number = Math.pow(number, 0) - .5;
        // elem.setAttribute("data-zoom", Math.pow(number, 0) - .5);
        break;
      case 'double':
        // elem.setAttribute("data-zoom", ++number * 2);
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
var zoomHalf = zoomImg("half", "simg");
var zoomDouble = zoomImg("double", "simg");

// 图片透明度
function opacImg(e) {
  let img = document.getElementById("simg");
  img.setAttribute('style', `opacity:${e}`)
}

// 图片进入后的操作
function loadImage(fileDataUrl, gbFileName) {
  // 首先判断文件类型是否合法，合法则继续执行显示图片操作，否则报错
  var strRegex = "(.jpg|.png|.jpeg)$"; //用于验证图片扩展名的正则表达式
  var imgdom = document.createElement("img");
  var re = new RegExp(strRegex);

    console.log(`可接受的图片文件：${gbFileName}`);
  document.getElementById("app").classList.add("showimg");
    let img = document.querySelector("#simg");
    // 设定标题栏为文件名
    titleBar.innerText = gbFileName;
    //判断是否有图片，无则为div添加一个图片，图片路径为拖拽的文件路径，有则替换
    if (img == null) {
      imgdom.src = fileDataUrl;
      imgdom.setAttribute("id", "simg");
      imgwrapper.appendChild(imgdom);
    } else {
      console.log("已有图片")
      img.src = fileDataUrl;
    }
    imgdom.onload = () => {
      console.log(imgdom.width + " " + imgdom.height);
      rsWindow(imgdom.width, imgdom.height);
      imgwrapper.setAttribute("for", "");
      // 设定窗口为可调整

      winSetResizable(true);
      console.log('已发送窗口可调氢请求')
      console.log("++++已执行 picture 函数++++");
    }
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
    content.className = "content";
    ctInfo.innerHTML = dfContentTips;
    return false;
  }

  // 文件准备完毕之后的后续操作
  fileReader.onload = () => {
    let gbFileName = file.name;
    let fileDataUrl = fileReader.result;
    loadImage(fileDataUrl, gbFileName);
  }
}

// 简单的 toast 提示函数
function toast(type, content) {
  let notifContent = document.getElementById("notif");
  notifContent.classList.add('active');
  notifContent.innerText = content;
  notifContent.setAttribute("data-notif-type", type);
  setTimeout(() => {
    notifContent.classList.remove("active");
    notifContent.innerText = "";
    notifContent.setAttribute("data-notif-type", "");
  }, 3000);
}


/*
================ 开始定义、绑定事件 ================
*/
// 绑定窗口按钮函数
btnWinClose.onclick = () => {
  ipcRenderer.send('windowsRendeCommand', {'name': 'close'})
}
btnWinMin.onclick = () => {
  ipcRenderer.send('windowsRendeCommand', { 'name': 'min' })
}


// 给指定 dom 绑定函数
imgwrapper.ondrop = (event) => {
  picture(event);
  console.log('图片已添加完毕');
}
imgwrapper.addEventListener("dragover", function (event) {
  console.log('---- Over Me! ----');
  event.preventDefault();//阻止拖拽结束的默认行为，会把文件作为链接打开。
  ctInfo.innerHTML = "松开吧";
  content.classList.add("active");
});

imgwrapper.addEventListener("dragleave", function (event) {
  console.log('==== Leave Me! ====');
  ctInfo.innerHTML = dfContentTips;
  content.classList.remove("active");
});


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

// 针对窗口阴影的判断

// 鼠标在实际窗体里时，是否可视窗体上
// - todo： 需要让窗口失去焦点后，仍监测鼠标事件。否则会出现拖放的 bug
var mouseEvents = ['mouseover'] 
// 将鼠标事件定义为数组，给元素添加多个
mouseEvents.forEach(function (item, index) {
  appRoot.addEventListener(item, (event) => {
    let name = event.target.getAttribute("data-name");
    let elem = event.target;
    console.log(elem);

    if (name == "wrapperWin") {
      console.log('在实际窗体，但不在可视窗体');
      ipcRenderer.send('setIgnoreMouse', true);
    } else {
      console.log('在可视窗体');
      ipcRenderer.send('setIgnoreMouse', false);
    }
  });
})
// 鼠标是否离开实际窗体
appRoot.addEventListener('mouseleave', (event) => {
  let elem = event.target;
  if (elem) {
    console.log(elem);
    console.log('已离开！');
    ipcRenderer.send('setIgnoreMouse', false);
  } else {
    // 无法侦测离开之后的事件，留空
  }
})

// 接收主进程「窗口焦点」通知
ipcRenderer.on('winFocus', (event, vl) => {
  switch(vl){
    case true:
      console.log('已聚焦！');
      appRoot.classList.add('winfocus');
      // ipcRenderer.send('setIgnoerMouse', false)
      break;
    case false:
      console.log('已失去焦点！');
      appRoot.classList.remove('winfocus');
      break;
  }
})
/*
================ 文件读取 ================
*/

// 向主进程发送命令
function openDialog() {
  ipcRenderer.send('openDialog');
}
// 接收主进程返回的文件路径等数据（测试用）
ipcRenderer.on('selectedItem', (event, files) => {
  let filePath = files.filePaths[0];
  console.log(`通过原生方法打开文件：${filePath}`);//输出选择的文件
})
// 接收主进程返回的最终图片 bese64 数据
ipcRenderer.on('file-data-url', (event, result) => {
  console.log(`已接收原生图片 base64：${result.fileDataUrl}`);//输出选择的文件
  let gbFileName = result.fileName;
  let fileDataUrl = result.fileDataUrl;
  loadImage(fileDataUrl, gbFileName);
})

// 点击上传的相关流程
imgwrapper.addEventListener('click', function () {
  var isShowing = app.classList.contains('showimg');
  if (isShowing) {
    imgwrapper.setAttribute('onclick', 'return false;')
  } else {
    openDialog();
  }
});

// 主菜单打开的流程
ipcRenderer.on('menuCommand',(event, data) => {
  switch(data.name){
    case 'open-file':
      openDialog();
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
    case 'pin-window':
      pinWindow(data.vl);
      break;
  }
})



/*
================ 右键菜单 ================
*/
// renderer
function contextMenu() {
  content.addEventListener('contextmenu', (e) => {
    let isImgActive = appRoot.classList.contains('showimg');
    // 判断 content 窗口状态，加载专有右键菜单
    if (isImgActive) {
      var tempName = 'imgViewTemplate';
    } else {
      var tempName = 'mainTemplate';
    }
    console.log(`开始执行显示菜单命令：${tempName}`)
    e.preventDefault()
    ipcRenderer.send('show-context-menu', tempName)
    console.log(`已执行完毕：${tempName}`)
  })
}
contextMenu()

// 接收主进程返回的数据
ipcRenderer.on('context-menu-command', (e, data) => {
  // ...
  console.log(`执行以下命令：${data.name}, 数值 ${data.val}`);
  let command = data.name;
  let val = data.val;
  switch (command) {
    case 'open-dialog':
      openDialog();
      break;
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
    case 'zoom-half':
      zoomHalf();
      break;
    case 'zoom-double':
      zoomDouble();
      break;
    case 'clean-canvas':
      clCanvas();
      console.log("清空已执行");
      rsWindow(winDfWidth, winDfHeight);
      console.log("已重置窗口大小");
      rsTiltleBar();
      break;
    default:
      console.log(`Sorry, we are out of ${command}.`);
  }
})

