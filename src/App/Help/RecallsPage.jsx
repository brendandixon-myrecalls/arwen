import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Fab, Link, Typography } from '@material-ui/core';
import { FilterList } from '@material-ui/icons';
import { withStyles } from '@material-ui/styles';

import AddSubscriptionBlurb from '../Controls/AddSubscriptionBlurb';
import { Icons } from '../Routing/Paths';
import LocationContext from '../LocationContext';
import { OverviewLink, RecallsLink, SettingsLink } from '../Routing/Links';
import Qualifications from '../Controls/Qualifications';

const styles = theme => ({
    fauxLink: {
        color: theme.palette.primary.main,
    },
    filter: {
        height: '1.3em',
        width: '1.3em',
    },
    link: {
        cursor: 'hand',
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

class RecallsPage extends React.Component {
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
                    A Recalls Subscription gives you access to, and alerts of, a wide range of product
                    recalls published by the U.S. government.
                </p>
                <AddSubscriptionBlurb
                    className={classNames(!user.hasRecallSubscription || classes.hide)}
                    isNotice={true}
                    type='recalls'
                />
                <Typography variant='h5'>
                    Seeing an Overview
                </Typography>
                <p>
                    The <Link
                            component={OverviewLink}
                            className={classes.link}
                            onClick={onClose}
                        >Overview <i className={Icons.root}></i></Link> section
                    summarizes the
                    recalls issued in the last 30 days and alerts sent in the last 7 days.
                </p>
                <p>
                    Use the <Link
                        component={SettingsLink}
                        className={classes.link}
                        onClick={onClose}
                    >Settings</Link> option, under the
                    upper&ndash;left <span className={classes.fauxLink}>Account <i className={Icons.account}></i></span> menu,
                    to adjust the recalls for which you&apos;ll receive alerts.
                </p>
                <Typography variant='h5'>
                    Viewing All Recalls
                </Typography>
                <p>
                    The <Link
                        component={RecallsLink}
                        className={classes.link}
                        onClick={onClose}
                        >Recalls <i className={Icons.recalls}></i></Link> section lists
                    recalls published by the U.S. government since January 1, 2018.
                </p>
                <p>
                    Filter the recalls shown by clicking on
                    the <Fab
                            classes={{root: classes.filter}}
                            color='primary'
                            disableFocusRipple={true}
                            disableRipple={true}
                        > <FilterList /></Fab> icon.
                </p>
                <Qualifications className={classes.qualifications} />
            </div>
        );
    }
}
RecallsPage.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(RecallsPage);
