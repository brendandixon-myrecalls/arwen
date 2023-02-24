import React from 'react';
import PropTypes from 'prop-types';
import { castArray, flatten } from 'lodash';

import { FormControl, FormHelperText, FormLabel, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import { joinBy } from '../../Common/Core';
import OptionsControl from './OptionsControl';
import { mapStatesToRegions, REGIONS } from '../../Common/Constants';
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
Select the region containing your state or that you want to monitor.
Your selections will limit the email and text messages you receive.
</span>);

class RegionControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        disabled: PropTypes.bool,
        distribution: PropTypes.arrayOf(PropTypes.string),
        required: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(values) {
        const { onChange } = this.props;

        const distribution = flatten(values['region'].map(value => {
            return REGIONS.find(region => region.label == value).value
        }));

        onChange(distribution, this.isReady(distribution));
    }

    isReady(distribution) {
        const { required } = this.props;
        return (!required || distribution.length > 0);
    }

    render() {
        const { classes, disabled, distribution, required } = this.props;

        const options = REGIONS.map(region => ({
            label: region.label,
            value: region.label,
            description: `Covers ${joinBy(region.value)}`,
        }));
        const values = mapStatesToRegions(castArray(distribution || ''));

        return (
            <div>
                <FormControl
                    component='fieldset'
                    margin='normal'
                >
                    <Typography variant='h6'>
                        Select Region
                        {(required
                            ? (<Required satisfied={this.isReady(distribution)} />)
                            : null)}
                    </Typography>
                    <FormHelperText className={classes.helper}>
                        {DEFAULT_MESSAGE}
                    </FormHelperText>
                    <OptionsControl
                        disabled={disabled}
                        name='region'
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

export default withStyles(styles, { withTheme: true })(RegionControl);
