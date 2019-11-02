import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Chip,
    Paper,
    TableRow,
    TableHead,
    TableCell,
    TableBody,
    Table
} from '@material-ui/core'

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    paper: {
        marginTop: theme.spacing(3),
        width: '100%',
        overflowX: 'auto',
        marginBottom: theme.spacing(2),
    },
    table: {
        minWidth: 650,
    },
}));

export default function DenseTable(props) {
    const classes = useStyles();
    const { rows } = props;

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Table className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Index</TableCell>
                            <TableCell>Include</TableCell>
                            <TableCell>File Id</TableCell>
                            <TableCell>Permissions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map(row => (
                            <TableRow key={row.index}>
                                <TableCell component="th" scope="row">
                                    <Chip
                                        label={row.index}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.include}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.fileId}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>{row.permissions.map((item)=>{
                                    return (<Chip
                                        label={item}
                                        variant="outlined"
                                    />)
                                })}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </div>
    );
}