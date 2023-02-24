import React from 'react';
import PropTypes from 'prop-types';
import ReCAPTCHA from 'react-google-recaptcha';
import { isEmpty } from 'lodash';

import { Button, FormControl } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import ReCAPTCHAConfig from '../../../.aws/recaptcha.json';

import EmailControl from '../Controls/EmailControl';
import LocationContext from '../LocationContext';
import NameControl from '../Controls/NameControl';
import PasswordControl from '../Controls/PasswordControl';
// import PhoneControl from '../Controls/PhoneControl';
import u from '../../Common/User';

const styles = theme => ({
    actions: {
        textAlign: 'right',
    },
    actionButton: {
        marginRight: theme.spacing(2),
    },
    fieldSet: {
        display: 'block',
    },
    recaptcha: {
        margin: '1rem 0',
    },
});

class RegisterControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        onComplete: PropTypes.func.isRequired,
        onWait: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            recaptchaRef: null,
            recaptchaToken: '',

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

        this.mounted = false;

        this.canSave = this.canSave.bind(this);

        this.handleReady = this.handleReady.bind(this);
        this.handleReCAPTCHA = this.handleReCAPTCHA.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }

    componentDidMount() {
        this.mounted = true;
        this.setState({
            recaptchaRef: React.createRef()
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    canSave() {
        const { emailReady, nameReady, passwordReady, phone, phoneReady, recaptchaToken } = this.state;
        return emailReady && nameReady && passwordReady && (isEmpty(phone) || phoneReady) && !isEmpty(recaptchaToken);
    }

    handleReady(valueField, readyField) {
        return (value, ready) => {
            this.setState({
                [valueField]: value,
                [readyField]: ready,
            });
        }
    }

    handleReCAPTCHA(token) {
        const { recaptchaRef } = this.state;

        this.setState({
            recaptchaToken: token,
        });

        if (isEmpty(token)) {
            recaptchaRef.current.reset();
        }
    }

    handleSave()  {
        const { evaluateError, host, setCredentials, setUser } = this.context;
        const { onComplete, onWait } = this.props;
        const { email, name, phone, password, recaptchaToken } = this.state;

        let user = u.create({
            firstName: name.firstName,
            lastName: name.lastName,
            email: email,
            phone: phone,
        });
        user.password = password;

        onWait(true);
        return host.createUser(user, { recaptcha: recaptchaToken })
            .then(user => {
                setUser(user);
                return host.signIn(email, password)
                    .then(() => setCredentials(host.credentials, true));
            })
            .then(() => {
                onComplete();
            })
            .catch(e => {
                evaluateError(e);
                this.handleReCAPTCHA();
                onWait(false);
            });
    }

    render() {
        const { classes } = this.props;
        const { email, name, password, recaptchaRef } = this.state;

        const recaptchaKey = ReCAPTCHAConfig[process.env.BUILD_MODE].siteKey;

        /*
          Disable Text Alerts
                    <PhoneControl
                        phone={phone}
                        required={false}
                        onChange={this.handleReady('phone', 'phoneReady')}
                    />
        */

        return (
            <React.Fragment>
                <FormControl className={classes.fieldSet} component='fieldset'>
                    <NameControl
                        name={name}
                        required={true}
                        onChange={this.handleReady('name', 'nameReady')}
                    />
                    <EmailControl
                        email={email}
                        required={true}
                        onChange={this.handleReady('email', 'emailReady')}
                    />
                    <PasswordControl
                        password={password}
                        required={true}
                        onChange={this.handleReady('password', 'passwordReady')}
                    />

                    <div className={classes.recaptcha}>
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={recaptchaKey}
                            onErrored={this.handleReCAPTCHA}
                            onExpired={this.handleReCAPTCHA}
                            onChange={this.handleReCAPTCHA}
                        />
                    </div>

                    <div
                        className={classes.actions}
                    >
                        <Button
                            className={classes.actionButton}
                            color='primary'
                            disabled={!this.canSave()}
                            variant='contained'
                            onClick={this.handleSave}
                        >Register</Button>
                    </div>
                </FormControl>
            </React.Fragment>
        );
    }
}
RegisterControl.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(RegisterControl);
