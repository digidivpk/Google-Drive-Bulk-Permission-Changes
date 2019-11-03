const fs = require('fs');
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const {google} = require('googleapis');
const path = require('path');

function getSharedPath(name = null) {
    if(name){
        return path.join(process.cwd(), "credentials", name)
    }else{
        return path.join(process.cwd(), "credentials")
    }
}

class GoogleApi {
    SCOPES = ['https://www.googleapis.com/auth/drive'];
    TOKEN_PATH = getSharedPath("token.json");
    CREDENTIALS_PATH = getSharedPath("credentials.json")
    credentials = null;
    authUrl = null;
    token=null;
    mainWindow = null;
    drive = null;

    init(win){
        console.log('GoogleApi init');
        this.mainWindow = win;
        this.createDirectory();
        this.getCredentials();
    }

    createDirectory(){
        console.log('GoogleApi createDirectory');
        if(!fs.existsSync(getSharedPath())){
            fs.mkdirSync(getSharedPath());
        }
    }

    assignToken(token){
        console.log('GoogleApi assignToken');
        this.token = token;
        this.oAuth2Client.setCredentials(token);
        const auth = this.oAuth2Client;
        let drive = google.drive({version: 'v2', auth});
        this.drive = drive;
        this.mainWindow.send('google-auth-token',  token)
        this.mainWindow.show();
    }

    logout(){
        console.log('GoogleApi logout');
        let file_path = this.TOKEN_PATH
        return new Promise((resolve, reject)=>{
            if(fs.existsSync(file_path)) {
                fs.unlink(file_path, (error) => {
                    if (error) {
                        this.token = null;
                        reject(error)
                    } else {
                        resolve('removed')
                    }
                })
            }else{
                reject("File Does Not Exist")
            }
        })

    }

    readFile(file_path, options){
        console.log('GoogleApi readFile');
        return new Promise((resolve, reject) => {
            if(fs.existsSync(file_path)){
                fs.readFile(file_path, options, (error, data) => {
                    if(error){
                        reject(error)
                    }
                    if(data){
                        resolve(data);
                    }
                });
            }else{
                reject("File Does Not Exist")
            }

        });
    }
    writeFile(file_path, content){
        console.log('GoogleApi writeFile');
        return new Promise((resolve, reject) => {
            fs.writeFile(file_path, content, (error) => {
                if(error){
                    reject(error)
                }else{
                    resolve(true);
                }
            });
        });
    }
    uploadCredentials(){
        console.log('GoogleApi uploadCredentials');
        Menu.setApplicationMenu(null);
        const options = {
            width: 640,
            height: 480,
            frame:false,
            webPreferences: {
                nodeIntegration: true
            }
        };
        const win = new BrowserWindow(options || {'use-content-size': true});
        win.setMaximizable(false);
        win.setResizable(false);
        win.setMinimizable(false);
        let html_file = path.join(__dirname, "..", "resources", "credentials.html");
        win.loadURL(`file://${html_file}`);
        win.on('closed', () => {
            console.log(new Error('User closed the window'));
        });
        ipcMain.on('google-credentials-upload', (event, credentials) => {
            console.log(credentials)
            this.writeFile(this.CREDENTIALS_PATH, JSON.stringify(credentials)).then(()=>{
                this.getCredentials()
            }).catch(()=>{
                this.getCredentials()
            });
            event.reply('google-credentials-upload',  credentials)
            win.removeAllListeners('closed');
            win.close();
        });
    }
    getCredentials(){
        console.log('GoogleApi getCredentials');
        if(fs.existsSync(this.CREDENTIALS_PATH)){
            this.readFile(this.CREDENTIALS_PATH, 'utf-8').then((data)=>{
                this.credentials = JSON.parse(data)
                this.authorize();
                console.log("The file content is : ", this.credentials);
            }).catch((error)=>{
                console.log("An error ocurred reading the file :" + error);
            })
        }else {
            this.uploadCredentials()
        }

    }

    authorize(){
        console.log('GoogleApi authorize');
        const {client_secret, client_id, redirect_uris} = this.credentials.installed;
        this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        this.readFile(this.TOKEN_PATH, 'utf-8').then((token)=>{
            this.assignToken(JSON.parse(token))
            console.log("The file content is : ", this.token);
        }).catch((error)=>{
            console.log("An error ocurred reading the file :" + error);
            this.getAuthUrl()
        })
    }
    getAuthUrl(){
        console.log('GoogleApi getAuthUrl');
        this.authUrl = this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.SCOPES,
        });
        console.log(this.authUrl)
        this.authorizeApp().then((data)=>{
            this.getAccessToken(data.code).then((token)=>{
                this.assignToken(token)
                this.mainWindow.send('google-auth-token', token)
            });
            console.log(data)
        }).catch((error)=>{
            console.log(error)
        });
    }

    queryParse(query){
        console.log('GoogleApi queryParse');
        let queryObject = Object()
        query.split('&').map((item)=>{
            let arr = item.split('=')
            queryObject[arr[0]] = arr[1]
            return arr
        })
        return queryObject;
    }

    authorizeApp(){
        console.log('GoogleApi authorizeApp');
        return new Promise((resolve, reject) => {
            Menu.setApplicationMenu(null);
            const options = {
                width: 900,
                height: 680,
                webPreferences: {
                    nodeIntegration: true
                }
            };
            const win = new BrowserWindow(options || {'use-content-size': true});
            win.setMaximizable(false);
            win.setResizable(false);
            win.setMinimizable(false);

            win.loadURL(this.authUrl);

            win.on('closed', () => {
                reject(new Error('User closed the window'));
            });

            win.on('page-title-updated', () => {
                setImmediate(() => {
                    const title = win.getTitle();
                    if (title.startsWith('Denied')) {
                        reject(new Error(title.split(/[ =]/)[2]));
                        win.removeAllListeners('closed');
                        win.close();
                    } else if (title.startsWith('Success')) {
                        resolve(this.queryParse(title.split(' ')[1]));
                        win.removeAllListeners('closed');
                        win.close();
                    }
                });
            });
        });
    }

    getAccessToken(code){
        console.log('GoogleApi getAccessToken');
        return new Promise((resolve, reject) => {
            this.oAuth2Client.getToken(code, (error, token) => {
                if (error) {
                    reject(error)
                    console.error('Error retrieving access token', error);
                }else{
                    resolve(token)
                    this.writeFile(this.TOKEN_PATH, JSON.stringify(token)).then((success)=>{
                        console.log('Token stored to', this.TOKEN_PATH);
                    }).catch((error)=>{
                        console.error(error)
                    })
                }

            });
        });

    }



    insertPermission(fileId, resource){
        console.log('GoogleApi insertPermission');
        return new Promise((resolve, reject) => {
            if(!!this.drive){
                this.drive.permissions.insert({
                    fileId:fileId,
                    resource:resource
                },(err, res) => {
                    if(err){
                        reject(err)
                    }else if(res){
                        resolve(res)
                    }
                })
            }else {
                reject('Authentication Failed')
            }
        });
    }

    getFilesListByFolderId(folderId){
        console.log('GoogleApi getFilesListByFolderId');
        return new Promise((resolve, reject) => {
            if(!!this.drive){
                this.drive.children.list({
                    folderId:folderId,
                },(err, res) => {
                    if(err){
                        reject(err)
                    }else if(res){
                        resolve(res)
                    }
                })
            }else {
                reject('Authentication Failed')
            }
        });
    }

    async assignPermissionstoFolderChildrens(folderId, resource){
        console.log('GoogleApi assignPermissionstoFolderChildrens');
        try{
            const files = await this.getFilesListByFolderId(folderId);
            console.log("FILES LIST Of Folder: ", files);
            const { items } = files.data;
            let responseData = {
                type:'success',
                response:[]
            };
            for (let index = 0; index < items.length; index++) {
                try{
                    let data = await this.insertPermission(items[index].id, resource);
                    responseData.response.push({
                        status:'success',
                        data: data.data
                    })
                }catch (e) {
                    responseData.response.push({
                        status:'error',
                        code:e.code,
                        message:e.message
                    });
                }

            }
            return responseData


        }catch (e) {
            console.log("Error Finding File: ", e);
            return {
                status:'error',
                code:e.code,
                message:e.message,
                error:e
            }
        }
    }
    sendProgressStatus(message, type){
        console.log('GoogleApi sendProgressStatus');
        let response = {
            status: "progress",
            type:type,
            response: message
        };
        this.mainWindow.send('google-auth-permissions', response);
        console.log(response)
    }
    async assignPermission(permissions){
        console.log('GoogleApi assignPermission');
        let eventData = {
            status: "success",
            response:[]
        };
        for (let index = 0; index < permissions.length; index++) {
            try{
                let data
                if(permissions[index].permission.include === 'folder'){
                    data = await this.assignPermissionstoFolderChildrens(permissions[index].permission.fileId, permissions[index].resource);
                    console.log('Assign Permissions to Folder Childrens: ', data)
                    if(data.status === 'error'){
                        let errorMessage = {
                            include: permissions[index].permission.include,
                            permission: permissions[index],
                            error:{
                                code: data.code,
                                message: data.message,
                                response:data.error
                            }
                        };
                        this.sendProgressStatus(errorMessage, 'error');
                        continue;
                    }
                    let eventMessage = {
                        include: permissions[index].permission.include,
                        permission: permissions[index],
                        data:data
                    };
                    eventData.response.push(eventMessage);
                    this.sendProgressStatus(eventMessage, 'success')
                }else if(permissions[index].permission.include === 'file'){
                    data = await this.insertPermission(permissions[index].permission.fileId, permissions[index].resource);
                    let eventMessage = {
                        include: permissions[index].permission.include,
                        permission: permissions[index],
                        data:data.data,
                    }
                    eventData.response.push(eventMessage);
                    this.sendProgressStatus(eventMessage, 'success')
                }else if(permissions[index].permission.include === 'both'){
                    let file = await this.assignPermissionstoFolderChildrens(permissions[index].permission.fileId, permissions[index].resource);
                    data = await this.insertPermission(permissions[index].permission.fileId, permissions[index].resource);
                    if(file.status === 'error'){
                        let errorMessage = {
                            include: permissions[index].permission.include,
                            permission: permissions[index],
                            error:{
                                code: file.error.code,
                                message: file.error.message,
                                response:file.error
                            }
                        };
                        this.sendProgressStatus(errorMessage, 'error');
                        continue;
                    }
                    let eventMessage = {
                        include: permissions[index].permission.include,
                        permission: permissions[index],
                        data:{
                            file: data.data,
                            folder:file
                        },
                    };
                    eventData.response.push(eventMessage);
                    this.sendProgressStatus(eventMessage, 'success')
                }
            }catch (e){
                let eventMessage = {
                    include: permissions[index].permission.include,
                    permission: permissions[index],
                    error:{
                        code: e.code,
                        message: e.message,
                        response:e
                    }
                };
                this.sendProgressStatus(eventMessage, 'error');
                console.error("Error: ", e.message)
            }
        }

        this.mainWindow.send('google-auth-permissions', eventData)

    }

    listFiles() {
        console.log('GoogleApi listFiles');
        let drive = this.drive;
        return new Promise((resolve, reject) => {
            drive.files.list({
                corpora:'default',
                pageSize: 10,
            }, (err, res) => {
                if (err) {
                    reject(err)
                }else {
                    resolve(res.data.items)
                }
            });
        });

    }



}

module.exports.GoogleApi = GoogleApi;