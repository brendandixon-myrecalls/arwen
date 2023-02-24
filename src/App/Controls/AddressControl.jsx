import React from 'react';
import PropTypes from 'prop-types';
import { clone, isEmpty } from 'lodash';

import { FormControl, Select, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import { STATES } from '../../Common/Constants';

const ZIP_PATTERN = /\d{5}/

const styles = theme => ({
    root: {
    },
    city: {
        marginRight: '5%',
        width: '50%',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    state: {
        marginRight: '5%',
        width: '15%',
    },
    zip: {
        width: '25%',
    },
});

class AddressControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        address: PropTypes.shape({
            line1: PropTypes.string,
            line2: PropTypes.string,
            city: PropTypes.string,
            state: PropTypes.string,
            zip: PropTypes.string,
        }),
        focus: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.isValid = this.isValid.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    isValid(address) {
        if (isEmpty(address.line1)) {
            return false;
        }
        if (isEmpty(address.city)) {
            return false;
        }
        if (isEmpty(address.state)) {
            return false;
        }
        if (isEmpty(address.zip) || !ZIP_PATTERN.test(address.zip)) {
            return false;
        }
        return true;
    }

    handleChange(field, value) {
        const { address, onChange } = this.props;
        address[field] = value;
        onChange(address, this.isValid(address));
    }

    render() {
        const { address, classes, focus } = this.props;

        const stateOptions = STATES.map(s => (<option key={s.value} value={s.value}>{s.value}</option>));
        const focusField = (isEmpty(address.line1)
            ? 'line1'
            : (isEmpty(address.city)
                ? 'city'
                : 'zip'));

        return (
            <FormControl component='fieldset'>
                <div className={classes.container}>
                    <TextField
                        autoFocus={focus && focusField == 'line1'}
                        fullWidth
                        id="line1"
                        label='Street Address'
                        required={true}
                        onChange={(event) => this.handleChange('line1', event.target.value)}
                        value={address.line1 || ''}
                    />
                    <TextField
                        fullWidth
                        id="line2"
                        label='Apartment, Suite Number'
                        required={false}
                        onChange={(event) => this.handleChange('line2', event.target.value)}
                        value={address.line2 || ''}
                    />
                    <TextField
                        autoFocus={focus && focusField == 'city'}
                        className={classes.city}
                        id="city"
                        label='City'
                        required={true}
                        onChange={(event) => this.handleChange('city', event.target.value)}
                        value={address.city || ''}
                    />
                    <Select
                        autoWidth={true}
                        className={classes.state}
                        id='state'
                        label='State'
                        native={true}
                        required={true}
                        onChange={(event) => this.handleChange('state', event.target.value)}
                        value={address.state || ''}
                    >
                        <option value=''></option>
                        {stateOptions}
                    </Select>
                    <TextField
                        autoFocus={focus && focusField == 'zip'}
                        className={classes.zip}
                        id="zip"
                        label='Zipcode'
                        required={true}
                        onChange={(event) => this.handleChange('zip', event.target.value)}
                        value={address.zip || ''}
                    />
                </div>
            </FormControl>
        )
    }
}

export default withStyles(styles, { withTheme: true })(AddressControl);
