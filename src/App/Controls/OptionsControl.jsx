import React from 'react'
import PropTypes from 'prop-types'
import { castArray, isEmpty, intersection, unionWith } from 'lodash';

import { Checkbox, FormControlLabel, Radio, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    root: {
    },
    button: {
        paddingTop: 0,
        paddingBottom: 0,
    },
    label: {
        fontSize: '1.3em',
    },
    option: {
        display: 'inline-block',
    },
    tooltip: {
        fontSize: '1.2em',
        [theme.breakpoints.down('xs')]: {
            fontSize: '1em',
        },
    },
});

class OptionsControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        name: PropTypes.string.isRequired,
        options: PropTypes.arrayOf(
            PropTypes.shape({
                description: PropTypes.string,
                disabled: PropTypes.bool,
                label: PropTypes.string.isRequired,
                value: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.arrayOf(PropTypes.string),
                ]).isRequired,
            }).isRequired
        ).isRequired,
        disabled: PropTypes.bool,
        singleton: PropTypes.bool,
        values: PropTypes.arrayOf(PropTypes.string),
        onChange: PropTypes.func
    }

    constructor(props) {
        super(props)

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event) {
        console.log(event)
        if (event && event.target) {
            const { name, onChange, options, singleton } = this.props;

            let target = event.target;
            const value = castArray(options.find(o => o.label == target.value).value);

            let values = (this.props.values || []).sort();
            if (target.checked) {
                values = (singleton
                    ? value
                    : unionWith(values, value));
            }
            else {
                values = values.filter(v => !value.includes(v));
            }

            if (onChange) {
                onChange({[name]: values});
            }
        }
    }

    render() {
        const { classes, disabled, name, options, singleton, values } = this.props;
        return options.map((option, i) => {
            const id = `${name}_${option.label}`
            const isChecked = intersection(values, castArray(option.value)).length > 0;

            const control = (<FormControlLabel
                classes={{ label: classes.label }}
                control={singleton ?
                    <Radio
                        checked={isChecked}
                        className={classes.button}
                        color='primary'
                        disabled={disabled || option.disabled}
                        id={id}
                        onChange={this.handleChange}
                        value={option.label}
                    /> :
                    <Checkbox
                        checked={isChecked}
                        className={classes.button}
                        disabled={disabled || option.disabled}
                        color='primary'
                        id={id}
                        onChange={this.handleChange}
                        value={option.label}
                    />
                }
                label={option.label}
            />);

            return (isEmpty(option.description)
                ? <div key={id}>{control}</div>
                : <Tooltip
                    classes={{tooltip: classes.tooltip}}
                    key={id}
                    placement='top-start'
                    title={option.description}>
                    {control}
                </Tooltip>);
        });
    }
}

export default withStyles(styles, { withTheme: true })(OptionsControl);
