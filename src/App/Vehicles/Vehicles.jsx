import React from 'react';
import PropTypes from 'prop-types';
import { concat, filter, find, partition } from 'lodash';
import classNames from 'classnames';

import { Grid, Link } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import AddSubscriptionBlurb from '../Controls/AddSubscriptionBlurb';
import LocationContext from '../LocationContext';
import Progress from '../Utilities/Progress';
import { SubscriptionsLink } from '../Routing/Links';
import Vin from './Vin';

const REFRESH_DELAY_SECONDS = 10;
const MAX_REFRESH_ATTEMPTS = 2 * (60 / REFRESH_DELAY_SECONDS);

const styles = theme => ({
    container: {
        alignItems: 'center',
        color: theme.palette.primary.contrastText,
        flexFlow: 'row wrap',
        justifyContent: 'center',
        marginTop: `${theme.spacing(2)}`,
        padding: `${theme.spacing(1)} ${theme.spacing(3)} ${theme.spacing(3)}`,
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1),
        },
    },
    link: {
        cursor: 'hand',
    },
    links: {
        color: theme.palette.primary.contrastText,
        fontSize: theme.typography.h6.fontSize,
        marginBottom: theme.spacing(2),
        marginTop: `-${theme.spacing(1)}`,
        textAlign: 'center',
    },
    title: {
        color: theme.palette.primary.contrastText,
        fontSize: theme.typography.h2.fontSize,
        [theme.breakpoints.down('sm')]: {
            fontSize: theme.typography.h3.fontSize,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: theme.typography.h4.fontSize,
        },
        textAlign: 'center',
    },
    hide: {
        display: 'none',
    },
});

class Vins extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this.mounted = false;

        this.handleUpdate = this.handleUpdate.bind(this);
        this.refreshVin = this.refreshVin.bind(this);
        this.retrieveVins = this.retrieveVins.bind(this);
        this.scheduleRefreshVin = this.scheduleRefreshVin.bind(this);

        this.state = {
            vins: [],
            timers: [],
        }
    }

    componentDidMount() {
        this.mounted = true;
        this.retrieveVins();
    }

    componentWillUnmount() {
        const { host } = this.context;
        const { timers } = this.state;

        this.mounted = false;

        host.cancelAll();

        timers.forEach(timer => {
            try {
                clearTimeout(timer.id);
            }
            catch {}
        });
    }

    handleUpdate() {
        this.retrieveVins();
    }

    refreshVin(vinId, attempt) {
        const { evaluateError, host } = this.context;

        host.readUserVin(vinId, { recalls: true })
            .then(vin => {
                if (this.mounted) {
                    if (vin.reviewed) {
                        this.setState(state => {
                            const partitions = partition(state.vins, v => v.compare(vin) < 0);
                            const start = partitions[0] || [];
                            const end = partitions[1] || [];

                            return ({
                                vins: concat(start, vin, end.slice(1))
                            })
                        });
                    }

                    else {
                        this.scheduleRefreshVin(vin, attempt+1);
                    }
                }
            })
            .catch(e => {
                evaluateError(e);
            })
    }

    retrieveVins() {
        const { credentials, evaluateError, host } = this.context;

        if (!credentials.isAuthenticated) {
            this.setState({
                vins: []
            });
        }

        else {
            host.readUserVins({ recalls: true })
                .then(results => {
                    if (this.mounted) {
                        const vins = results.data.sort((x, y) => x.compare(y));

                        this.setState({
                            vins: vins
                        });

                        vins.forEach(vin => this.scheduleRefreshVin(vin));
                    }
                })
                .catch(e => {
                    evaluateError(e);

                    if (this.mounted) {
                        this.setState({
                            vins: []
                        });
                    }
                })
        }
    }

    scheduleRefreshVin(vin, attempt=0) {
        if (vin.reviewed || attempt >= MAX_REFRESH_ATTEMPTS) {
            this.setState(state => ({
                timers: filter(state.timers, t => t.vinId != vin.id)
            }));
            return;
        }

        this.setState(state => ({
            timers: concat(state.timers, {
                id: setTimeout(this.refreshVin, REFRESH_DELAY_SECONDS * 1000, vin.id, attempt),
                vinId: vin.id
            })
        }));
        return;
    }

    renderVin(vin, i, focus = false) {
        const { timers } = this.state;

        return (
            <Grid
                item
                key={vin.id}
                xs={12}
            >
                <Vin
                    focus={focus}
                    onUpdate={this.handleUpdate}
                    position={i}
                    recallsPending={!vin.reviewed && Boolean(find(timers, t => t.vinId == vin.id))}
                    vin={vin}
                />
            </Grid>)
    }

    render() {
        const { user } = this.context;
        const { classes } = this.props;
        const { vins } = this.state;

        if (!user.hasVehicleSubscription) {
            return (<AddSubscriptionBlurb type='vehicles' />)
        }

        let focus = true;
        const content = (vins || []).map((vin, i) => {
            const setFocus = focus && vin.updateAllowed;
            focus = !setFocus;
            return this.renderVin(vin, i, setFocus);
        });

        return (
            <React.Fragment>
                <div className={classes.title}>
                    Your Vehicles
                </div>
                <Grid
                    container
                    className={classes.container}
                    spacing={3}
                >
                    <Grid
                        className={classNames(!_.isArray(vins) || classes.hide)}
                        item
                        xs={12}
                        style={{ textAlign: 'center' }}
                    >
                        <Progress />
                    </Grid>
                    {content}
                </Grid>
                <div className={classes.links}>
                    Have more Vehicles? <Link
                        component={SubscriptionsLink}
                        className={classes.link} >Add another subscription.</Link>
                </div>
            </React.Fragment>
        );
    }
}
Vins.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(Vins);
