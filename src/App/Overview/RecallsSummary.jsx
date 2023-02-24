import React from 'react';
import PropTypes from 'prop-types';
import { dropRightWhile, toPairs } from 'lodash';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';

import BarChart from '../Controls/BarChart';
import LocationContext from '../LocationContext';
import { labelFor, NORMAL_CATEGORIES, RISK } from '../../Common/Constants';
import Progress from '../Utilities/Progress';

const styles = theme => ({
    root: {
    },
    bigNumber: {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
        borderRadius: '4px',
        fontSize: theme.typography.h1.fontSize,
        fontWeight: 400,
        margin: '1rem auto',
        padding: theme.spacing(1),
    },
    chart: {
        left: theme.spacing(1),
        bottom: theme.spacing(1),
        marginTop: '1rem',
        width: `calc(100% - ${theme.spacing(1)}px)`,
    },
    label: {
        color: theme.palette.success.constrastText,
        display: 'inline-block',
        fontSize: '0.9rem',
        margin: theme.spacing(1) * 0.5,
        padding: theme.spacing(1) * 0.5,
    },
    container: {
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: 0,
    },
    count: {
        fontSize: 64,
        fontWeight: 'bold',
        lineHeight: 1.2,
    },
    paper: {
        padding: theme.spacing(1),
        position: 'relative',
        textAlign: 'center',
        flexGrow: 1,
    },
    title: {
    },
});

class RecallsSummary extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        userId: PropTypes.string,
    }

    constructor(props) {
        super(props)

        this.mounted = false;

        this.fetchSummary = this.fetchSummary.bind(this);

        this.renderCategory = this.renderCategory.bind(this);
        this.renderCell = this.renderCell.bind(this);
        this.renderCount = this.renderCount.bind(this);
        this.renderFetching = this.renderFetching.bind(this);
        this.renderRisk = this.renderRisk.bind(this);

        this.state = {
            fetching: false,
            summary: null,
        }
    }

    componentDidMount() {
        this.mounted = true;
        this.fetchSummary();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    fetchSummary() {
        const { evaluateError, host } = this.context;
        this.setState({
            fetching: true,
        });
        return host.summaryRecalls()
            .catch(e => {
                evaluateError(e);
                return null;
            })
            .then(results => {
                if (this.mounted) {
                    this.setState({
                        fetching: false,
                        summary: results,
                    });
                }
            });
    }

    renderCategory() {
        const { classes, theme } = this.props;
        const { summary } = this.state;

        if (!summary) {
            return null;
        }

        const categories = dropRightWhile(
                    toPairs(summary.categories).sort((c1, c2) => c2[1] - c1[1]),
                    (c) => c[1] <= 0)
                .slice(0, 3)
                .map(c => ({
                    value: c[1],
                    color: theme.getCategoryPalette(c[0]).main,
                    label: labelFor(c[0], NORMAL_CATEGORIES)
                }));

        return this.renderCell(
            <React.Fragment>
                <Typography variant='h4'>
                    Top Categories
                </Typography>
                <BarChart
                    classes={{ root: classes.chart }}
                    data={categories}
                />
            </React.Fragment>
        )
    }

    renderCell(content) {
        const { classes } = this.props;

        return (
            <Grid
                container
                item
                xs={12} sm={6} md={4} lg={3} xl={2}
            >
                <Paper
                    className={classes.paper}
                >
                    {content}
                </Paper>
            </Grid>
        );
    }

    renderCount() {
        const { classes } = this.props;
        const { summary } = this.state;

        if (!summary) {
            return null;
        }

        return this.renderCell(
            <React.Fragment>
                <Typography variant='h4'>
                    Total Recalls
                </Typography>
                <div className={classes.bigNumber}>
                    {summary.total}
                </div>
            </React.Fragment>
        );
    }

    renderFetching() {
        const { fetching } = this.state;

        if (!fetching) {
            return null;
        }

        return (
            <Grid
                item
                xs={12} sm={6} md={4}
                style={{ textAlign: 'center' }}
            >
                <Progress />
            </Grid>
        );
    }

    renderRisk() {
        const { classes, theme } = this.props;
        const { summary } = this.state;

        if (!summary) {
            return null;
        }

        const { risk } = summary;
        const data = toPairs(risk).map(r => ({
            value: r[1],
            color: theme.getRiskPalette(r[0]).main,
            label: labelFor(r[0], RISK),
        }));

        return this.renderCell(
            <React.Fragment>
                <Typography variant='h4'>
                    Health Risk
                </Typography>
                <BarChart
                    classes={{ root: classes.chart }}
                    data={data}
                />
            </React.Fragment>
        )
    }

    render() {
        const { classes } = this.props;

        return (
            <Grid
                classes={{container: classes.container}}
                container
                spacing={3}
            >
                {this.renderFetching()}
                {this.renderCount()}
                {this.renderRisk()}
                {this.renderCategory()}
            </Grid>
        );
    }
}
RecallsSummary.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(RecallsSummary);
