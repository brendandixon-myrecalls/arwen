import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { InputAdornment, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import Confirmation from './Confirmation';
import PhoneInput from './PhoneInput';
import { validatePhone } from '../Utilities/Helpers';

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
    A phone number is necessary only if you want text message alerts.
</span>);
const INVALID_MESSAGE = (<span>
    Not yet a valid phone number&hellip;
</span>)
const VALID_MESSAGE = (<span>
    Looks good!
</span>)

class PhoneControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        focus: PropTypes.bool,
        phone: PropTypes.string,
        phoneConfirmed: PropTypes.bool,
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
        const phone = event.target.value;
        onChange(phone, this.isReady(phone));
    }

    isReady(phone) {
        const { required } = this.props;

        if ((phone || '').length <= 0) {
            return !required;
        }

        return validatePhone(phone);
    }

    render() {
        const { classes, focus, phone, phoneConfirmed, required, showConfirmation } = this.props;

        let message = DEFAULT_MESSAGE;
        let className = '';

        if (phone && phone.length > 0) {
            if (validatePhone(phone)) {
                message = VALID_MESSAGE;
                className = classes.valid;
            }
            else {
                message = INVALID_MESSAGE;
                className = classes.invalid;
            }
        }


        let inputProps = {
            inputComponent: PhoneInput
        };
        if (showConfirmation) {
            inputProps['endAdornment'] = (<InputAdornment
                classes={{ root: classes.confirmation }}
                position='end'
            >
                <Confirmation confirmed={phoneConfirmed} />
            </InputAdornment>);
        }

        return (
            <TextField
                autoFocus={focus}
                className={classes.confirmable}
                FormHelperTextProps={{ classes: { root: className }}}
                fullWidth
                helperText={message}
                id='phone'
                InputProps={inputProps}
                label='Phone Number'
                margin='normal'
                onChange={this.handleChange}
                required={required}
                value={phone}
            />
        )
    }
}

export default withStyles(styles, { withTheme: true })(PhoneControl);
