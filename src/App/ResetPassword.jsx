import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import ReCAPTCHA from 'react-google-recaptcha';
import { isEmpty } from 'lodash';

import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';

import ReCAPTCHAConfig from '../../.aws/recaptcha.json';

import EmailControl from './Controls/EmailControl';
import LocationContext from './LocationContext';
import LogoPaper from './Layout/LogoPaper';
import { Paths } from './Routing/Paths';
import { SigninLink } from './Routing/Links';

const styles = theme => ({
    link: {
        cursor: 'hand',
    },
    links: {
        marginTop: theme.spacing(2),
    },
    recaptcha: {
        marginTop: '1rem',
    },
    reset: {
        marginTop: theme.spacing(3),
    },
});

class ResetPassword extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        path: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            email: '',
            emailReady: false,

            recaptchaRef: null,
            recaptchaToken: '',

            redirect: null,
            saving: false,
        }

        this.canReset = this.canReset.bind(this);

        this.handleEmail = this.handleEmail.bind(this);
        this.handleReCAPTCHA = this.handleReCAPTCHA.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    componentDidMount() {
        this.setState({
            recaptchaRef: React.createRef(),
        });
    }

    canReset() {
        const { emailReady, recaptchaToken } = this.state;
        return emailReady && !isEmpty(recaptchaToken);
    }

    handleEmail(value, ready) {
        this.setState({
           email: value,
           emailReady: ready,
        });
    }

    handleReCAPTCHA(token) {
        this.setState({
            recaptchaToken: token,
        });
    }

    handleReset() {
        const { host, setErrors, setMessages } = this.context;
        const { email, recaptchaRef, recaptchaToken } = this.state;

        host.resetUserPassword(email, { recaptcha: recaptchaToken })
            .then(() => {
                setMessages(['Your password has been reset. You should soon receive an email with a link by which you may create a new password.'])
                this.setState({
                    redirect: Paths.signin,
                });
            })
            .catch((e) => {
                setErrors(['Email was not recognized']);
                if (recaptchaRef) {
                    recaptchaRef.current.reset();
                }
            })
            .then(() => {
                this.setState({
                    saving: false,
                });
            });
    }

    render() {
        const { classes } = this.props;
        const { email, recaptchaRef, redirect, saving } = this.state;

        const recaptchaKey = ReCAPTCHAConfig[process.env.BUILD_MODE].siteKey;

        if (redirect) {
            return (
                <Redirect to={Paths.signin} />
            );
        }

        return (
            <LogoPaper
                title='Reset Your Password'
                variant='h4'
                waiting={saving}
            >
                <EmailControl
                    email={email}
                    focus={true}
                    quiet={true}
                    required={true}
                    onChange={this.handleEmail}
                />

                <div className={classes.recaptcha}>
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={recaptchaKey}
                        onChange={this.handleReCAPTCHA}
                    />
                </div>

                <Button
                    className={classes.reset}
                    color="primary"
                    disabled={!this.canReset()}
                    fullWidth
                    onClick={this.handleReset}
                    variant="contained"
                >
                    Reset Password
                </Button>

                <div className={classes.links}>
                    <Typography variant='caption'>
                        Know your password? Click <Link
                            component={SigninLink}
                            className={classes.link} >here</Link> to sign in.
                    </Typography>
                </div>

            </LogoPaper>
        );
    }
}
ResetPassword.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(ResetPassword);
