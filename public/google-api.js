const fs = require('fs');
const { app, BrowserWindow, ipcMain } = require('electron');
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
        this.mainWindow = win;
        this.createDirectory();
        this.getCredentials();
    }

    createDirectory(){
        if(!fs.existsSync(getSharedPath())){
            fs.mkdirSync(getSharedPath());
        }
    }

    assignToken(token){
        this.token = token;
        this.oAuth2Client.setCredentials(token);
        const auth = this.oAuth2Client;
        this.drive = google.drive({version: 'v2', auth});
        this.mainWindow.send('google-auth-token',  token)
    }

    logout(){
        let file_path = this.TOKEN_PATH
        return new Promise((resolve, reject)=>{
            if(fs.existsSync(file_path)) {
                fs.unlink(file_path, (error) => {
                    if (error) {
                        this.token = null
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
        const options = {
            width: 640,
            height: 480,
            webPreferences: {
                nodeIntegration: true
            }
        };
        const win = new BrowserWindow(options || {'use-content-size': true});
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
        if(fs.existsSync(this.CREDENTIALS_PATH)){
            this.readFile(this.CREDENTIALS_PATH, 'utf-8').then((data)=>{
                this.credentials = JSON.parse(data)
                this.authorize();
                console.log("The file content is : " + this.credentials);
            }).catch((error)=>{
                console.log("An error ocurred reading the file :" + error);
            })
        }else {
            this.uploadCredentials()
        }

    }

    authorize(){
        const {client_secret, client_id, redirect_uris} = this.credentials.installed;
        this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        this.readFile(this.TOKEN_PATH, 'utf-8').then((token)=>{
            this.assignToken(JSON.parse(token))
            console.log("The file content is : " + this.token);
        }).catch((error)=>{
            console.log("An error ocurred reading the file :" + error);
            this.getAuthUrl()
        })
    }
    getAuthUrl(){
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
        let queryObject = Object()
        query.split('&').map((item)=>{
            let arr = item.split('=')
            queryObject[arr[0]] = arr[1]
            return arr
        })
        return queryObject;
    }

    authorizeApp(){
        return new Promise((resolve, reject) => {
            const options = {
                width: 900,
                height: 680,
                webPreferences: {
                    nodeIntegration: true
                }
            };
            const win = new BrowserWindow(options || {'use-content-size': true});

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

    async assignPermission(permissions){
        let eventData = {
            status: "success",
            response:[]
        };
        for (let index = 0; index < permissions.length; index++) {
            try{
                let data = await this.insertPermission(permissions[index].permission.fileId, permissions[index].resource)
                eventData.response.push({
                    permission: permissions[index],
                    data:data.data
                });
                let response = {
                    status: "progress",
                    response: {
                        status:true,
                        data:data.data,
                        permission: permissions[index],
                    }
                };
                this.mainWindow.send('google-auth-permissions', response);
                console.log("Success: ", response)
            }catch (e){
                index--
                console.log("Error: ", e.message)
            }
        }

        this.mainWindow.send('google-auth-permissions', eventData)

    }
}

module.exports.GoogleApi = GoogleApi;