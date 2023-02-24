import React from 'react';
import PropTypes from 'prop-types';
import { compact, castArray, flatten, intersection } from 'lodash';

import { FormControl, FormHelperText, FormLabel, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import { CATEGORY_BUNDLES } from '../../Common/Constants';
import OptionsControl from './OptionsControl';
import Required from './Required';

const styles = theme => ({
    root: {
    },
    helper: {
        marginBottom: theme.spacing(1),
    },
    invalid: {
        color: theme.palette.error.main,
    },
    valid: {
    },
});

const DEFAULT_MESSAGE = (<span>
Select categories whose recalls you find valuable.
Your selections will limit the email and text messages you receive.
</span>);

class CategoryControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        categories: PropTypes.arrayOf(PropTypes.string),
        disabled: PropTypes.bool,
        required: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(values) {
        const { onChange } = this.props;

        const categories = flatten(values['categories'].map(value => {
            return CATEGORY_BUNDLES.find(category => category.label == value).value
        }));

        onChange(categories, this.isReady(categories));
    }

    isReady(categories) {
        const { required } = this.props;
        return (!required || categories.length > 0);
    }

    render() {
        const { classes, categories, disabled, required } = this.props;

        const options = CATEGORY_BUNDLES.map(category => ({
            label: category.label,
            value: category.label,
            description: category.description,
        }));

        const c = castArray(categories || '');
        const values = compact(CATEGORY_BUNDLES.map(category => (
            intersection(c, category.value).length == category.value.length
                ? category.label
                : null)));

        return (
            <div>
                <FormControl
                    component='fieldset'
                    margin='normal'
                >
                    <Typography variant='h6'>
                        Select Interests
                        {(required
                            ? (<Required satisfied={this.isReady(categories)} />)
                            : null)}
                    </Typography>
                    <FormHelperText className={classes.helper}>
                        {DEFAULT_MESSAGE}
                    </FormHelperText>
                    <OptionsControl
                        disabled={disabled}
                        name='categories'
                        options={options}
                        singleton={false}
                        values={values}
                        onChange={this.handleChange}
                    />
                </FormControl>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(CategoryControl);
