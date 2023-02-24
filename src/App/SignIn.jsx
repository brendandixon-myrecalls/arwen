import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';

import EmailControl from './Controls/EmailControl';
import JoinBlurb from './Controls/JoinBlurb';
import LocationContext from './LocationContext';
import LogoPaper from './Layout/LogoPaper';
import PasswordControl from './Controls/PasswordControl';
import { Paths } from './Routing/Paths';
import { ResetLink, SignupLink } from './Routing/Links';

const styles = theme => ({
    root: {
        alignItems: 'center',
        color: theme.palette.primary.contrastText,
        margin: `${theme.spacing(2)} auto`,
    },
    blurb: {
        marginBottom: -theme.spacing(4),
        position: 'relative',
        zIndex: theme.zIndex.modal - 1,
        [theme.breakpoints.down('sm')]: {
            width: '82%',
        },
    },
    link: {
        cursor: 'hand',
    },
    links: {
        marginTop: theme.spacing(2),
    },
    remember: {
        marginTop: '1rem',
    },
    submit: {
        marginTop: theme.spacing(3),
    },
});

class SignIn extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        path: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            email: '',
            emailReady: false,

            password: '',
            passwordReady: false,

            remember: 'on',
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleRemember = this.handleRemember.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        const { credentials } = this.context;

        this.setState({
            email: credentials.email || '',
            emailReady: !!credentials.email,
            remember: credentials.hasEmail ? 'on' : '',
        });
    }

    handleChange(valueField, readyField) {
        return (value, ready) => {
            this.setState({
                [valueField]: value,
                [readyField]: ready,
            });
        }
    }

    handleRemember(event, checked) {
        this.setState({
            remember: checked ? 'on' : ''
        });
    }

    handleSubmit() {
        const { host, setCredentials, setErrors, setUser } = this.context;
        const { email, password, remember } = this.state;

        host.signIn(email, password)
            .then(() => setCredentials(host.credentials, remember.length > 0))
            .then(() => host.readUser())
            .then(user => {
                setErrors();
                setUser(user);
            })
            .catch((e) => {
                console.log(e)
                setErrors(['Email or password were not accepted'])
            });
    }

    render() {
        const { credentials, location, match, user } = this.context;
        const { classes } = this.props;
        const { email, emailReady, password, passwordReady, remember } = this.state;

        if (credentials.isAuthenticated && user && !user.isGuest) {
            const token = ((match || {}).params || {}).token;
            const target = (token
                ? `${Paths.recall}${token}`
                : (location && location.state && location.state.from
                    ? location.state.from
                    : {pathname: Paths.root}));
            return (
                <Redirect to={target} />
            );
        }

        let emailInFocus = !email || email.length <= 0;
        return (
            <div className={classes.root}>
                <JoinBlurb className={classes.blurb} />
                <LogoPaper
                    title={credentials.hasToken ? '' : 'Sign In'}
                    variant='h3'
                    waiting={credentials.hasToken}
                >

                    <EmailControl
                        email={email}
                        focus={emailInFocus}
                        quiet={true}
                        required={true}
                        onChange={this.handleChange('email', 'emailReady')}
                    />

                    <PasswordControl
                        focus={!emailInFocus}
                        password={password}
                        quiet={true}
                        required={true}
                        onChange={this.handleChange('password', 'passwordReady')}
                    />

                    <FormControlLabel
                        classes={{ root: classes.remember }}
                        control={<Checkbox
                            name="remember"
                            id="remember"
                            color="primary"
                            checked={!!remember}
                            onChange={this.handleRemember}
                            value={remember}
                        />}
                        label="Remember me"
                    />
                    <Button
                        className={classes.submit}
                        color="primary"
                        disabled={!emailReady || !passwordReady}
                        fullWidth
                        onClick={this.handleSubmit}
                        variant="contained"
                    >
                        Sign in
                    </Button>

                    <div className={classes.links}>
                        <div>
                            <Typography variant='caption'>
                                Forget your password? Click <Link
                                    className={classes.link}
                                    component={ResetLink}>here</Link> to reset it.
                            </Typography>
                        </div>
                    </div>

                </LogoPaper>
            </div>
        );
    }
}
SignIn.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(SignIn);
