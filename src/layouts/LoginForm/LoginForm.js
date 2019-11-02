import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Fab } from '@material-ui/core'
import { Navigation } from '@material-ui/icons';
import {jsonStorage} from "utils/storage";
const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles(theme => ({
    fab: {
      margin: theme.spacing(1),
    },
    grid: {
      marginTop: theme.spacing(30),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
  }));

function LoginForm(props){
    const classes = useStyles();
    ipcRenderer.on('google-auth-token', (event, token) => {
        console.log("google-auth-token", token)
        if(!!token){
            jsonStorage.setItem('session', token);
            window.location.reload();
        }
    });

    (() => {

        ipcRenderer.send('google-auth-status-main', 'Get APi Key')


    })();


    const handleClick = (event)=>{
        ipcRenderer.send('google-auth-view', 'Open Google Auth')
    };

    return (
        <Grid
            className={classes.grid}
            container
            direction="row"
            justify="center"
            alignItems="center"
            alignContent="center"
        >
        <Grid item>
          <Fab color="primary" variant="extended" aria-label="like" className={classes.fab} onClick={handleClick}>
              <Navigation className={classes.extendedIcon} />
              Sign in Via Google
          </Fab>
        </Grid>
        
        </Grid>
    )

    




}

export default LoginForm;