import React from 'react';
import PropTypes from 'prop-types';

import MaskedInput, { conformToMask } from 'react-text-mask';

const USPhoneMask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

class PhoneInput extends React.Component {
    static propTypes = {
        inputRef: PropTypes.func.isRequired,
    }

    render() {
        const { inputRef, value, ...other } = this.props;

        return (
            <MaskedInput
                {...other}
                mask={USPhoneMask}
                ref={ref => {
                    inputRef(ref ? ref.inputElement : null);
                }}
                value={conformToMask(value, USPhoneMask).conformedValue}
            />
        );
    }
}

export default PhoneInput;
export const ConformPhone = (s) => conformToMask(s, USPhoneMask).conformedValue;
