import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty, map } from 'lodash';
import classNames from 'classnames';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    Paper,
    } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import Scrim from '../Utilities/Scrim';
import LocationContext from '../LocationContext';
import SubscriptionControl from './SubscriptionControl';
import Qualifications from '../Controls/Qualifications';

const styles = theme => ({
    container: {
        alignItems: 'center',
        color: theme.palette.primary.contrastText,
        flexFlow: 'row wrap',
        justifyContent: 'center',
        padding: `${theme.spacing(1)} ${theme.spacing(3)} ${theme.spacing(3)}`,
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1),
        },
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        margin: '0 auto',
        padding: theme.spacing(3),
        textAlign: 'left',
        width: '80%',
        [theme.breakpoints.up('xs')]: {
            width: '90%',
        },
        [theme.breakpoints.up('sm')]: {
            width: '80%',
        },
        [theme.breakpoints.up('md')]: {
            width: '60%',
        },
        [theme.breakpoints.up('lg')]: {
            width: '50%',
        },
    },
    actionsContainer: {
        marginTop: theme.spacing(2),
        textAlign: 'right',
    },
    button: {
    },
    divider: {
        marginTop: `${theme.spacing(1) * 0.5}`,
    },
    qualifications: {
        color: theme.palette.secondary.main,
        marginLeft: '0',
        padding: '0',
        width: '100%',
    },
    subtitle: {
        fontSize: theme.typography.h4.fontSize,
        fontWeight: theme.typography.h4.fontWeight,
    },
    title: {
        color: theme.palette.primary.contrastText,
        fontSize: theme.typography.h2.fontSize,
        [theme.breakpoints.down('sm')]: {
            fontSize: theme.typography.h3.fontSize,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: theme.typography.h4.fontSize,
        },
        textAlign: 'center',
    },
    hide: {
        display: 'none',
    },
});

class SubscriptionsControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        onCancel: PropTypes.func.isRequired,
        onSubscribe: PropTypes.func.isRequired,
        onWait: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            subscription: null,
        }

        this.handleCancelSubscription = this.handleCancelSubscription.bind(this);
        this.handleConfirmCancel = this.handleConfirmCancel.bind(this);

        this.mounted = false;
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleCancelSubscription(subscription) {
        if (!this.mounted) {
            return;
        }

        this.setState({
            subscription: subscription,
        });
    }

    handleConfirmCancel(confirmed) {
        const { host, setErrors } = this.context;
        const { onCancel, onWait } = this.props;
        const { subscription } = this.state;

        if (!this.mounted || !subscription) {
            return;
        }

        this.setState({
            subscription: null,
        });

        if (confirmed) {
            onWait(true);
            host.cancelUserSubscription(subscription.id)
                .then(() => {
                    onCancel();
                })
                .catch((e) => {
                    console.log(e)
                    onWait(false);
                    setErrors([`Unable to cancel subscription to ${subscription.plan.title}.`])
                });
        }
    }

    renderActions() {
        const { classes, onSubscribe } = this.props;

        return (
            <React.Fragment>
                <Qualifications className={classes.qualifications} />
                <div className={classes.actionsContainer}>
                    <Button
                        className={classes.button}
                        color='primary'
                        onClick={onSubscribe}
                        size='medium'
                        variant='contained'
                    >Add Subscription</Button>
                </div>
            </React.Fragment>
        );
    }

    renderConfirmDialog() {
        const { classes } = this.props;
        const { subscription } = this.state;

        if (isEmpty(subscription)) {
            return null;
        }

        const plan = subscription.plan;
        const expiration = subscription.renewsOn.format('LL');

        return (
            <Dialog
                open={true}
                onClose={() => this.handleConfirmCancel(false)}
            >
                <DialogTitle>Cancel Your Subscription?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel your &ldquo;{plan.title}&rdquo; subscription?
                    </DialogContentText>
                    <DialogContentText>
                        If you choose to cancel, your subscription will continue until {expiration} and you will
                        have access to recalls sent prior to midnight on that day.
                        However, you will not have access to subsequent recalls and alerts.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        classes={{ textPrimary: classes.disagree }}
                        color='primary'
                        onClick={() => this.handleConfirmCancel(false)}
                    >Disagree</Button>
                    <Button
                        color='secondary'
                        onClick={() => this.handleConfirmCancel(true)}
                    >Agree</Button>
                </DialogActions>
            </Dialog>
        );
    }

    renderSubscriptions() {
        const { user } = this.context;
        const { classes } = this.props;

        const subscriptions = map(user.subscriptions, s => {
            return (
                <Grid
                    item
                    key={`subscription-${s.id}`}
                    xs={12}
                >
                    <SubscriptionControl
                        subscription={s}
                        onCancel={this.handleCancelSubscription}
                    />
                    <Divider className={classes.divider} />
                </Grid>
            );
        });

        return (
            <Grid container>
                {subscriptions}
                <Grid
                    className={classNames(isEmpty(subscriptions) || classes.hide)}
                    item
                    xs={12}
                >
                    <div className={classes.subtitle}>
                        You Have No Subscriptions
                    </div>
                    <Divider className={classes.divider} />
                </Grid>
            </Grid>
        );
    }

    render() {
        const { classes } = this.props;
        const { waiting } = this.state;

        return (
            <React.Fragment>
                {this.renderConfirmDialog()}
                <div className={classes.title}>
                    Your Subscriptions
                </div>
                <Grid
                    container
                    className={classNames(classes.container)}
                    spacing={3}
                >
                    <Grid
                        item
                        xs={12}
                    >
                        <Paper className={classes.paper}>
                            <Scrim
                                isLocal={true}
                                open={waiting}
                            />
                            {this.renderSubscriptions()}
                            {this.renderActions()}
                        </Paper>
                    </Grid>
                </Grid>
            </React.Fragment>
        );
    }
}
SubscriptionsControl.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(SubscriptionsControl);
