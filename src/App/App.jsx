import React from 'react';
import ReactGA from 'react-ga';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie'
import moment from 'moment';
import classNames from 'classnames';
import { BrowserRouter, Switch } from 'react-router-dom';
import { assign, clone, isArray, isEmpty, merge, upperFirst } from 'lodash';

import { CssBaseline, Grid } from '@material-ui/core/';
import { withStyles } from '@material-ui/styles';

import HostURLConfig from '../../.aws/host.json';
import AnalyticsConfig from '../../.aws/analytics.json';

import Alert from './Utilities/Alert';
import AppContext from './AppContext';
import { Credentials, GuestCredentials } from '../Common/Credentials';
import ErrorPage from './Utilities/ErrorPage';
import { IsHostError } from '../Common/HostError';
import { Guest } from '../Common/User';
import { DISTANT_PAST, FAR_FUTURE, JWT_COOKIE } from '../Common/Constants';
import MainLayout from './Layout/MainLayout';
import AppRoute from './Routing/AppRoute';
import { Paths } from './Routing/Paths';
import PlainLayout from './Layout/PlainLayout';
import Progress from './Utilities/Progress';
import { Routes } from './Routing/Routes';
import rh from '../Common/Host';

const styles = theme => ({
    root: {
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.fontSize,
        fontWeight: theme.typography.fontWeight,
    },
    hide: {
        display: 'none',
    },
});

const JWT_COOKIE_OPTIONS = {
    domain: process.env.DOMAIN,
    path: Paths.root,
    secure: (process.env.HOST_MODE == 'remote')
}

function createRoute(route) {
    const render = (route.layout == 'main')
        ? (props => {
                return (
                    <MainLayout
                        component={route.component}
                        location={props.location}
                        match={props.match}
                        path={route.path}
                    />
                );
            })
        : (props => {
            return (
                <PlainLayout
                    component={route.component}
                    location={props.location}
                    match={props.match}
                    path={route.path}
                />
            );
        });

    return (
        <AppRoute
            key={route.path}
            path={route.path}
            authorizer={route.authorizer}
            exact
            render={render}
        />
    )
}

class App extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
    }

    static getDerivedStateFromError(error, errorInfo) {
        return {
            error: error,
            context: {
                credentials: GuestCredentials,
                user: Guest,
            },
        }
    }

    constructor(props) {
        super(props);

        this.mounted = false;

        this.evaluateError = this.evaluateError.bind(this);

        this.handleRemindLater = this.handleRemindLater.bind(this);
        this.handleTimer = this.handleTimer.bind(this);

        this.isExpired = this.isExpired.bind(this);

        this.needsHelp = this.needsHelp.bind(this);
        this.needsWelcome = this.needsWelcome.bind(this);
        this.wantsHelp = this.wantsHelp.bind(this);

        this.raiseAnalyticsEvent = this.raiseAnalyticsEvent.bind(this);
        this.trackPageview = this.trackPageview.bind(this);
        this.shouldTrackUser = this.shouldTrackUser.bind(this);

        this.setCredentials = this.setCredentials.bind(this);
        this.setErrors = this.setErrors.bind(this);
        this.setFatal = this.setFatal.bind(this);
        this.setMessages = this.setMessages.bind(this);
        this.setUser = this.setUser.bind(this);

        this._routes = Routes.map(route => createRoute(route));

        this.state = {
            alertMessages: [],
            alertVariant: 'success',

            error: null,
            cookies: null,
            credentialsChecked: false,
            showExpiredAfter: FAR_FUTURE,
            timer: null,

            showHelp: false,
            showWelcome: false,

            context: {
                credentials: GuestCredentials,
                host: null,
                user: Guest,

                evaluateError: this.evaluateError,

                handleRemindLater: this.handleRemindLater,
                isExpired: this.isExpired,

                needsHelp: this.needsHelp,
                needsWelcome: this.needsWelcome,
                wantsHelp: this.wantsHelp,

                raiseAnalyticsEvent: this.raiseAnalyticsEvent,
                trackPageview: this.trackPageview,

                setCredentials: this.setCredentials,
                setErrors: this.setErrors,
                setFatal: this.setFatal,
                setMessages: this.setMessages,
                setUser: this.setUser,
            },
        };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
        });
        console.log(`Error: ${error.toString()}\n${errorInfo.componentStack}`)
    }

    componentDidMount() {
        this.mounted = true;

        const gaConfig = AnalyticsConfig[process.env.BUILD_MODE];
        ReactGA.initialize(gaConfig.trackingId, {
            testMode: process.env.BUILD_MODE != 'production',
            gaOptions: {
                siteSpeedSampleRate: 100,
            },
        });

        const host = new rh.Host(HostURLConfig[process.env.HOST_MODE].url);

        const cookies = new Cookies();
        const jwtCookie = cookies.get(JWT_COOKIE);
        const credentials = new Credentials(jwtCookie);
        const checkCredentials = credentials.hasToken;

        host.credentials = credentials;

        this.setState((state) => {
            return {
                cookies: cookies,
                context: assign(state.context, {
                    host: host
                }),
                credentialsChecked: !checkCredentials,
            }
        });

        if (checkCredentials) {
            host.validateCredentials()
                .then(() => host.readUser())
                .then(user => {
                    this.setCredentials(credentials, true);
                    this.setUser(user);
                })
                .catch((e) => {
                    credentials.setToken();
                    this.setCredentials(credentials);
                })
                .then(() => {
                    if (this.mounted) {
                        this.setState({
                            credentialsChecked: true,
                        });
                    }
                });
        }
    }

    componentWillUnmount() {
        const { endHistoryListen, context, timer } = this.state;

        this.mounted = false;

        if (endHistoryListen) {
            endHistoryListen();
        }

        if (context.host) {
            context.host.cancelAll();
        }

        if (timer) {
            clearTimeout(timer);
        }
    }

    evaluateError(e) {
        if (!this.mounted) {
            return true;
        }

        if (IsHostError(e)) {
            if (e.isUnauthorized) {
                this.setState((state) => {
                    let credentials = state.context.credentials;
                    credentials.clearToken();

                    state.context.host.credentials = credentials;
                    return ({
                        alertMessages: ['Your session has expired. Please sign-in again.'],
                        alertVariant: 'error',
                        context: assign(state.context, {
                            credentials: credentials,
                        }),
                    });
                });
                return true;
            }

            if (e.isForbidden) {
                this.setErrors(['You do not have access.'])
                return true;
            }

            if (e.isConflict) {
                this.setErrors(e.messages);
                return true;
            }
        }

        this.setErrors([<span>We&apos;re sorry! Something failed. Please try again later.</span>]);
        console.log(e);
        return false;
    }

    handleRemindLater() {
        if (!this.mounted) {
            return;
        }

        this.setState({
            timer: setTimeout(this.handleTimer, (15 * 60 * 1000)),
            showExpiredAfter: moment().utc().add(1, 'h'),
        });
    }

    handleTimer() {
        if (!this.mounted) {
            return;
        }

        this.setState({
            timer: null,
            showExpiredAfter: moment().utc().subtract(1, 's')
        });
    }

    isExpired() {
        const { showExpiredAfter } = this.state;
        return showExpiredAfter <= moment().utc();
    }

    needsHelp() {
        return this.state.showHelp;
    }

    needsWelcome() {
        return this.state.showWelcome;
    }

    wantsHelp(showHelp=false, showWelcome=false) {
        if (!this.mounted) {
            return;
        }

        if (showHelp && this.shouldTrackUser()) {
            ReactGA.modalview('/help');
        }

        this.setState(state => {
            if (state.showHelp != showHelp || state.showWelcome != showWelcome)  {
                return ({
                    showHelp: showHelp,
                    showWelcome: showWelcome,
                });
            }
            return state;
        });
    }

    raiseAnalyticsEvent(category, action, label=null) {
        if (!this.mounted) {
            return;
        }

        if (!this.shouldTrackUser()) {
            return;
        }

        let options = {
            category: category,
            action: action || ''
        };
        if (!isEmpty(label)) {
            options.label = `${label}`;
        }
        ReactGA.event(options);
    }

    trackPageview(location) {
        if (!this.mounted) {
            return;
        }

        if (!this.shouldTrackUser()) {
            return;
        }

        ReactGA.set({
            page: location.pathname
        });
        ReactGA.pageview(location.pathname);
    }

    shouldTrackUser() {
        const { context } = this.state;
        const { user } = context;
        return (user || Guest).shouldTrack;
    }

    setCredentials(credentials, fRemember = false) {
        if (!this.mounted) {
            return;
        }

        this.setState((state) => {
            credentials = credentials || GuestCredentials;

            if (fRemember) {
                state.cookies.set(
                    JWT_COOKIE,
                    credentials.toJSON(),
                    merge(clone(JWT_COOKIE_OPTIONS), { expires: credentials.expiresAt }))
            }
            else {
                state.cookies.remove(JWT_COOKIE, JWT_COOKIE_OPTIONS)
            }

            state.context.host.credentials = credentials;
            return ({
                alertMessages: [],
                context: assign(state.context, {
                    credentials: credentials
                })
            });
        })
    }

    setErrors(errors) {
        if (!this.mounted) {
            return;
        }

        if (isEmpty(errors)) {
            errors = [];
        }
        else if (IsHostError(errors)) {
            errors = errors.messages;
        }
        else if (!isArray(errors)) {
            errors = [isEmpty(errors.message) ? 'Unknown Error' : upperFirst(errors.message)];
        }

        this.setState({
            alertMessages: errors,
            alertVariant: 'error',
        });
    }

    setFatal(error) {
        if (!this.mounted) {
            return;
        }

        this.setState({
            error: error
        });
    }

    setMessages(messages) {
        if (!this.mounted) {
            return;
        }

        if (isEmpty(messages)) {
            messages = []
        }
        else if (!isArray(messages)) {
            messages = [messages];
        }

        this.setState({
            alertMessages: messages,
            alertVariant: 'success',
        });
    }

    setUser(user) {
        if (!this.mounted) {
            return;
        }

        user = user || Guest;

        ReactGA.set({
            userId: user.shouldTrack ? user.id : '',
        });

        const isExpired = !isEmpty(user) && !user.isGuest && user.isInactive && user.isMember;
        this.setState((state) => {
            return ({
                showExpiredAfter: isExpired ? DISTANT_PAST : FAR_FUTURE,
                context: assign(state.context, {
                    user: user
                })
            });
        });
    }

    render() {
        const { classes } = this.props;
        const { alertMessages, alertVariant, context, cookies, credentialsChecked, error } = this.state;

        if (!context.host) {
            return null;
        }
        else {

            if (!credentialsChecked) {
                return (
                    <Grid
                        className={classes.root}
                        item
                        xs={12}
                        style={{ paddingTop: '2rem', textAlign: 'center' }}
                    >
                        <Progress />
                    </Grid>
                );
            }

            if (!isEmpty(error)) {
                cookies.remove(JWT_COOKIE, JWT_COOKIE_OPTIONS)
            }

            return (
                <AppContext.Provider value={context}>
                    <CssBaseline />
                    <ErrorPage
                        className={classNames(classes.root, !isEmpty(error) || classes.hide)}
                        error={[isEmpty(error) ? '' : error.toString()]}
                        variant='fatal'
                    />
                    <div className={classNames(classes.root, isEmpty(error) || classes.hide)}>
                        <BrowserRouter className="App">
                            <Switch>
                                {this._routes}
                            </Switch>
                        </BrowserRouter>
                        <Alert
                            messages={alertMessages}
                            variant={alertVariant}
                        />
                    </div>
                </AppContext.Provider>
            );
        }
    }
}

export default withStyles(styles, { withTheme: true })(App);
