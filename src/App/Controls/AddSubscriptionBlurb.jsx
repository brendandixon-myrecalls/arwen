import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Link } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import LocationContext from '../LocationContext';
import { SubscriptionsLink } from '../Routing/Links';

const styles = theme => ({
    root: {
        borderRadius: '4px',
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.text.contrastText,
        fontSize: theme.typography.h4.fontSize,
        margin: `${theme.spacing(3)} auto ${theme.spacing(3)}`,
        padding: theme.spacing(1),
        textAlign: 'center',
        width: '60%',
        [theme.breakpoints.down('sm')]: {
            fontSize: theme.typography.h5.fontSize,
            width: '80%',
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: theme.typography.h6.fontSize,
        },

        '& div': {
            color: theme.palette.primary.contrastText,
            fontSize: '0.75em',
            marginBottom: theme.spacing(2),
            textAlign: 'center',
        },
    },
    link: {
        cursor: 'hand',
        fontWeight: 'bold',
    },
    notice: {
        fontSize: '1em',
        margin: `${theme.spacing(1)} auto`,
        width: '100%',

        '& div': {
            marginBottom: 0,
        },
    },
    hide: {
        display: 'none',
    },
});

const TYPES = ['recalls', 'vehicles'];

class AddSubscriptionBlurb extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        isNotice: PropTypes.bool,
        type: PropTypes.oneOf(TYPES),
    }

    render() {
        const { classes, className, isNotice, type } = this.props;

        const title = (type == 'recalls'
            ? 'Recalls'
            : 'Vehicles');
        return (
            <div className={classNames(classes.root, !isNotice || classes.notice, className)}>
                You do not yet have an active {title} subscription.
                <div>
                    Get one now by clicking <Link
                        component={SubscriptionsLink}
                        className={classes.link} >here</Link>.
                </div>
            </div>
        );
    }
}
AddSubscriptionBlurb.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(AddSubscriptionBlurb);
