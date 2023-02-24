import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { assign, castArray, intersection, isEmpty } from 'lodash';

import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import AddSubscriptionBlurb from '../Controls/AddSubscriptionBlurb';
import Collector from '../Layout/Collector';
import FilterMenu from './FilterMenu';
import LocationContext from '../LocationContext';
import Recall from './Recall';
import Scrim from '../Utilities/Scrim';

const DEFAULT_FILTER = (() => true);
const PARAMS = { state: 'sent' };

const styles = theme => ({
    divider: {
        borderTop: '1px solid #FFFFFF',
        marginTop: '1rem',
    },
    subtitle: {
        color: theme.palette.primary.contrastText,
        fontSize: theme.typography.body1.fontSize,
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
    sectionTitle: {
        color: theme.palette.primary.contrastText,
        fontSize: theme.typography.h5.fontSize,
        [theme.breakpoints.down('sm')]: {
            fontSize: theme.typography.h6.fontSize,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: theme.typography.h6.fontSize,
        },
    },
    hide: {
        display: 'none',
    },
});

class Recalls extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this.mounted = false;

        this.state = {
            filter: DEFAULT_FILTER,
            filterOpen: false,
            filters: {},
        }

        this.handleFilter = this.handleFilter.bind(this);
        this.handleFilterToggle = this.handleFilterToggle.bind(this);
        this.renderRecalls = this.renderRecalls.bind(this);
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleFilter(filters) {
        if (!this.mounted) {
            return;
        }

        if (isEmpty(filters) || Object.keys(filters).length <= 0) {
            this.setState({
                filter: DEFAULT_FILTER,
                filters: filters,
            });
        }

        // Note:
        // - The logic is inverted, the find will return the first non-matching filter
        // - If no filter matches, then the entire function returns true (i.e., display the card)
        const filter = ((o) => !(Object.keys(filters).find(k => {
            const values = filters[k];
            return (values.length > 0 && intersection(values, castArray(o[k] || [])).length <= 0);
        })));

        this.setState({
            filter: filter,
            filters: filters,
        });
    }

    handleFilterToggle(open) {
        if (!this.mounted) {
            return;
        }

        this.setState({
            filterOpen: open,
        });
    }

    renderRecalls(items, expanded, toggleExpanded) {
        const { classes, theme } = this.props;
        const { filter } = this.state;

        let weekStart = moment().startOf('week');
        let weekEnd = moment().endOf('week')

        let content = [];
        let iStart = 0;
        let iEnd = 0;
        while (iStart < items.length) {

            content.push(
                <Grid item key={weekStart.toISOString()} xs={12}>
                    <div className={classes.sectionTitle}>
                        Recalled {weekStart.format('LL')} &mdash; {weekEnd.format('LL')}
                    </div>
                </Grid>);

            let visible = 0;
            if (items[iStart].publicationDate >= weekStart) {
                for (; iEnd < items.length && items[iEnd].publicationDate >= weekStart && items[iEnd].publicationDate <= weekEnd; iEnd++);
                items.slice(iStart, iEnd).forEach(recall => {
                    const isExpanded = expanded == recall.id
                    if (filter(recall)) {
                        visible += 1;
                    }
                    content.push(
                        <Grid
                            item
                            key={recall.id}
                            className={classNames(filter(recall) || classes.hide)}
                            {...theme.getItemWidths(isExpanded)}
                        >
                            <Recall
                                expanded={isExpanded}
                                recall={recall}
                                onClick={(event) => toggleExpanded(event, recall.id)} />
                        </Grid>)
                });
            }

            content.push(
                <Grid
                    item
                    className={classNames(visible <= 0 || classes.hide)}
                    key={weekEnd.toISOString()}
                    xs={12}
                >
                    <div className={classes.subtitle}>No matching recalls</div>
                </Grid>);

            weekStart.subtract(1, 'week');
            weekEnd.subtract(1, 'week');
            iStart = iEnd;
        }

        return (
            <Grid
                container
                alignItems='stretch'
                justify='space-around'
                spacing={3}
            >
                {content}
            </Grid>
        )
    }

    render() {
        const { host, user } = this.context;
        const { classes } = this.props;
        const { filterOpen, filters } = this.state;

        if (!user.hasRecallSubscription) {
            return (<AddSubscriptionBlurb type='recalls' />)
        }

        return (
            <React.Fragment>
                <Scrim
                    hasToolbar={true}
                    open={filterOpen}
                />
                <FilterMenu
                    filters={filters}
                    onClose={() => this.handleFilterToggle(false)}
                    onFilter={this.handleFilter}
                    onOpen={() => this.handleFilterToggle(true)}
                />
                <div className={classes.title}>
                    Product Recalls
                </div>
                <Collector
                    fetcher={params => host.searchRecalls(assign(params, PARAMS))}
                    render={this.renderRecalls}
                />
            </React.Fragment>
        );
    }
}
Recalls.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(Recalls);
