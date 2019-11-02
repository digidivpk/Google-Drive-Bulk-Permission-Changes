import React from 'react';
import Forms from 'layouts/Forms'
import LoginForm from 'layouts/LoginForm'
import { makeStyles } from '@material-ui/core/styles';
import {
    CssBaseline,
    Container,
    Typography,
    AppBar,
    Toolbar,
    Button
} from '@material-ui/core';

import { jsonStorage } from 'utils/storage';
const { ipcRenderer } = window.require('electron');
const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    titlePointer:{
        cursor:'pointer'
    }
}));

function App() {
    const classes = useStyles();
    ipcRenderer.on('google-auth-logout', (event, args) => {
        console.log("google-auth-logout", args)
        jsonStorage.clear();
        window.location.reload();
    });
    const onLogout = (event)=>{
        let cnfrm = window.confirm("You Want to Logout Application");
        if(cnfrm){
            ipcRenderer.send('google-auth-logout', 'Logout Google Auth')
        }

    }

    const handleReload = (event)=>{
        let cnfrm = window.confirm("You Want to Reload Application");
        if(cnfrm){
            window.location.reload();
        }

    }

  return (
    <React.Fragment>
      <CssBaseline />
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar variant="dense">
                    <Typography variant="h6" className={classes.title}>
                        <span className={classes.titlePointer} onClick={handleReload}>Google Drive</span>
                    </Typography>
                    {jsonStorage.exist('session') && (<Button color="inherit" onClick={onLogout}>Logout</Button>)}
                </Toolbar>
            </AppBar>
        </div>
      <Container  maxWidth="lg">
        {jsonStorage.exist('session')? <Forms /> : <LoginForm />}
      </Container>
    </React.Fragment>
  );
}

export default App;
