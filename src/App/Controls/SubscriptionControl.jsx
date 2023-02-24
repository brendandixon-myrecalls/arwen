import React from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash';
import classNames from 'classnames';

import { Button } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import LocationContext from '../LocationContext';

const styles = theme => ({
    root: {
    },
    actions: {
        textAlign: 'right',
    },
    actionButton: {
    },
    content: {
        fontSize: theme.typography.body1.fontSize,
        fontWeight: theme.typography.body1.fontWeight,
        [theme.breakpoints.down('sm')]: {
            fontSize: '1.4rem',
        },
    },
    renewsSoon: {
        color: theme.palette.error.main,
    },
    title: {
        fontSize: theme.typography.h4.fontSize,
        fontWeight: theme.typography.h4.fontWeight,
        [theme.breakpoints.down('sm')]: {
            fontSize: theme.typography.h5.fontSize,
            fontWeight: theme.typography.h5.fontWeight,
        },
    },
});

class SubscriptionControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        subscription: PropTypes.object.isRequired,
        onCancel: PropTypes.func.isRequired,
    }

    renderFeatures() {
        const { classes, subscription } = this.props;

        const plan = subscription.plan;

        return (
            <div className={classNames(classes.features, classes.content)}>
                This plan includes
                <ul>
                    {map(plan.features, (f, i) => <li key={`feature-${i}`}>{f}</li>)}
                </ul>
            </div>
        );
    }

    renderRenewal() {
        const { classes, subscription } = this.props;

        const renewal = (subscription.willExpire
            ? `Expires ${subscription.expiresOn.format('LL')}`
            : `Renews ${subscription.renewsOn.format('LL')} for $${subscription.plan.discountPrice}`);

        return (
            <div className={classNames(classes.renewal, classes.content)}>
                <div>Plan active since {subscription.startedOn.format('LL')}</div>
                <div className={classNames((!subscription.renewsSoon && !subscription.willExpire) || classes.renewsSoon)}>
                    {renewal}
                </div>
            </div>
        );
    }

    render() {
        const { classes, onCancel, subscription } = this.props;

        const plan = subscription.plan;

        return (
            <div>
                <div className={classes.title}>
                    {plan.title}
                </div>
                {this.renderFeatures()}
                {this.renderRenewal()}
                <div className={classes.actions}>
                    <Button
                        className={classes.actionButton}
                        color='primary'
                        disabled={subscription.willExpire}
                        onClick={() => onCancel(subscription)}
                    >Cancel Subscription</Button>
                </div>
            </div>
        );
    }
}
SubscriptionControl.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(SubscriptionControl);
