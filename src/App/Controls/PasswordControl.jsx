import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { InputAdornment, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import Confirmation from './Confirmation';
import { joinBy } from '../../Common/Core';

const styles = theme => ({
    root: {
    },
    confirmable: {
        position: 'relative',
    },
    confirmation: {
        position: 'absolute',
        right: 0,
    },
    invalid: {
        color: theme.palette.error.main,
    },
    valid: {
    },
    hide: {
        display: 'none',
    },
});

const DEFAULT_MESSAGE = (<span>
Eight or more characters including mixed-case letters, numbers, and others.
</span>)
const VALID_MESSAGE = (<span>
Looks good!
</span>)

const INVALID_CONFIRMATION = (<span>
The passwords do not yet match.
</span>)
const VALID_CONFIMRATION = (<span>
They match!
</span>)

const DIGIT_PATTERN = new RegExp(/.*[0-9].*/);
const LOWER_PATTERN = new RegExp(/.*[a-z].*/);
const OTHER_PATTERN = new RegExp(/.*[\(\)\[\]\{\}\\\/\.,\|\-_~\+=;:<>\?!@#\$%\^&\*].*/);
const UPPER_PATTERN = new RegExp(/.*[A-Z].*/);
const MINIMUM_PASSWORD_LENGTH = 8;

const validatePassword = (s) => {
    let missing = [];

    if (!s.match(LOWER_PATTERN)) {
        missing.push('a lower-case letter');
    }

    if (!s.match(UPPER_PATTERN)) {
        missing.push('an upper-case letter');
    }

    if (!s.match(DIGIT_PATTERN)) {
        missing.push('a digit');
    }

    if (!s.match(OTHER_PATTERN)) {
        missing.push('a special character');
    }

    if (missing.length <= 0 && s.length < MINIMUM_PASSWORD_LENGTH) {
        missing.push(`at least ${MINIMUM_PASSWORD_LENGTH} characters`);
    }

    return ({
        valid: missing.length <= 0,
        missing: missing,
    });
};

class PasswordControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        focus: PropTypes.bool,
        password: PropTypes.string,
        quiet: PropTypes.bool,
        required: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            missing: [],
            passwordConfirmation: '',
            valid: false,
        }

        this.handlePassword = this.handlePassword.bind(this);
        this.handlePasswordConfirmation = this.handlePasswordConfirmation.bind(this);
        this.isReady = this.isReady.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { password } = this.props;
        if (prevProps.password != password) {
            const o = validatePassword(password);
            this.setState({
                missing: o.missing,
                passwordConfirmation: '',
                valid: o.valid,
            });
        }
    }

    handlePassword(event) {
        const { onChange } = this.props;
        const { passwordConfirmation } = this.state;
        const password = event.target.value;
        onChange(password, this.isReady(password, passwordConfirmation));
    }

    handlePasswordConfirmation(event) {
        const { password, onChange } = this.props;
        const passwordConfirmation = event.target.value;
        this.setState({
            passwordConfirmation: passwordConfirmation
        });
        onChange(password, this.isReady(password, passwordConfirmation));
    }

    isReady(password, passwordConfirmation) {
        const { quiet, required } = this.props;
        if (!required && password.length <= 0) {
            return true;
        }
        if (password.length > 0 && quiet) {
            return true;
        }

        const o = validatePassword(password);
        return (o.valid && (quiet || password == passwordConfirmation));
    }

    render() {
        const { classes, focus, quiet, password, required } = this.props;
        const { missing, passwordConfirmation, valid } = this.state;

        let message = DEFAULT_MESSAGE;
        let passwordClasses = '';

        if (password.length > 0) {
            if (valid) {
                message = VALID_MESSAGE;
                passwordClasses = classes.valid;
            }
            else {
                message = (<span>
                The password still needs {joinBy(missing)}.
                </span>)
                passwordClasses = classes.invalid;
            }
        }

        const getConfirmation = !quiet && password.length > 0 && valid;
        const isReady = this.isReady(password, passwordConfirmation);
        const confirmationClasses = classNames(isReady || classes.invalid);
        const confirmationText = (!getConfirmation
                ? (<span>&nbsp;</span>)
                : (isReady
                    ? VALID_CONFIMRATION
                    : INVALID_CONFIRMATION));

        const inputProps = (!isReady
            ? {}
            : {
                endAdornment: (<InputAdornment
                    classes={{ root: classes.confirmation }}
                    position='end'
                >
                    <Confirmation confirmed={isReady} />
                </InputAdornment>)
            })

        return (<React.Fragment>
            <TextField
                autoFocus={focus && !getConfirmation}
                FormHelperTextProps={{ classes: { root: passwordClasses } }}
                fullWidth
                helperText={quiet ? null : message}
                id='password'
                label='Password'
                margin='normal'
                onChange={this.handlePassword}
                required={required}
                type='password'
                value={password}
            />
            {quiet
                ? null
                : (<TextField
                    autoFocus={focus && getConfirmation}
                    className={classes.confirmable}
                    disabled={!getConfirmation}
                    FormHelperTextProps={{ classes: { root: confirmationClasses } }}
                    fullWidth
                    helperText={confirmationText}
                    id='passwordConfirmation'
                    InputProps={inputProps}
                    label='Confirm Password'
                    margin='none'
                    onChange={this.handlePasswordConfirmation}
                    type='password'
                    value={passwordConfirmation}
                />)}
        </React.Fragment>);
    }
}

export default withStyles(styles, { withTheme: true })(PasswordControl);
