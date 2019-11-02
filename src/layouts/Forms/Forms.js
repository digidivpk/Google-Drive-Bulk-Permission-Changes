import React, { Component } from 'react';
import { withStyles} from '@material-ui/core/styles';
import {
    Card,
    CardContent,
    CardActions,
    CardHeader,
    Button,
    LinearProgress
} from '@material-ui/core';
import Form from 'components/Form';
import Table from 'components/Table/Table'
import {
    permissionFields,
    userFields,
    generatePermissions,
    readCsvFile,
    tableStateUpdate
} from  './utils';

const { ipcRenderer } = window.require('electron');

const styles = theme => ({
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
    cardControll: {
        marginTop: theme.spacing(2),
    },
    cardAction: {
        display: 'flex',
    },
    cardButton: {
        marginLeft: 'auto',
    }
});

let permissionFieldValues = Object(); 
permissionFields.forEach((item)=>{
    permissionFieldValues[item.name] = item.default
});

let userPermissionFormFieldsValues = Object();
userFields.forEach((item)=>{
    userPermissionFormFieldsValues[item.name] = item.default
});

class Forms extends Component {
    state = {
        permissions: [
            permissionFieldValues
        ],
        users: [
            userPermissionFormFieldsValues
        ],
        usersDisplay: false,
        disableFields: [
            {
                id:false,
                role:false,
                include:false,
                permission:false,
                domain: true
            }
        ],
        disableUserFields: [],
        buttonStatus: true,
        tableData:[],
        loading:false
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.permissions === nextState.permissions || this.state.users === nextState.users;
    }

    updateUserDisplayState(){
        if(!!this.state.permissions.filter((item)=>(item['permission'] === 'user')).length){
            this.setState({
                usersDisplay:true
            })
        }else {
            this.setState({
                usersDisplay:false
            })
        }
        this.updateDisable()
    }

    updateDisable(all=false){
        let disable = [];
        let userDisable = [];
        let buttonStatus = true;
        let loading = false;
        if(all){
            disable = this.state.permissions.map(() => {
                return {
                    id: true,
                    role: true,
                    include: true,
                    permission: true,
                    domain: true
                }
            });
            userDisable = this.state.users.map(()=>{
                return {
                    role: true,
                    emailAddress:true
                }
            })
            buttonStatus=false
            loading = true;
        } else{
            disable = this.state.permissions.map((item) => {
                if(item.permission === 'domain'){
                    return {
                        id:false,
                        role:false,
                        include:false,
                        permission:false,
                        domain: false
                    }
                }else if(item.permission === 'user'){
                    return {
                        id:false,
                        role:true,
                        include:false,
                        permission:false,
                        domain: true
                    }
                }else {
                    return {
                        id:false,
                        role:false,
                        include:false,
                        permission:false,
                        domain: true
                    }
                }
            })
        }

        this.setState({
            disableFields: disable,
            disableUserFields: userDisable,
            buttonStatus:buttonStatus,
            loading:loading
        })

    }

    handlePermissionCSV = (event)=>{
        var file = event.target.files[0];
        readCsvFile(file).then((content)=>{
            if(!!content.filter((item)=>(
                item.hasOwnProperty('include') &&
                item.hasOwnProperty('id') &&
                item.hasOwnProperty('permission') )).length
            ){
                this.setState({
                    permissions:content
                });
                this.updateUserDisplayState()
            }else{
                alert('Invalid File, Please Upload Correct Permissions File')
            }

            console.log(content)
        }).catch((error)=>{
            alert('Invalid File, Please Upload Correct Permissions File')
            console.log(error)
        })
    }

    handleUserCSV = (event)=>{
        var file = event.target.files[0];
        readCsvFile(file).then((content)=>{
            if(!!content.filter((item)=>(
                item.hasOwnProperty('emailAddress') &&
                item.hasOwnProperty('role') )).length
            ){
                this.setState({
                    users:content
                });
            }else {
                alert('Invalid File, Please Upload Correct Users File')
            }
            console.log(content)
        }).catch((error)=>{
            alert('Invalid File, Please Upload Correct Users File')
            console.log(error)
        })
    }

    handelPermissionsChange = (event, index)=>{
        event.persist();
        // console.log(event, index)
        let permissionsValues = this.state.permissions;
        permissionsValues[index] = {
            ...permissionsValues[index],
            [event.target.name]: event.target.value
        };
        if(index === permissionsValues.length - 1){
            if(permissionsValues[index]['permission'] === 'domain'){
                if(
                    !!permissionsValues[index]['domain'] &&
                    !!permissionsValues[index]['include'] &&
                    !!permissionsValues[index]['id'] &&
                    !!permissionsValues[index]['role']
                ){
                    permissionsValues.push(permissionFieldValues)
                }
            }else if(permissionsValues[index]['permission'] === 'user'){
                if(
                    !!permissionsValues[index]['include'] &&
                    !!permissionsValues[index]['permission'] &&
                    !!permissionsValues[index]['id']
                ){
                    permissionsValues.push(permissionFieldValues)
                }
            } else if(permissionsValues[index]['permission'] === 'anyone'){
                if(
                    !!permissionsValues[index]['include'] &&
                    !!permissionsValues[index]['permission'] &&
                    !!permissionsValues[index]['id'] &&
                    !!permissionsValues[index]['role']
                ){
                    permissionsValues.push(permissionFieldValues)
                }
            }
        }
        this.setState({
            permissions:permissionsValues
        });
        this.updateUserDisplayState()


    };

    handelUsersChange = (event, index)=>{
        event.persist();
        // console.log(event, index)
        let usersValues = this.state.users;
        usersValues[index] = {
            ...usersValues[index],
            [event.target.name]: event.target.value
        };
        if(index === usersValues.length - 1){
            if(
                !!usersValues[index]['emailAddress'] &&
                !!usersValues[index]['emailAddress'].match(/\S+@\S+\.\S+/) &&
                !!usersValues[index]['role']
            ){
                usersValues.push(userPermissionFormFieldsValues)
            }
        }
        this.setState({
            users:usersValues
        })
    };

    componentDidMount() {
        ipcRenderer.on('google-auth-permissions', (event, data) => {
            if(data.status === 'pending'){
                this.updateDisable(data.all)
            }else if(data.status === 'success'){
                this.setState({
                    loading:false
                })
                alert('File Permissions Updated Successfully')
                console.log("google-auth-permissions", data)
            }else if(data.status === 'progress'){
                console.log("google-auth-permissions", data.response.permission)
                this.setState({
                    tableData: tableStateUpdate(this.state.tableData, data.response.permission)
                });
            }


        });
    }

    handleSubmit = (event)=>{
        event.persist();
        let permissions = generatePermissions(this.state)
        console.log(permissions)
        ipcRenderer.send('google-auth-permissions', permissions)
    }

    render(){
        const { classes } = this.props;
        return (
            <React.Fragment>
                <Card className={classes.cardControll}>
                    <CardHeader title="Files and Folder Details" action={
                        this.state.buttonStatus &&
                        (<Button
                            variant="contained"
                            component="label"
                            size="small"
                        >
                            Upload CSV
                            <input accept=".csv" type="file" style={{ display: "none" }} onChange={this.handlePermissionCSV} />
                        </Button>)
                    } />
                    <CardContent>
                        <Form 
                            values={this.state.permissions}
                            fields={permissionFields} 
                            onChange={this.handelPermissionsChange}
                            disabled={this.state.disableFields}
                        />
                    </CardContent>
                    <CardActions className={classes.cardAction}>
                        {this.state.loading && (<div className={classes.root}>
                            <LinearProgress />
                        </div>)}
                        {this.state.buttonStatus && (<Button
                            size="small"
                            variant="contained"
                            color="primary"
                            className={classes.cardButton}
                            onClick={this.handleSubmit}
                        >
                            Submit
                        </Button>)}
                    </CardActions>
                </Card>
                {this.state.usersDisplay && (
                    <Card className={classes.cardControll}>
                        <CardHeader title="Permissions For User" action={
                            this.state.buttonStatus &&
                            (<Button
                                variant="contained"
                                component="label"
                                size="small"
                            >
                                Upload CSV
                                <input accept=".csv" type="file" style={{ display: "none" }} onChange={this.handleUserCSV} />
                            </Button>)
                        }  />
                        <CardContent>
                            <Form
                                values={this.state.users}
                                fields={userFields}
                                onChange={this.handelUsersChange}
                                disabled={this.state.disableUserFields}
                            />
                        </CardContent>
                    </Card>
                )}
                {!!this.state.tableData.length && (
                    <Card className={classes.cardControll}>
                        <CardHeader title="Results" />
                        <CardContent>
                            <Table rows={this.state.tableData}/>
                        </CardContent>
                    </Card>
                )}
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(Forms);
