import React, {useRef, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    InputLabel,
    FormControl,
    MenuItem,
    Select,
    TextField,
    Grid
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
    },
    formControl: {
        marginLeft: theme.spacing(1),
        width: "100%"
    // minWidth: 120,
    },
    textField: {
        marginLeft: theme.spacing(1),
        width: "100%"
    },
}));

function Fields(props){
    const classes = useStyles();
    const inputLabel = useRef(null);
    const [labelWidth, setLabelWidth] = useState(0);
    React.useEffect(() => {
        if(!!inputLabel.current){
            setLabelWidth(inputLabel.current.offsetWidth);
        }
    }, []);

    const handleChange = (event)=>{
        props.onChange(event, props.index)
    }

    return (
        <Grid
            item
            {...props.field.config}
        >
            {(props.field.type === "select") && (
                <FormControl
                    native
                    variant="outlined" 
                    className={classes.formControl}
                    key={`${props.field.name}-${props.index}`}
                    autoWidth={true}
                >
                    <InputLabel ref={inputLabel} id={`${props.field.name}-${props.index}-label`}>
                        {props.field.title}
                    </InputLabel>
                    <Select
                        labelId={`${props.field.name}-${props.index}-label`}
                        id={`${props.field.name}-${props.index}`}
                        value={props.value}
                        autoWidth={true}
                        name={props.field.name}
                        onChange={(event)=>handleChange(event)}
                        labelWidth={labelWidth}
                        disabled={props.disabled}
                    >
                        {props.field.options.map((option)=>{
                            return (<MenuItem value={option.value}>{option.title}</MenuItem>)
                        })}
                    </Select>
                </FormControl>
            )}
            {(props.field.type === "text") && (
                <TextField
                    key={`${props.field.name}-${props.index}`}
                    id={`${props.field.name}-${props.index}`}
                    className={classes.textField}
                    value={props.value}
                    name={props.field.name}
                    onChange={handleChange}
                    required={props.field.required}
                    label={props.field.title}
                    variant="outlined"
                    disabled={props.disabled}
                />
            )}
            {(props.field.type === "index") && (
                <TextField
                    key={`${props.field.name}-${props.index}`}
                    id={`${props.field.name}-${props.index}`}
                    className={classes.textField}
                    value={props.index +1 }
                    name="index"
                    label="Index"
                    variant="outlined"
                    disabled={true}
                />
            )}
          </Grid>
    );
}

export default Fields;