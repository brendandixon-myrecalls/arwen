import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Link, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import AddSubscriptionBlurb from '../Controls/AddSubscriptionBlurb';
import { Icons } from '../Routing/Paths';
import LocationContext from '../LocationContext';
import { SettingsLink } from '../Routing/Links';
import Qualifications from '../Controls/Qualifications';

const styles = theme => ({
    fauxLink: {
        color: theme.palette.primary.main
    },
    filter: {
        height: '1.3em',
        width: '1.3em',
    },
    link: {
        cursor: 'hand',
    },
    nhtsaImage: {
        display: 'block',
        margin: '0 auto',
        width: '50%',
    },
    page: {
        textAlign: 'center',
    },
    qualifications: {
        color: theme.palette.text.primary,
        fontSize: '1rem',
        marginLeft: '0',
        padding: '0',
        textAlign: 'left',
        width: '100%',
    },
    hide: {
        display: 'none',
    },
});

class VehiclesPage extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
    }

    render() {
        const { user } = this.context;
        const { className, classes, onClose } = this.props;

        return (
            <div className={classNames(classes.page, className)}>
                <p>
                    A Vehicles Subscription gives you access to, and alerts of,
                    recalls issued by
                    the <Link href='https://www.nhtsa.gov'>NHTSA</Link> for
                    your vehicles.
                </p>
                <AddSubscriptionBlurb
                    className={classNames(!user.hasVehicleSubscription || classes.hide)}
                    isNotice={true}
                    type='vehicles'
                />
                <p>
                    Use the <Link
                        component={SettingsLink}
                        className={classes.link}
                        onClick={onClose}
                    >Settings</Link> option, under the
                    upper&ndash;left <span className={classes.fauxLink}>Account <i className={Icons.account}></i></span> menu,
                    to configure the alerts you&apos;ll receive.
                </p>
                <Typography variant='h5'>
                    Finding Your VIN
                </Typography>
                <p>
                    All vehicles sold in the U.S. have
                    a &ldquo;Vehicle Identification Number&rdquo; &mdash; called a &ldquo;VIN&rdquo; &mdash; registered with
                    the <Link href='https://www.nhtsa.gov'>NHTSA</Link>.
                </p>
                <p>
                    Your vehicle&apos;s VIN is commonly located beneath the lower&ndash;left
                    of the windshield and on the left&ndash;hand door frame, as shown
                     below: <img
                                className={classes.nhtsaImage}
                                src='https://www.nhtsa.gov/sites/nhtsa.dot.gov/files/nhtsa-vin-small-744x698.jpg' />
                </p>
                <p>
                    You may also find it on your vehicle&apos;s registration or insurance card.
                </p>
                <Qualifications className={classes.qualifications} />
            </div>
        );
    }
}
VehiclesPage.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(VehiclesPage);
