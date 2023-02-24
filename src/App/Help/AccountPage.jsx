import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Link, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import { Icons } from '../Routing/Paths';
import LocationContext from '../LocationContext';
import { AccountLink, SettingsLink, SubscriptionsLink } from '../Routing/Links';

const styles = theme => ({
    fauxLink: {
        color: theme.palette.primary.main
    },
    link: {
        cursor: 'hand',
    },
    page: {
        textAlign: 'center',
    },
    hide: {
        display: 'none',
    },
});

class AccountPage extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
    }

    render() {
        const { className, classes, onClose } = this.props;

        return (
            <div className={classNames(classes.page, className)}>
                <p>
                    You manage all aspects of your account through the 
                    options listed under
                    the
                    upper&ndash;left <span className={classes.fauxLink}>Account <i className={Icons.account}></i></span> menu.
                </p>
                <Typography variant='h5'>
                    Updating Your Account
                </Typography>
                <p>
                    From the <Link
                        component={AccountLink}
                        className={classes.link}
                        onClick={onClose}
                    >Account</Link> option
                    you can update your email address, password, and see your active subscriptions.
                </p>
                <Typography variant='h5'>
                    Adjust Your Settings
                </Typography>
                <p>
                    The <Link
                        component={SettingsLink}
                        className={classes.link}
                        onClick={onClose}
                    >Settings</Link> option lets you adjust
                    the recalls for which you&apos;ll receive email alerts.
                </p>
                <Typography variant='h5'>
                    Managing Your Subscriptions
                </Typography>
                <p>
                    Also, from the <Link
                        component={AccountLink}
                        className={classes.link}
                        onClick={onClose}
                    >Account</Link> option, by clicking on <Link
                        component={SubscriptionsLink}
                        className={classes.link}
                        onClick={onClose}
                    >Manage Subscriptions</Link>, you can add and cancel your subscription(s).
                </p>
            </div>
        );
    }
}
AccountPage.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(AccountPage);
