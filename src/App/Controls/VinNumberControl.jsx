import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

import { FormControl, FormHelperText, Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import VinDigit from './VinDigit';
import { isVinValid, VIN_LENGTH } from '../../Common/Vin';

const styles = theme => ({
    root: {
    },
    disabled: {
        backgroundColor: 'transparent',
    },
    enabled: {
        padding: `${theme.spacing(1)}`,
        [theme.breakpoints.down('xs')]: {
            padding: `${theme.spacing(1)} ${theme.spacing(1)*0.5}`,
        },
    },
    invalid: {
        color: theme.palette.error.main,
    },
    valid: {
    },
    vin: {
        whiteSpace: 'nowrap',
    },
    hide: {
        display: 'none',
    },
});

const DEFAULT_MESSAGE = (<span>
    A combination of seventeen letters (except I, O, or Q) and numbers.
</span>)
const VALID_MESSAGE = (<span>
    Looks good!
</span>)

class VinNumberControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        disabled: PropTypes.bool,
        focus: PropTypes.bool,
        vinNumber: PropTypes.string,
        onChange: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        const digits = this.vinNumberToDigits(props.vinNumber);
        this.state = {
            digits: digits,
            position: Math.min(props.vinNumber.length, VIN_LENGTH-1),
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        this.setDigit = this.setDigit.bind(this);
        this.setPosition = this.setPosition.bind(this);

        this.digitsToVinNumber = this.digitsToVinNumber.bind(this);
        this.vinNumberToDigits = this.vinNumberToDigits.bind(this);
    }

    handleChange(position, digit) {
        this.setDigit(digit, position);
        this.setPosition(position+1);
    }

    handleFocus(position) {
        this.setPosition(position);
    }

    handleKeyDown(position, keyCode) {
        switch(keyCode) {
            // Backspace
            case 8:
                this.setDigit('', position);
                this.setPosition(position - 1);
                break;
            // Left arrow
            case 37:
                this.setPosition(position - 1);
                break;
            // Right arrow
            case 39:
                this.setPosition(position + 1);
                break;
            // Delete
            case 46:
                this.setDigit('', position);
                break;
        }

        return [8, 37, 39, 46].includes(keyCode);
    }

    digitsToVinNumber(digits) {
        return digits.map(d => isEmpty(d) ? ' ' : d).join('').trimEnd();
    }

    setDigit(digit, position) {
        const { onChange } = this.props;
        const { digits } = this.state;

        const updatedDigits = [...digits.slice(0, position), digit, ...digits.slice(position + 1)];
        this.setState({
            digits: updatedDigits,
        });

        onChange(this.digitsToVinNumber(updatedDigits));
    }

    setPosition(newPosition) {
        const { position } = this.state;

        newPosition = Math.max(0, newPosition);
        newPosition = Math.min(newPosition, VIN_LENGTH-1);

        if (newPosition != position) {
            this.setState((state) => {
                const vinNumber = this.digitsToVinNumber(state.digits);
                return ({
                    position: newPosition <= vinNumber.length ? newPosition : state.position
                });
            })
        }
    }

    vinNumberToDigits(vinNumber) {
        let digits = [...(vinNumber || '')].map(d => d == ' ' ? '' : d);
        while (digits.length < VIN_LENGTH) { digits.push('') }
        return digits;
    }

    render() {
        const { classes, disabled, focus } = this.props;
        const { digits, position } = this.state;
        const vinNumber = digits.join('');
        const valid = isVinValid(vinNumber);

        let helperText = null;

        if (!disabled) {
            let message = DEFAULT_MESSAGE;
            let className = classes.invalid;

            if (vinNumber.length > 0 && valid) {
                message = VALID_MESSAGE;
                className = classes.valid;
            }

            helperText = <FormHelperText classes={{ root: className }}>{message}</FormHelperText>;
        }

        let setFocus = focus;
        let wasEmpty = false;
        return (
            <Paper
                classes={{ root: classNames(classes.root, disabled ? classes.disabled : classes.enabled)}}
                elevation={disabled ? 0 : 1}
            >
                <FormControl margin='none' fullWidth>
                    <div className={classes.vin}>
                        {digits.map((digit, i) => {
                            const empty = isEmpty(digit);
                            const focusOnDigit = setFocus && i == position;
                            const enabled = !disabled && (focusOnDigit || !empty || !wasEmpty);

                            setFocus = setFocus && !focusOnDigit;
                            wasEmpty = wasEmpty || empty;

                            return (
                                <VinDigit
                                    digit={digit}
                                    disabled={!enabled}
                                    focus={focusOnDigit}
                                    key={`vin-digit-${i}`}
                                    onChange={this.handleChange}
                                    onFocus={this.handleFocus}
                                    onKeyDown={this.handleKeyDown}
                                    position={i}
                                />
                            );
                        })}
                    </div>
                    {helperText}
                </FormControl>
            </Paper>
        )
    }
}

export default withStyles(styles, { withTheme: true })(VinNumberControl);
