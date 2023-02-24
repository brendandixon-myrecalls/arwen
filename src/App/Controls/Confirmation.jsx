import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    confirmed: {
        color: theme.palette.success.main,
    },
    unconfirmed: {
        color: theme.palette.grey['500'],
    },
});

class Confirmation extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        confirmed: PropTypes.bool,
    }

    render() {
        const { classes, confirmed } = this.props;

        return (<i
            className={classNames(
                'fas fa-check-circle',
                confirmed ? classes.confirmed : classes.unconfirmed)}
        ></i>)
    }
}

export default withStyles(styles, { withTheme: true })(Confirmation);
