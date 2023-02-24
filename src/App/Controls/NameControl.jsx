import React from 'react';
import PropTypes from 'prop-types';

import { FormControl, FormHelperText, Input, InputLabel, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    root: {
    },
});

const DEFAULT_MESSAGE = (<span>
We need at least your first name.
</span>);

class NameControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        name: PropTypes.shape({
            firstName: PropTypes.string,
            lastName: PropTypes.string
        }),
        focus: PropTypes.bool,
        required: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleFirstName = this.handleFirstName.bind(this);
        this.handleLastName = this.handleLastName.bind(this);
    }

    handleChange(firstName, lastName) {
        const { required, onChange } = this.props;
        onChange({
            firstName: firstName,
            lastName: lastName,
        }, !required || firstName.length > 0);
    }

    handleFirstName(event) {
        const { name } = this.props;
        const firstName = event.target.value;
        this.handleChange(firstName, (name || {}).lastName || '');
    }

    handleLastName(event) {
        const { name } = this.props;
        const lastName = event.target.value;
        this.handleChange((name || {}).firstName || '', lastName);
    }

    render() {
        const { focus, name, required } = this.props;
        const { firstName, lastName } = (name || {});

        let message = (!required || firstName.length > 0
            ? ''
            : DEFAULT_MESSAGE);

        return (
            <React.Fragment>
                <TextField
                    autoFocus={focus && firstName.length <= 0}
                    fullWidth
                    helperText={message}
                    id="firstName"
                    label='First Name'
                    margin='normal'
                    required={required}
                    onChange={this.handleFirstName}
                    value={firstName || ''}
                />
                <TextField
                    autoFocus={focus && firstName.length > 0}
                    fullWidth
                    id="lastName"
                    label='Last Name'
                    margin='normal'
                    required={required}
                    onChange={this.handleLastName}
                    value={lastName || ''}
                />
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(NameControl);
