import React from 'react';
import PropTypes from 'prop-types';
import { castArray, isEmpty } from 'lodash';

import { Divider, Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import AddSubscriptionBlurb from '../Controls/AddSubscriptionBlurb';
import RecallsSummary from './RecallsSummary';
import LocationContext from '../LocationContext';
import Progress from '../Utilities/Progress';
import PullRefresher from '../Layout/PullRefresher';
import Recall from '../Recalls/Recall';

const styles = theme => ({
    container: {
        alignItems: 'center',
        color: theme.palette.primary.contrastText,
        flexFlow: 'row wrap',
        justifyContent: 'center',
        padding: `${theme.spacing(1)} ${theme.spacing(3)} ${theme.spacing(3)}`,
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1),
        },
    },
    divider: {
        borderTop: '1px solid #FFFFFF',
        marginTop: '1rem',
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

class Overview extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this.mounted = false;

        this.fetchRecalls = this.fetchRecalls.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.toggleExpanded = this.toggleExpanded.bind(this);

        this.state = {
            expanded: null,
            recalls: null,
            version: 0,
        }
    }

    componentDidMount() {
        this.mounted = true;

        this.fetchRecalls();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    fetchRecalls() {
        const { credentials, evaluateError, host, user } = this.context;

        let p = Promise.resolve();

        if (!credentials.isAuthenticated) {
            this.setState({
                recalls: [],
            });
        }

        else {
            p = p.then(() =>
                host.searchRecalls({
                    after: moment().subtract(7, 'days').toISOString(),
                })
                .then(results => {
                    if (this.mounted) {
                        this.setState({
                            recalls: castArray(results.data || []),
                        });
                    }
                })
                .catch(e => {
                    evaluateError(e);

                    if (this.mounted) {
                        this.setState({
                            recalls: [],
                        });
                    }
                })
            );
        }
    }

    handleRefresh() {
        this.setState((state) => {
            return {
                active: -1,
                recalls: null,
                version: state.version+1,
            }
        });
        this.fetchRecalls();
    }

    toggleExpanded(event, recall) {
        if (event) {
            event.stopPropagation();
        }

        this.setState(state => {
            const { expanded } = this.state;
            return ({
                expanded: expanded == recall.id ? null : recall.id
            });
        })
    }

    renderBody() {
        const { credentials, user } = this.context;
        const { classes, theme } = this.props;
        const { expanded, recalls } = this.state;

        let content = null;
        if (!recalls) {
            content = this.renderWaiting();
        }

        else if (isEmpty(recalls)) {
            content = (<Typography variant='h5' style={{color: 'inherit'}}>
                No recalls have been issued in the last 7
            </Typography>)
        }

        else {
            content = recalls.map(recall => {
                const isExpanded = expanded == recall.id;
                return (
                    <Grid
                        item
                        key={recall.id}
                        {...theme.getItemWidths(isExpanded)}
                    >
                        <Recall
                            expanded={isExpanded}
                            recall={recall}
                            onClick={(event) => this.toggleExpanded(event, recall)} />
                    </Grid>
                )
            });
        }

        if (!credentials.isAuthenticated) {
            return (
                <Grid
                    container
                    className={classes.container}
                    spacing={3}
                >
                    {content}
                </Grid>
            );
        }

        return (
            <React.Fragment>
                <PullRefresher onRefresh={this.handleRefresh} />
                <div className={classes.title}>
                    30 Day Summary
                </div>
                <Grid
                    container
                    className={classes.container}
                    spacing={3}
                >
                    <Grid
                        item
                        xs={12}
                    >
                        <RecallsSummary />
                    </Grid>
                </Grid>
                <Divider classes={{ root: classes.divider }} />
                <div className={classes.title}>
                    Recent Recalls
                </div>
                <Grid
                    container
                    className={classes.container}
                    spacing={3}
                >
                    {content}
                </Grid>
            </React.Fragment>
        );
    }

    renderWaiting() {
        return (
            <Grid
                item
                xs={12}
                style={{ textAlign: 'center' }}
            >
                <Progress />
            </Grid>
        );
    }

    render() {
        const { user } = this.context;
        const { classes } = this.props;
        const { version } = this.state;

        if (!user.hasRecallSubscription) {
            return (<AddSubscriptionBlurb type='recalls' />)
        }

        return (
            <div
                className={classes.container}
                key={version}
            >
                {this.renderBody()}
            </div>
        )
    }
}
Overview.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(Overview);
