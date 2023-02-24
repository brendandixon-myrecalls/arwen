import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

import { InputAdornment, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import Confirmation from './Confirmation';
import { validateEmail } from '../Utilities/Helpers';

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
});

const DEFAULT_MESSAGE = (<span>
This will be the email address you use to sign-in and at which you&apos;ll receive alerts.
</span>);
const INVALID_MESSAGE = (<span>
Not yet well-formed email-address&hellip;
</span>)
const REQUIRED_MESSAGE = (<span>
Enter the email you use to sign in
</span>)
const VALID_MESSAGE = (<span>
Looks good!
</span>)

class EmailControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        email: PropTypes.string,
        emailConfirmed: PropTypes.bool,
        focus: PropTypes.bool,
        quiet: PropTypes.bool,
        required: PropTypes.bool,
        showConfirmation: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        const { onChange } = this.props;
        const email = event.target.value;
        onChange(email, this.isReady(email));
    }

    isReady(email) {
        const { required } = this.props;
        return ((!required && email.length <= 0) ||
            ((required || email.length > 0) && validateEmail(email)));
    }

    render() {
        const { classes, email, emailConfirmed, focus, required, quiet, showConfirmation } = this.props;

        let help = null;
        let className = '';

        if (quiet) {
            if (required) {
                help = REQUIRED_MESSAGE;
            }
        }
        else {
            if (email.length <= 0) {
                help = DEFAULT_MESSAGE;
            }
            else if (this.isReady(email)) {
                help = VALID_MESSAGE;
                className = classes.valid;
            }
            else {
                help = INVALID_MESSAGE;
                className = classes.invalid;
            }
        }

        const inputProps = (!showConfirmation
            ? {}
            : {
                endAdornment: (<InputAdornment
                    classes={{ root: classes.confirmation}}
                    position='end'
                    >
                        <Confirmation confirmed={emailConfirmed} />
                </InputAdornment>)
            })

        return (
            <TextField
                autoFocus={focus}
                className={classes.confirmable}
                FormHelperTextProps={{ classes: { root: className } }}
                fullWidth
                helperText={isEmpty(help) ? null : help}
                id='email'
                InputProps={inputProps}
                label='Email Address'
                margin='normal'
                onChange={this.handleChange}
                required={required}
                value={email}
            />
        )
    }
}

export default withStyles(styles, { withTheme: true })(EmailControl);
