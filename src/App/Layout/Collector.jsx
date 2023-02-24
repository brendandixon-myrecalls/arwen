import React from 'react';
import PropTypes from 'prop-types';
import { castArray, without } from 'lodash';

import { withStyles } from '@material-ui/styles';

import LocationContext from '../LocationContext';
import ScrollBody from '../Layout/ScrollBody';

const styles = theme => ({
    container: {
        alignItems: 'center',
        color: theme.palette.primary.contrastText,
        flexFlow: 'row wrap',
        justifyContent: 'space-around',
        padding: theme.spacing(3),
    },
    hide: {
        display: 'none',
    },
});

class Collector extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        fetcher: PropTypes.func.isRequired,
        render: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.mounted = false;

        this.handleReceive = this.handleReceive.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);

        this.toggleExpanded = this.toggleExpanded.bind(this);

        this.state = {
            expanded: null,
            items: [],
            total: -1,
        }
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleReceive(results) {
        if (this.mounted) {
            results = results || {};
            this.setState({
                items: [
                    ...this.state.items,
                    ...(castArray(results.data || []))
                ],
                total: results.total || 0,
            });
        }
    }

    handleRefresh() {
        if (this.mounted) {
            this.setState({
                expanded: null,
                items: [],
                total: -1,
            });
        }
    }

    toggleExpanded(event, id) {
        if (event) {
            event.stopPropagation();
        }

        this.setState(state => {
            return ({
                expanded: state.expanded == id ? null : id
            });
        });
    }

    render() {
        const { classes, fetcher, render } = this.props;
        const { expanded, items, total } = this.state;

        return (
            <div
                className={classes.container}
            >
                <ScrollBody
                    fetcher={fetcher}
                    hasMoreItems={total < 0 || items.length < total}
                    onReceive={this.handleReceive}
                    onRefresh={this.handleRefresh}
                >
                    {render(items, expanded, this.toggleExpanded)}
                </ScrollBody>
            </div>
        );
    }
}
Collector.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(Collector);
