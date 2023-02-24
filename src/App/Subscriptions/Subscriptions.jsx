import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

import { Link, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import { DEFAULT_AUDIENCE, DEFAULT_CATEGORIES, DEFAULT_DISTRIBUTION, DEFAULT_RISK } from '../../Common/Constants';
import { load as loadPreference } from '../../Common/Preference';
import LocationContext from '../LocationContext';
import LogoPaper from '../Layout/LogoPaper';
import OffersControl from '../Controls/OffersControl';
import { Paths } from '../Routing/Paths';
import PreferencesControl from '../Controls/PreferencesControl';
import PurchaseControl from '../Controls/PurchaseControl';
import RegisterControl from '../Controls/RegisterControl';
import SubscriptionsControl from '../Controls/SubscriptionsControl';
import { SigninLink } from '../Routing/Links';

const styles = theme => ({
    link: {
        cursor: 'hand',
        fontWeight: 'bold',
    },
    links: {
        color: theme.palette.primary.contrastText,
        marginBottom: theme.spacing(2),
        textAlign: 'center',
    },
    reset: {
        marginTop: theme.spacing(1),
        fontSize: '0.9em',
    },
    submit: {
        marginTop: theme.spacing(3),
    },
    hide: {
        display: 'none',
    },
});

const SUBSCRIPTIONS_STEP = 0;
const OFFERS_STEP = 1;
const REGISTER_STEP = 2;
const PURCHASE_STEP = 3;
const PREFERENCES_STEP = 4;
const COMPLETED_STEP = 5;

const STEPS = [
    'Subscriptions',
    'Offers',
    'Register',
    'Purchase',
    'Preferences',
    'Completed',
]

class Subscriptions extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            currentStep: -1,
            plan: null,
            registrationNeeded: false,
            waiting: false,
        }

        this.mounted = false;

        this.advanceStep = this.advanceStep.bind(this);
        this.ensurePreferences = this.ensurePreferences.bind(this);
        this.handlePurchase = this.handlePurchase.bind(this);
        this.handleSelectOffer = this.handleSelectOffer.bind(this);
        this.handleSubscribe = this.handleSubscribe.bind(this);
        this.handleUserUpdated = this.handleUserUpdated.bind(this);
        this.handleWait = this.handleWait.bind(this);
    }

    componentDidMount() {
        const { user } = this.context;

        this.mounted = true;

        const registrationNeeded = isEmpty(user) || user.isGuest;
        this.setState({
            currentStep: registrationNeeded ? OFFERS_STEP : SUBSCRIPTIONS_STEP,
            registrationNeeded: registrationNeeded,
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    advanceStep(success=true) {
        const { raiseAnalyticsEvent, user } = this.context;

        if (!this.mounted) {
            return;
        }

        this.setState(state => {
            const { wantsHelp } = this.context;
            const { currentStep, plan, registrationNeeded } = state;

            let nextStep = '';
            switch (currentStep) {
                case SUBSCRIPTIONS_STEP:
                    nextStep = OFFERS_STEP;
                    break;

                case OFFERS_STEP:
                    nextStep = (isEmpty(plan)
                        ? SUBSCRIPTIONS_STEP
                        : (registrationNeeded
                            ? REGISTER_STEP
                            : PURCHASE_STEP));
                    break;

                case REGISTER_STEP:
                    nextStep = PURCHASE_STEP;
                    break;

                case PURCHASE_STEP:
                    nextStep = (success
                        ? PREFERENCES_STEP
                        : (registrationNeeded
                            ? COMPLETED_STEP
                            : SUBSCRIPTIONS_STEP));
                    break;

                case PREFERENCES_STEP:
                    nextStep = (registrationNeeded
                        ? COMPLETED_STEP
                        : SUBSCRIPTIONS_STEP);
                    break;

                default:
                    nextStep = COMPLETED_STEP;
                    break;
            }

            if (nextStep == COMPLETED_STEP) {
                wantsHelp(registrationNeeded, registrationNeeded);
            }

            raiseAnalyticsEvent('Subscriptions', STEPS[nextStep], user.email);

            return ({
                currentStep: nextStep,
                waiting: false,
            });
        })
    }

    ensurePreferences() {
        if (!this.mounted) {
            return;
        }

        const { host, user } = this.context;
        const { plan } = this.state;

        let preference = loadPreference(user.preference);

        // Note:
        // - These checks must occur before re-reading the user from the host
        //   since they compare the prior user state with the purchased plan

        if (plan.isForRecalls && !user.hasRecallSubscription) {
            preference.alertByEmail = true;
            preference.alertByPhone = !isEmpty(user.phone);
            preference.sendSummaries = true;

            if (isEmpty(preference.audience)) {
                preference.audience = DEFAULT_AUDIENCE;
            }
            if (isEmpty(preference.categories)) {
                preference.categories = DEFAULT_CATEGORIES;
            }
            if (isEmpty(preference.distribution)) {
                preference.distribution = DEFAULT_DISTRIBUTION;
            }
            if (isEmpty(preference.risk)) {
                preference.risk = DEFAULT_RISK;
            }
        }

        if (plan.isForVehicles && !user.hasVehicleSubscription) {
            preference.alertForVins = true;
            preference.sendVinSummaries = true;
        }

        // Note:
        // - Ignore the very rare error that could occur
        //   The user will have an opportunity to set their preferences at the next step and
        //   the host guarantees legal values for critical fields
        return host.updateUserPreference(preference).catch(e => console.log(e));
    }

    handlePurchase(success) {
        let p = Promise.resolve();
        if (success) {
            p = p.then(() => this.ensurePreferences())
                .then(() => this.handleUserUpdated(true));
        }
        p.then(() => this.advanceStep(success));
    }

    handleSelectOffer(plan) {
        if (!this.mounted) {
            return;
        }

        this.setState({
            plan: plan
        });
        this.advanceStep();
    }

    handleSubscribe() {
        this.setState({
            plan: null
        });
    }

    handleUserUpdated(advance) {
        const { evaluateError, host, setErrors, setUser } = this.context;

        return (
            host.readUser()
                .then(user => {
                    setErrors();
                    setUser(user);
                    this.handleWait(false);
                })
                .then(() => {
                    if (advance) {
                        this.advanceStep();
                    }
                })
                .catch(e => {
                    console.log(e);
                    evaluateError(e);
                    this.handleWait(false);
                })
        );
    }

    handleWait(waiting) {
        if (!this.mounted) {
            return;
        }
        this.setState({
            waiting: waiting
        });
    }

    render() {
        const { user } = this.context;
        const { classes } = this.props;
        const { currentStep, plan, registrationNeeded, waiting } = this.state;

        if (currentStep < 0) {
            return null;
        }
        else if (currentStep == SUBSCRIPTIONS_STEP) {
            return (
                <SubscriptionsControl
                    onCancel={this.handleUserUpdated}
                    onSubscribe={this.advanceStep}
                    onWait={this.handleWait}
                />
            );

        }
        else if (currentStep == OFFERS_STEP) {
            return (
                <React.Fragment>
                    <OffersControl
                        onComplete={this.handleSelectOffer}
                        showCancel={!registrationNeeded}
                    />
                    <div className={classNames(classes.links, registrationNeeded || classes.hide)}>
                        <Typography variant='caption'>
                            Already a member? Click <Link
                                component={SigninLink}
                                className={classes.link} >here</Link> to sign in.
                        </Typography>
                    </div>
                </React.Fragment>
            );
        }
        else if (currentStep >= COMPLETED_STEP) {
            return (
                <Redirect to={{ pathname: Paths.root }} />
            );
        }

        let title = '';
        let component = null;

        switch (currentStep) {
            case REGISTER_STEP:
                title = 'Create Your Account';
                component = (<RegisterControl
                    onComplete={this.advanceStep}
                    onWait={this.handleWait} />);
                break;
            case PURCHASE_STEP:
                title = 'Complete the Purchase';
                component = (<PurchaseControl
                    onComplete={this.handlePurchase}
                    onWait={this.handleWait}
                    plan={plan} />);
                break;
            case PREFERENCES_STEP:
                title = 'Adjust Your Settings';
                component = (<PreferencesControl
                    onComplete={() => this.handleUserUpdated(true)}
                    onWait={this.handleWait}
                    preference={user.preference}
                    saveRequired={true} />);
                break;
        }

        return (
            <React.Fragment>
                <LogoPaper
                    title={title}
                    waiting={waiting}
                    wide={true}
                >
                    {component}
                </LogoPaper>
                <div className={classNames(classes.links, currentStep == REGISTER_STEP || classes.hide)}>
                    <Typography variant='caption'>
                        Already a member? Click <Link
                            component={SigninLink}
                            className={classes.link} >here</Link> to sign in.
                    </Typography>
                </div>
            </React.Fragment>
        );
    }
}
Subscriptions.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(Subscriptions);
