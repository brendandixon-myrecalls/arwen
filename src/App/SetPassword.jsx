import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/styles';

import EmailControl from './Controls/EmailControl';
import LocationContext from './LocationContext';
import LogoPaper from './Layout/LogoPaper';
import { paramsFromQuery } from '../Common/Core';
import PasswordControl from './Controls/PasswordControl';
import { Paths } from './Routing/Paths';

const styles = theme => ({
    root: {
    },
    submit: {
        marginTop: theme.spacing(3),
    },
    hide: {
        display: 'none',
    },
});

class SetPassword extends React.Component {
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

            params: {},
            redirectNeeded: false,
            saving: false,
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        const { location, setErrors } = this.context;

        const params = paramsFromQuery(location.search);
        this.setState({
            params: params
        });

        if (!params.token) {
            setErrors(['No password reset token was provided. Please try again to reset your password.']);
            this.setState({
                redirectNeeded: true
            });
        }
    }

    handleChange(valueField, readyField) {
        return (value, ready) => {
            this.setState({
                [valueField]: value,
                [readyField]: ready,
            });
        };
    }

    handleSubmit() {
        const { host, setErrors, setMessages } = this.context;
        const { email, params, password } = this.state;

        this.setState({
            saving: true
        });

        host.updateUserPassword(email, password, params.token)
            .then(() => setMessages(['Your password was successfully reset. Please sign-in using your new password.']))
            .catch((e) => setErrors(['The password reset token has expired. Please try again to reset your password.']))
            .then(() => this.setState({
                redirectNeeded: true,
                saving: false,
            }));
    }

    canSave() {
        const { emailReady, passwordReady } = this.state;
        return emailReady && passwordReady;
    }

    render() {
        const { classes } = this.props;
        const { email, password, redirectNeeded, saving } = this.state;

        if (redirectNeeded) {
            return (
                <Redirect to={Paths.signin} />
            );
        }

        let emailInFocus = !email || email.length <= 0;
        return (
            <LogoPaper
                title='Set Your Password'
                variant='h4'
                waiting={saving}
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
                    required={true}
                    onChange={this.handleChange('password', 'passwordReady')}
                />

                <Button
                    className={classes.submit}
                    color="primary"
                    disabled={!this.canSave()}
                    fullWidth
                    onClick={this.handleSubmit}
                    variant="contained"
                >
                    Reset Password
                </Button>
            </LogoPaper>
        );
    }
}
SetPassword.contextType = LocationContext;

export default withStyles(styles)(SetPassword);
