import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    root: {
        display: 'inline-block',
        fontSize: '0.8em',
        marginLeft: theme.spacing(1),
    },
    satisfied: {
        color: theme.palette.success.main,
    },
    unsatisfied: {
        color: theme.palette.grey['500'],
    },
    hide: {
        display: 'none',
    },
});

const DEFAULT_MESSAGE = '(Select at least one)';

class Required extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        message: PropTypes.string,
        satisfied: PropTypes.bool,
    }

    render() {
        const { classes, message, satisfied } = this.props;

        return (<div className={classes.root}>
            <span className={classNames(
                classes.unsatisfied,
                !satisfied || classes.hide)}>{message || DEFAULT_MESSAGE}</span>
            <span className={classNames(satisfied || classes.hide)}>
                <i
                    className={classNames(
                        'fas fa-check-circle',
                        classes.satisfied)}
                ></i>
            </span>
        </div>);
    }
}

export default withStyles(styles, { withTheme: true })(Required);
