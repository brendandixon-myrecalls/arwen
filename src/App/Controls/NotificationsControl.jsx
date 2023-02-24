import React from 'react';
import PropTypes from 'prop-types';
import { clone, concat, compact, map } from 'lodash';

import { FormControl, FormHelperText, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import LocationContext from '../LocationContext';
import OptionsControl from './OptionsControl';

const styles = theme => ({
    root: {
    },
    attention: {
        backgroundColor: theme.palette.primary.main,
        borderRadius: '4px',
        color: theme.palette.primary.contrastText,
        display: 'block',
        fontSize: '1.8rem',
        fontWeight: 400,
        margin: theme.spacing(1),
        padding: theme.spacing(1),
        textAlign: 'center'
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

const RECALL_OPTIONS = [
    {
        label: 'Recall Email Alerts',
        value: 'alertByEmail',
        description: 'Sent for matching recalls with a possible or probable health risk',
    },
    {
        label: 'Recall Weekly Summary',
        value: 'sendSummaries',
        description: 'A summary of all recalls in the last week',
    },
];

const RECALL_PHONE_OPTIONS = [
    {
        label: 'Recall Text Message Alerts',
        value: 'alertByPhone',
        description: 'Sent for matching recalls with a probable health risk',
    },
]

const VEHICLE_OPTIONS = [
    {
        label: 'Vehicle Recall Email Alerts',
        value: 'alertForVins',
        description: 'Sent for recalls matching one or more of your vehicles',
    },
    {
        label: 'Vehicle Recall Monthly Summary',
        value: 'sendVinSummaries',
        description: 'A summary of new in the last month matching vehicle recalls',
    },
]

const DEFAULT_MESSAGE = (<span>
Choose the notifications you&apos;d like to receive for recalls matching your criteria.
</span>)

class NotificationsControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        alertByEmail: PropTypes.bool,
        alertByPhone: PropTypes.bool,
        alertForVins: PropTypes.bool,
        sendSummaries: PropTypes.bool,
        sendVinSummaries: PropTypes.bool,
        required: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(values) {
        const { onChange } = this.props;
        values = values['notifications'];
        let alerts = {
            alertByEmail: values.includes('alertByEmail'),
            alertByPhone: values.includes('alertByPhone'),
            sendSummaries: values.includes('sendSummaries'),
            alertForVins: values.includes('alertForVins'),
            sendVinSummaries: values.includes('sendVinSummaries'),
        }
        onChange(alerts);
    }

    render() {
        const { user } = this.context;
        const { classes, alertByEmail, alertByPhone, sendSummaries, alertForVins, sendVinSummaries } = this.props;

        const recallOptions = map(RECALL_OPTIONS, o => {
            o = clone(o);
            o.disabled = !user.hasRecallSubscription;
            return o;
        });
        const vehicleOptions = map(VEHICLE_OPTIONS, o => {
            o = clone(o);
            o.disabled = !user.hasVehicleSubscription;
            return o;
        });
        const options = concat(recallOptions, vehicleOptions);

        const values = compact([
            alertByEmail ? 'alertByEmail' : null,
            alertByPhone ? 'alertByPhone' : null,
            sendSummaries ? 'sendSummaries' : null,
            alertForVins ? 'alertForVins' : null,
            sendVinSummaries ? 'sendVinSummaries' : null,
        ]);

        return (
            <div>
                <FormControl
                    component='fieldset'
                    margin='normal'
                >
                    <Typography variant='h6'>Select Alerts</Typography>
                    <FormHelperText className={classes.helper}>
                        {DEFAULT_MESSAGE}
                    </FormHelperText>
                    <OptionsControl
                        name='notifications'
                        options={options}
                        singleton={false}
                        values={values}
                        onChange={this.handleChange}
                    />
                </FormControl>
                <div className={classes.attention}>
                    Ensure that &apos;alerts@myrecalls.today&apos; is in your
                    your email contacts
                </div>
            </div>
        );
    }
}
NotificationsControl.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(NotificationsControl);
