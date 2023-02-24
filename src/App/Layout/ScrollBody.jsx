import InfiniteScroll from 'react-infinite-scroller';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { assign } from 'lodash';

import { withStyles } from '@material-ui/styles';
import withWidth from '@material-ui/core/withWidth';

import LocationContext from '../LocationContext';
import PullRefresher from './PullRefresher';
import Progress from '../Utilities/Progress';

const styles = theme => ({
    root: {
    },
    loader: {
        marginTop: theme.spacing(3),
        textAlign: 'center',
        width: '100%'
    },
});

class ScrollBody extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        fetcher: PropTypes.func.isRequired,
        hasMoreItems: PropTypes.bool.isRequired,
        onReceive: PropTypes.func.isRequired,
        onRefresh: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.fetchPage = this.fetchPage.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);

        this.mounted = false;
        this.pageSize = 20;

        this.state = {
            healthy: true,
            version: 0,
        }
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    fetchPage(page) {
        const { evaluateError } = this.context;
        const { fetcher, onReceive } = this.props;
        const { version } = this.state;

        const offset = (page >= 0 ? page - 1 : 0) * this.pageSize;

        fetcher({ limit: this.pageSize, offset: offset })
            .then(results => {
                if (this.mounted && version == this.state.version) {
                    onReceive(results);
                }
            })
            .catch(e => {
                evaluateError(e);
                if (this.mounted) {
                    this.setState({
                        healthy: false
                    });
                }
            })
    }

    handleRefresh() {
        const { onRefresh } = this.props;

        this.setState((state) => {
            return {
                version: state.version+1,
            }
        });

        onRefresh();
    }

    render() {
        const { children, classes, hasMoreItems } = this.props;
        const { healthy, version } = this.state;

        return (
            <InfiniteScroll
                className={classes.root}
                key={version}
                hasMore={hasMoreItems && healthy}
                initialLoad={true}
                loadMore={this.fetchPage}
                loader={<div className={classes.loader} key={moment().toISOString()}><Progress /></div>}
                pageStart={0}
            >
                <PullRefresher onRefresh={this.handleRefresh} />
                {children}
            </InfiniteScroll>
        )
    }
}
ScrollBody.contextType = LocationContext;

export default withWidth()(withStyles(styles, { withTheme: true })(ScrollBody));
