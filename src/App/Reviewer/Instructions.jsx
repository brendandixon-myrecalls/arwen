import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    root: {
        margin: `0 0 ${theme.spacing(1)} ${-theme.spacing(1)}`,
        padding: 0,
    },
});

class Instructions extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        list: PropTypes.bool
    }

    render() {
        const { children, classes } = this.props;
        return (
            <div className={classes.root}>
                {children}
            </div>
        )
    }
}

export default withStyles(styles, { withTheme: true })(Instructions);
