const {app, BrowserWindow, ipcMain, screen} = require('electron');
const isDev = require('electron-is-dev');
const serve = require('electron-serve');

const { GoogleApi } = require('./google-api');

const loadURL = serve({directory: 'build'});

let mainWindow;
let auth = new GoogleApi();

function createWindow() {
  const {width, height} = screen.getPrimaryDisplay().workAreaSize
  const options = {
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: true
    }
  };
  if(isDev){
    mainWindow = new BrowserWindow(options);
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.on('closed', () => mainWindow = null);
    auth.init(mainWindow)
  }else{
    (async () => {

      mainWindow = new BrowserWindow(options);

      await loadURL(mainWindow);

      // The above is equivalent to this:
      await mainWindow.loadURL('app://-');
      auth.init(mainWindow)
      // The `-` is just the required hostname
    })();
  }


}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('google-auth-view', (event, arg) => {
  auth.getCredentials();
});

ipcMain.on('google-auth-permissions', (event, permissions) => {
  auth.assignPermission(permissions)
  event.reply('google-auth-permissions',  {
    status: "pending",
    all:true
  })
  console.log("google-auth-permissions", permissions)
});

ipcMain.on('google-auth-status-main', (event, arg) => {
  event.reply('google-auth-token',  auth.token)
});

ipcMain.on('google-auth-logout', (event, arg) => {
  auth.logout().then((data)=>{
    event.reply('google-auth-logout',  'Logout')
  })
});

