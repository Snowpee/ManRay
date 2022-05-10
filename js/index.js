const { remote } = require('electron');
const { BrowserWindow, Menu, MenuItem, screen } = remote;

// 重置窗口基本属性
remote.getCurrentWindow().setAlwaysOnTop(false);

// 改变窗口大小
function rsWindow(w,h) {
  remote.getCurrentWindow().setSize(w, h);
  var app = document.getElementById("app");
  app.style.width = w + "px";
  app.style.height = h + "px";
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
// 改变图片比例
 function scaleImg(n) {
  var img = document.getElementById("img1").childNodes[0];
  // var imgbox = document.getElementById("img1");
  img.width = img.naturalWidth * n;
  img.height = img.naturalHeight * n;
  // imgbox.style.transform = "scale(" + n + ")";
  fnWidth = Math.round(img.naturalWidth * n);
  fnHeight = Math.round(img.naturalHeight * n);
  var winWidth = screen.getPrimaryDisplay().workAreaSize.width;
  var winHeight = screen.getPrimaryDisplay().workAreaSize.height;
   if (fnWidth >= winWidth) {
     rsWindow(winWidth, winHeight);
  } else {
     rsWindow(fnWidth, fnHeight);
  }
   
 }
// 图片拖放功能实现
let ctInfo = document.getElementById("ctinfo");
let content = document.getElementsByClassName("content")[0]

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
  ctInfo.innerHTML = "拖动图片到此处";
  content.className = "content"
}
function drop(e) {
  var id = e.dataTransfer.getData("id");//得到img的id
  var img = document.getElementById(id);//通过id得到img
  var div = document.getElementById(e.target.id);//通过拖拽的目标的id得到要放入的div
  div.appendChild(img);//将img加入div
  console.log("++++这是++++");
}

function picture(e) {
  e.preventDefault();//阻止拖拽结束的默认行为，会把文件作为链接打开。
  document.getElementById("app").className = "wrapper showimg";
  var id = e.target.id;//得到div的id
  var box = document.getElementById(id);//通过id得到div
  var file = e.dataTransfer.files[0];//得到文件
  var fileReader = new FileReader();
  fileReader.readAsDataURL(file);//将file读为url
  fileReader.onload = function (ev) {//为div添加一个图片，图片路径为拖拽的文件路径
    var img = document.createElement("img");
    img.src = fileReader.result;
    box.appendChild(img);
  }
}

//右键餐单
function rightMenu() {
  const menu = new Menu();
  menu.append(new MenuItem({
    label: '50%',
    type: 'radio',
    checked: false,
    click: function () {
      console.log('50% clicked');
      scaleImg(0.5);
      // checked: true
    }
  }));
  menu.append(new MenuItem({
    label: '100% 原始尺寸',
    type: 'radio',
    checked: true,
    click: function () {
      console.log('100% clicked');
      scaleImg(1);
      // checked: true
    }
  }));
  menu.append(new MenuItem({
    label: '200%',
    type: 'radio',
    checked: false,
    click: function () {
      console.log('200% clicked');
      scaleImg(2);
      // checked: true
    }
  }));
  menu.append(new MenuItem({ type: 'separator' }));//分割线
  menu.append(new MenuItem({ label: '放大' }));
  menu.append(new MenuItem({ label: '缩小' }));
  menu.append(new MenuItem({ type: 'separator' }));//分割线
  menu.append(new MenuItem({
    label: '清空画布',
    click: function () {
      clCanvas();
      console.log("清空已执行");
      rsWindow(422, 318);
      console.log("已重置窗口大小");
    }
  }));
  menu.append(new MenuItem({ type: 'separator' }));//分割线
  menu.append(new MenuItem({
    label: '置顶此窗口',
    type: 'checkbox',
    click: function () {
      if (remote.getCurrentWindow().isAlwaysOnTop() == true) {
        remote.getCurrentWindow().setAlwaysOnTop(false);
        console.log("// 取消置顶窗口")
      } else if (remote.getCurrentWindow().isAlwaysOnTop() == false) {
        remote.getCurrentWindow().setAlwaysOnTop(true);
        console.log("// 置顶窗口")
      }
      
    }
  }));
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    menu.popup({ window: remote.getCurrentWindow() })
  }, false)
}


rightMenu();
