import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    root: {
    },
});

class Instruction extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        list: PropTypes.bool
    }

    render() {
        const { children, classes } = this.props;
        return (
            <Typography className={classes.root}>{children}</Typography>
        );
    }
}

export default withStyles(styles, { withTheme: true })(Instruction);
