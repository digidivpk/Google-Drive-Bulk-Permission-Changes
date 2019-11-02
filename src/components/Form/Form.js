import React from 'react';
import Field from 'components/Field'
import { Grid } from '@material-ui/core'

function Form(props){
    console.log(props.values, "Form", props.fields, props.length)

    return props.values.map((value,index)=>{
        return (
            <Grid
                container
                direction="row"
                justify="flex-start"
                spacing={2}
            >
        {
            props.fields.map((field)=>{
                let disable = false;
                if(!!props.disabled){
                    if(!!props.disabled[index]){
                        if(props.disabled[index].hasOwnProperty(field.name)){
                            disable = props.disabled[index][field.name]
                        }
                    }
                }
                return <Field value={value[field.name]} field={field} onChange={props.onChange} index={index} disabled={disable} />
            })
        }
        </Grid>
        )
        
    })

    




}

export default Form;