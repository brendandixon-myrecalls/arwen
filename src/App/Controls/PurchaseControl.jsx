import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isEmpty, map } from 'lodash';

import { Elements, StripeProvider } from 'react-stripe-elements';

import {
    Button,
    Typography
    } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import StripeConfig from '../../../.aws/stripe.json';

import AddressControl from './AddressControl';
import CardForm from './CardForm';
import { IsHostError } from '../../Common/HostError';
import LocationContext from '../LocationContext';

const styles = theme => ({
    actionsContainer: {
        marginTop: theme.spacing(2),
        textAlign: 'right',
    },
    errors: {
        borderRadius: '4px',
        backgroundColor: theme.palette.error.dark,
        color: theme.palette.error.contrastText,
        fontSize: '1.6em',
        padding: '0.7em',
        '& ul': {
            margin: 0,
            padding: 0,
            listStyleType: 'none',
        },
    },
    errorTitle: {
        fontSize: theme.typography.h6.fontSize,
    },
    recaptcha: {
        margin: '1rem 0',
    },
    planTitle: {
        fontSize: '1.2em',
    },
    section: {
        marginTop: theme.spacing(3),
    },
    subtitle: {
        color: theme.palette.primary.main,
        fontSize: theme.typography.h6.fontSize,
        marginBottom: theme.spacing(2),
    },
    plan: {
        fontSize: theme.typography.body1.fontSize,
        fontWeight: theme.typography.body1.fontWeight,
    },
    hide: {
        display: 'none',
    },
});

class PurchaseControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        plan: PropTypes.object.isRequired,
        onComplete: PropTypes.func.isRequired,
        onWait: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            address: {
                line1: '',
                line2: '',
                city: '',
                state: '',
                zip: '',
            },
            addressReady: false,
            cardNeeded: true,
            errors: [],
        }

        this.mounted = false;

        this.handlePurchase = this.handlePurchase.bind(this);
    }

    componentDidMount() {
        const { user } = this.context;

        this.mounted = true;

        if (user.isRegistered) {
            this.setState({
                cardNeeded: false,
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handlePurchase(token) {
        if (!this.mounted) {
            return;
        }

        const { host } = this.context;
        const { onComplete, onWait, plan } = this.props;

        this.setState({
            errors: []
        });

        onWait(true);
        host.createUserSubscription(plan.id, (token || {}).id)
            .then(() => {
                onComplete(true);
            })
            .catch((e) => {
                const { cardNeeded } = this.state;

                if (!IsHostError(e)) {
                    console.log(e);
                }

                if (cardNeeded) {
                    this.setState({
                        errors: (IsHostError(e)
                            ? e.messages
                            : [`Card was not accepted.`])
                    });
                }

                else {
                    this.setState({
                        cardNeeded: true,
                        errors: [`Your card is no longer valid. Please provide a new card.`],
                    });
                }

                onWait(false);
            });
    }

    renderCard() {
        const { classes, onWait } = this.props;
        const { address, addressReady, cardNeeded } = this.state;

        const stripeKey = StripeConfig[process.env.BUILD_MODE].publishKey;

        return (
            <div className={classNames(cardNeeded || classes.hide)}>
                <div className={classNames(classes.section)}>
                    <Typography className={classes.subtitle}>Billing Address</Typography>
                    <AddressControl
                        address={address}
                        focus={!addressReady}
                        onChange={(address, addressReady) => this.setState({
                            address: address,
                            addressReady: addressReady
                        })}
                    />
                </div>
                <div className={classNames(classes.section)}>
                    <Typography className={classes.subtitle}>Payment Details</Typography>
                    <StripeProvider apiKey={stripeKey}>
                        <Elements>
                            <CardForm
                                address={address}
                                disabled={!addressReady}
                                focus={addressReady}
                                onPurchase={this.handlePurchase}
                                onWait={onWait}
                            />
                        </Elements>
                    </StripeProvider>
                </div>
            </div>
        );
    }

    renderConfirm() {
        const { classes, onComplete, plan } = this.props;
        const { cardNeeded } = this.state;

        return (
            <div className={classNames(classes.section, !cardNeeded || classes.hide)}>
                <Typography>
                    Purchase a &ldquo;{plan.title}&rdquo; subscription for ${plan.discountPrice}?
                </Typography>
                <div className={classes.actionsContainer}>
                    <Button
                        classes={{ textPrimary: classes.disagree }}
                        color='secondary'
                        onClick={() => onComplete(false)}
                    >Disagree</Button>
                    <Button
                        color='primary'
                        onClick={() => this.handlePurchase()}
                    >Agree</Button>
                </div>
            </div>
        );
    }

    renderErrors() {
        const { classes } = this.props;
        const { errors } = this.state;

        return (
            <div className={classNames(classes.section, classes.errors, !isEmpty(errors) || classes.hide)}>
                <div className={classes.errorTitle}>Purchase Failed</div>
                <ul>
                    {map(errors, (e, i) => (<li key={`error-${i}`}>{e}</li>))}
                </ul>
            </div>
        )
    }

    renderPlan() {
        const { classes, plan } = this.props;

        return (
            <div className={classNames(classes.section, classes.plan)}>
                <div className={classes.planTitle}>
                    {plan.title}
                </div>
                <div>
                    This plan includes
                    <ul>
                        {map(plan.features, (f, i) => <li key={`feature-${i}`}>{f}</li>)}
                    </ul>
                </div>
                <div>
                    ${plan.discountPrice} per year
                </div>
            </div>
        );
    }

    render() {
        return (
            <React.Fragment>
                {this.renderPlan()}
                {this.renderErrors()}
                {this.renderConfirm()}
                {this.renderCard()}
            </React.Fragment>
        );
    }
}
PurchaseControl.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(PurchaseControl);
