import React from 'react';
import PropTypes from 'prop-types';
import { isArray, isEmpty } from 'lodash';
import classNames from 'classnames';

import { Button, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import JoinBlurb from '../Controls/JoinBlurb';
import LocationContext from '../LocationContext';
import OfferControl from './OfferControl';
import Progress from '../Utilities/Progress';
import Qualifications from './Qualifications';


const styles = theme => ({
    container: {
        alignItems: 'center',
        color: theme.palette.primary.contrastText,
        flexFlow: 'row wrap',
        justifyContent: 'center',
        margin: '0 auto',
        padding: `${theme.spacing(1)} ${theme.spacing(3)} ${theme.spacing(3)}`,
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1),
        },
        width: '90%',
        [theme.breakpoints.up('sm')]: {
            width: '100%',
        },
    },
    actionsContainer: {
        marginTop: theme.spacing(2),
        textAlign: 'right',
    },
    break: {
        display: 'none',
        height: 0,
        padding: '0px !important',
        [theme.breakpoints.down('sm')]: {
            display: 'block',
            flexBasis: '100%',
            order: -1,
        },
    },
    offer: {
        flexBasis: '30em',
        flexGrow: 1,
        flexShrink: 0,
        maxWidth: '30em',
        width: '30em',
    },
    offers: {
        justifyContent: 'center',
        padding: 0,
        margin: 0,
    },
    promoted: {
        [theme.breakpoints.down('sm')]: {
            order: -2,
        },
    },
    qualifications: {
        width: '55%',
        [theme.breakpoints.down('sm')]: {
            fontSize: '1em',
            width: '100%',
        },
    },
    title: {
        fontSize: theme.typography.h2.fontSize,
        [theme.breakpoints.down('sm')]: {
            fontSize: theme.typography.h3.fontSize,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: theme.typography.h4.fontSize,
        },
    },
    links: {
        marginTop: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
});

class OffersControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        onComplete: PropTypes.func.isRequired,
        showCancel: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this.state = {
            plans: null,
        };

        this.retrieveOffers = this.retrieveOffers.bind(this);

        this.mounted = false;
    }

    componentDidMount() {
        this.mounted = true;
        this.retrieveOffers();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    retrieveOffers() {
        const { evaluateError, host } = this.context;

        host.searchPlans()
            .then((result) => {
                if (this.mounted) {
                    this.setState({
                        plans: result.data,
                    });
                }
            })
            .catch((e) => {
                evaluateError(e);
                if (this.mounted) {
                    this.setState({
                        plans: [],
                    });
                }
            });
    }

    renderCancel() {
        const { showCancel, classes, onComplete } = this.props;

        return (<div className={classNames(classes.actionsContainer, showCancel || classes.hide)}>
            <Button
                className={classes.button}
                color='primary'
                onClick={() => onComplete()}
                size='medium'
                variant='contained'
            >Cancel</Button>
        </div>);        
    }

    renderOffers() {
        const { user } = this.context;
        const { classes, onComplete } = this.props;
        const { plans } = this.state;

        const hasRecallSubscription = !isEmpty(user) && user.hasRecallSubscription;
        const hasPlans = isArray(plans);
        const bothPlan = hasPlans && plans.find(p => p.isForRecalls && p.isForVehicles);
        const recallPlan = hasPlans && plans.find(p => p.isForRecalls && !p.isForVehicles);
        const vehiclePlan = hasPlans && plans.find(p => !p.isForRecalls && p.isForVehicles);

        if (isEmpty(bothPlan) || isEmpty(recallPlan) || isEmpty(vehiclePlan)) {
            return null;
        }

        return (<Grid
            item
            xs={12}
        >
            <Grid
                className={classes.offers}
                container
                spacing={2}
            >
                <Grid
                    className={classNames(classes.offer, !hasRecallSubscription || classes.hide)}
                    item
                    sm={12} md={6} lg={4}
                >
                    <OfferControl
                        disabled={hasRecallSubscription}
                        plan={recallPlan}
                        onComplete={onComplete}
                    />
                </Grid>
                <Grid
                    className={classNames(classes.promoted, classes.offer, !hasRecallSubscription || classes.hide)}
                    item
                    sm={12} md={12} lg={4}
                >
                    <OfferControl
                        disabled={hasRecallSubscription}
                        plan={bothPlan}
                        onComplete={onComplete}
                    />
                </Grid>
                <Grid
                    className={classNames(classes.break, !hasRecallSubscription || classes.hide)}
                    item
                    sm={12}
                />
                <Grid
                    className={classNames(classes.offer)}
                    item
                    sm={12} md={6} lg={4}
                >
                    <OfferControl
                        disabled={false}
                        plan={vehiclePlan}
                        onComplete={onComplete}
                    />
                </Grid>
            </Grid>
        </Grid>);
    }

    render() {
        const { classes } = this.props;
        const { plans } = this.state;

        return (
            <Grid
                container
                className={classes.container}
                spacing={1}
            >
                <Grid
                    item
                    xs={12}
                    style={{ textAlign: 'center' }}
                >
                    <div className={classes.title}>
                        Select Your Subscription
                    </div>
                    <JoinBlurb blurbOnly={true} />
                </Grid>
                <Grid
                    className={classNames(isEmpty(plans) || classes.hide)}
                    item
                    xs={12} sm={6} md={4}
                    style={{ textAlign: 'center' }}
                >
                    <Progress />
                </Grid>
                {this.renderOffers()}
                <Grid
                    item
                    xs={12}
                >
                    <Qualifications className={classes.qualifications} />
                    {this.renderCancel()}
                </Grid>
            </Grid>
        );
    }
}
OffersControl.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(OffersControl);
