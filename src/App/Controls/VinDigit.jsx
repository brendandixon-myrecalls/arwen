import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import { validDigit } from '../../Common/Vin';

const styles = theme => ({
    root: {
    },
    disabled: {
        color: theme.getCategoryPalette('vehicles').text,
        fontWeight: 400,
    },
    input: {
        fontSize: '2rem',
        padding: '1rem',
        height: '1.5rem',
        width: '1.5rem',
        [theme.breakpoints.down('xs')]: {
            fontSize: '1.25rem',
            padding: '0.5rem',
            height: '1.25rem',
            width: '1.2rem',
        },
        textAlign: 'center',
    },
});

class VinDigit extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        digit: PropTypes.string,
        disabled: PropTypes.bool,
        focus: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        onFocus: PropTypes.func.isRequired,
        onKeyDown: PropTypes.func.isRequired,
        position: PropTypes.number.isRequired,
    }

    constructor(props) {
        super(props);

        this._hasFocus = false;
        this._mounted = false;
        this._ref = React.createRef();
        this._tookFocus = false;

        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handlKeyDown = this.handleKeyDown.bind(this);
        this.setFocus = this.setFocus.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { focus } = this.props;
        if (this._mounted && prevProps.focus != focus && focus) {
            this.setFocus();
        }
    }

    componentDidMount() {
        this._mounted = true;
        this.setFocus();
    }

    handleChange(event) {
        const { onChange, position } = this.props;
        const digit = (event.target.value || '').toUpperCase();
        if (validDigit(digit)) {
            onChange(position, digit);
        }
    }

    handleFocus(hasFocus) {
        const { onFocus, position } = this.props;
        this._hasFocus = hasFocus;
        if (hasFocus) {
            onFocus(position);
        }
    }

    handleKeyDown(event) {
        const { onKeyDown, position } = this.props;
        if (onKeyDown(position, event.keyCode)) {
            event.preventDefault();
        }
    }

    setFocus() {
        const { disabled, focus } = this.props;
        if (this._mounted && this._ref && !disabled && focus && !this._hasFocus) {
            this._ref.current.focus();
            this._ref.current.scrollIntoView();
        }
    }

    render() {
        const { classes, disabled, digit, focus, position } = this.props;
        return (
            <TextField
                autoFocus={!disabled && focus}
                classes={{ root: classes.root }}
                id={`vin-${position}`}
                inputProps={{ maxLength: 1, minLength: 1, size: 1 }}
                InputProps={{ classes: { input: classNames(classes.input, disabled ? classes.disabled : null) }, readOnly: disabled }}
                inputRef={this._ref}
                margin='none'
                name={`vin-${position}`}
                onBlur={event => this.handleFocus(false)}
                onChange={this.handleChange}
                onFocus={event => this.handleFocus(true)}
                onKeyDown={this.handlKeyDown}
                type='text'
                value={digit}
                variant='outlined'
            />
        );
    }
}

export default withStyles(styles, { withTheme: true })(VinDigit);
