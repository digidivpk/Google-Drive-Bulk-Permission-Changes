# Welcome to Drive Permission Changer

Driver permission changer is an open source application created to change permission of google drive files and folders in **bulk mode** . The files can be some safe points and it is hard to change it manually by going to each file one by one . You can also specify a list of users or configure the link sharing option just in  **One Click**

[![Download Google Drive Permission Manager](https://a.fsdn.com/con/app/sf-download-button)](https://sourceforge.net/projects/gdpm-digidivpk/files/latest/download)


## Setup and build

This is a ready to use application . You just enter your credentials for google driver app and start using . Here is some simple steps to follow 

 1. Enable Google Drive API 
 2. Create an App consent screen  on google cloud  
 3. Create and Download Oath Credentials file
 4. Clone and Build this project 
 5. Configure Credentials 
 6. Start Using 

 

## Detailed Guide Line
Follow the steps below before you clone and build the project 

 #### Enable Google drive API 
 Follow the link below 
 [Enable Google Drive API ](https://developers.google.com/drive/api/v3/enable-drive-api)
 follow all the instruction provided in the link to enable drive API 
 
  #### Create an App consent screen  on google cloud 
  Create an Oath application in google cloud with the following scope

> [https://www.googleapis.com/auth/drive.file](https://www.googleapis.com/auth/drive.file)

Follow the link `[Configure Consent Screen ](https://console.developers.google.com/apis/credentials/consent)` and add the given scope to your application .
You can skip this step if it is already configured .

  #### Create and Download Oath Credentials file
  Follow the link for detailed instructions to `[Create Oauth credentials](https://support.google.com/googleapi/answer/6158849?hl=en)`
  While creating credentials chose 

> Other 

as credentials type . After creating the credentials download the credentials JSON file 

 #### Clone and Build this project 
 Clone this project in any of the directory and run the following commands
 

    yarn install
    
this will install all the dependencies of the application . now you can build the application for windows or Linux

    yarn build --win
    yarn build --linux

Tool is ready to use . open the executable file and start using 

 #### Configure Credentials 
 
First screen of application will ask you for a JSON credentials file . provide a valid credentials file created in previous step .it will Proceed to Login
 
  #### Start Using
Application has a good simple interface . you can add file ids , permission type , permission target group or users with simple clicks . You can also import data using a csv file 

The repository has sample CSV files . you must follow the same format 

For more Updates and other cool tools visit [www.digidiv.pk](http://www.digidiv.pk)
