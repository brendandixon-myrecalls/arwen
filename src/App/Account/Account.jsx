import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeep, filter, map } from 'lodash';
import classNames from 'classnames';

import { Link } from 'react-router-dom';

import { Button, Paper, Typography } from '@material-ui/core';
import { FormControl } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import Scrim from '../Utilities/Scrim';
import { ConformPhone } from '../Controls/PhoneInput';
import EmailControl from '../Controls/EmailControl';
import { IsHostError } from '../../Common/HostError';
import LocationContext from '../LocationContext';
import NameControl from '../Controls/NameControl';
import { paramsFromQuery } from '../../Common/Core';
import PasswordControl from '../Controls/PasswordControl';
import { Paths } from '../Routing/Paths';
import PhoneControl from '../Controls/PhoneControl';
import Progress from '../Utilities/Progress';


const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        margin: '2em auto',
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
    actions: {
        textAlign: 'right',
    },
    actionButton: {
        marginRight: theme.spacing(2),
    },
    confirmable: {
        position: 'relative',
    },
    confirmation: {
        position: 'absolute',
        right: 0,
    },
    confirmed: {
        color: 'green',
    },
    link: {
        textDecoration: 'none',
    },
    unconfirmed: {
        color: theme.palette.grey['500'],
    },
    error: {
        color: theme.palette.error.main,
    },
    fieldSet: {
        display: 'block',
        marginBottom: '2em',
    },
    renewal: {
        fontSize: '0.75em'
    },
    renewsSoon: {
        color: theme.palette.error.main,
    },
    subscription: {
        fontSize: '1.75em',
    },
    subscriptions: {
        marginTop: theme.spacing(1),
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

class Account extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this.mounted = false;

        this.state = {
            changed: false,
            saving: false,

            name: {
                firstName: '',
                lastName: '',
            },
            nameReady: false,

            email: '',
            emailReady: false,

            password: '',
            passwordReady: false,

            phone: '',
            phoneReady: false,
        }

        this.handleReady = this.handleReady.bind(this);

        this.accountChanged = this.accountChanged.bind(this);
        this.emailChanged = this.emailChanged.bind(this);
        this.nameChanged = this.nameChanged.bind(this);
        this.phoneChanged = this.phoneChanged.bind(this);
        this.canSaveAccount = this.canSaveAccount.bind(this);
        this.resetAccount = this.resetAccount.bind(this);
        this.saveAccount = this.saveAccount.bind(this);

        this.canSavePassword = this.canSavePassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.passwordChanged = this.passwordChanged.bind(this);
        this.savePassword = this.savePassword.bind(this);

        this.saveUser = this.saveUser.bind(this);

        this.sendConfirmation = this.sendConfirmation.bind(this);
    }

    componentDidMount() {
        const { location, user } = this.context;

        this.mounted = true;

        this.resetAccount();

        if (location.search && (!user.emailConfirmed || !user.phoneConfirmed)) {
            this.sendConfirmation();
        }
    }

    componentWillUnmount() {
        const { host } = this.context;

        this.mounted = false;
        host.cancelAll();
    }

    handleReady(valueField, readyField) {
        return (value, ready) => {
            if (this.mounted) {
                this.setState({
                    [valueField]: value,
                    [readyField]: ready,
                });
            }
        }
    }

    accountChanged() {
        return this.emailChanged() || this.nameChanged() || this.phoneChanged();
    }

    emailChanged() {
        const { user } = this.context;
        const { email } = this.state;
        return user.email != email;
    }

    nameChanged() {
        const { user } = this.context;
        const { name } = this.state;
        return (user.firstName != name.firstName || user.lastName != name.lastName);
    }

    phoneChanged() {
        const { user } = this.context;
        const { phone } = this.state;
        return ConformPhone(user.phone || '') != ConformPhone(phone || '');
    }

    canSaveAccount() {
        const { emailReady, nameReady, phoneReady } = this.state;

        const emailChanged = this.emailChanged();
        if (!emailReady && emailChanged) {
            return false;
        }

        const nameChanged = this.nameChanged();
        if (!nameReady && nameChanged) {
            return false;
        }

        const phoneChanged = this.phoneChanged();
        if (!phoneReady && phoneChanged) {
            return false;
        }

        return emailChanged || nameChanged || phoneChanged;
    }

    resetAccount() {
        if (!this.mounted) {
            return;
        }

        const { user } = this.context;
        this.setState({
            name: {
                firstName: user.firstName || '',
                lastName: user.lastName || '',
            },
            nameReady: false,

            email: user.email,
            emailReady: false,

            phone: user.phone,
            phoneReady: false,
        });
    }

    saveAccount() {
        return this.saveUser('firstName', 'lastName', 'email', 'phone');
    }

    canSavePassword() {
        const { passwordReady } = this.state;
        return passwordReady && this.passwordChanged();
    }

    resetPassword() {
        if (!this.mounted) {
            return;
        }

        this.setState({
            password: '',
            passwordReady: false,
        });
    }

    passwordChanged() {
        const { password } = this.state;
        return (password || '').length > 0;
    }

    savePassword() {
        return this.saveUser('password')
            .then(() => this.resetPassword());
    }

    saveUser(...fields) {
        if (!this.mounted) {
            return;
        }

        const { evaluateError, host, user, setMessages, setUser } = this.context;
        const { email, name, phone, password } = this.state;

        this.setState({
            saving: true
        });

        let newUser = cloneDeep(user);
        if (fields.includes('password')) {
            newUser.password = password;
        }
        else {
            newUser.email = email;
            newUser.firstName = name.firstName;
            newUser.lastName = name.lastName;
            newUser.phone = phone;
        }

        return host.updateUser(newUser, ...fields)
            .then(user => {
                setUser(user);
                setMessages(['Changes successfully saved']);
            })
            .catch(e => {
                evaluateError(e);
            })
            .then(() => {
                if (this.mounted) {
                    this.setState({
                        saving: false
                    });
                }
            });
    }

    sendConfirmation() {
        if (!this.mounted) {
            return;
        }

        const { evaluateError, host, location, setErrors, setMessages, setUser } = this.context;

        const params = paramsFromQuery(location.search);
        if (!params.token || !(['email', 'phone'].includes(params.confirm))) {
            return;
        }

        this.setState({
            saving: true,
        });

        host.updateUserConfirmation(params.token)
            .then(() => host.readUser())
            .then(user => setUser(user))
            .then(() => {
                setMessages(['Confirmation successful!']);
            })
            .catch(e => {
                if (IsHostError(e) && e.isBadRequest) {
                    setErrors(['The confirmation token is no longer valid.']);
                }
                else {
                    evaluateError(e);
                }
            })
            .then(() => {
                if (this.mounted) {
                    this.setState({
                        saving: false
                    });
                }
            });
    }

    renderActions(changed, ready, resetHandler, saveHandler) {
        const { classes } = this.props;
        return (
            <div
                className={classes.actions}
            >
                <Button
                    className={classes.actionButton}
                    color='primary'
                    disabled={!changed}
                    variant='contained'
                    onClick={resetHandler}
                >Reset</Button>
                <Button
                    className={classes.actionButton}
                    color='primary'
                    disabled={!ready}
                    variant='contained'
                    onClick={saveHandler}
                >Save</Button>
            </div>
        )
    }

    render() {
        const { user } = this.context;
        const { classes } = this.props;
        const { email, name, password, saving } = this.state;

        const emailUnconfirmed = this.emailChanged() || !user.emailConfirmed;

        /*
        DISABLE PHONE
        const phoneUnconfirmed = this.phoneChanged() || !user.phoneConfirmed;
                    <PhoneControl
                        phone={phone}
                        phoneConfirmed={!phoneUnconfirmed}
                        required={false}
                        showConfirmation={true}
                        onChange={this.handleReady('phone', 'phoneReady')}
                    />
        */

        const subscriptions = map(filter(user.subscriptions, s => s.isActive), s => {
            const plan = s.plan;
            const renewal = (s.willExpire
                ? `expires ${s.expiresOn.format('LL')}`
                : `renews ${s.renewsOn.format('LL')}`);
            return (<div className={classes.subscription} key={`subscription-${s.id}`}>
                {plan.title} <span
                    className={classes.renewal}>(<span
                        className={classNames((!s.renewsSoon && !s.willExpire) || classes.renewsSoon)}>{renewal}</span>)</span>
            </div>)
        });

        return (
            <React.Fragment>
                <div className={classes.title}>
                    Your Account
                </div>
                <Paper
                    className={classes.root}
                >
                    <Scrim
                        hasToolbar={true}
                        open={saving}
                    >
                        <Progress />
                    </Scrim>

                    <FormControl className={classes.fieldSet} component='fieldset'>
                        <Typography variant='h6'>Contact Details</Typography>
                        <NameControl
                            name={name}
                            required={true}
                            onChange={this.handleReady('name', 'nameReady')}
                        />
                        <EmailControl
                            email={email}
                            emailConfirmed={!emailUnconfirmed}
                            required={true}
                            showConfirmation={true}
                            onChange={this.handleReady('email', 'emailReady')}
                        />
                        {this.renderActions(
                            this.accountChanged(),
                            this.canSaveAccount(),
                            this.resetAccount,
                            this.saveAccount)}
                    </FormControl>

                    <FormControl className={classes.fieldSet} component='fieldset'>
                        <Typography variant='h6'>Change Your Password</Typography>
                        <PasswordControl
                            password={password}
                            required={true}
                            onChange={this.handleReady('password', 'passwordReady')}
                        />
                        {this.renderActions(
                            this.passwordChanged(),
                            this.canSavePassword(),
                            this.resetPassword,
                            this.savePassword)}
                    </FormControl>

                    <FormControl className={classes.fieldSet} component='fieldset'>
                        <Typography variant='h6'>Your Active Subscriptions</Typography>
                        <div className={classes.subscriptions}>
                            {subscriptions}
                        </div>
                        <div
                            className={classes.actions}
                        >
                            <Link className={classes.link} to={Paths.subscriptions}>
                                <Button
                                    className={classes.actionButton}
                                    color='primary'
                                >Manage Subscriptions</Button>
                            </Link>
                        </div>
                    </FormControl>
                </Paper>
            </React.Fragment>
        )
    }
}
Account.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(Account);
