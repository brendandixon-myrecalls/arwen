import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { withStyles } from '@material-ui/styles';
import withWidth from '@material-ui/core/withWidth';

import Progress from '../Utilities/Progress';

const styles = theme => ({
    root: {
    },
});

const PULL_DOWN_PERCENTAGE = 0.10;
const PULL_DOWN_START_DELAY = 250;
const PULL_DOWN_END_DELAY = 500;

class PullRefresher extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        onRefresh: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.handleScroll = this.handleScroll.bind(this);
        this.isPulledDown = this.isPulledDown.bind(this);

        this.mounted = false;
        this.pullStartedAt = null;

        this.state = {
            pulling: false,
        }
    }

    componentDidMount() {
        this.mounted = true;
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        this.mounted = false;
        window.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll() {
        // If the user begins to pull, note the time
        if (!this.pullStartedAt) {
            if (this.isPulledDown()) {
                this.pullStartedAt = moment();
            }
        }

        // If they hold the pull long enough, display a "refreshing" signal
        else if (this.isPulledDown()) {
            if (!this.state.pulling && moment().diff(this.pullStartedAt) >= PULL_DOWN_START_DELAY) {
                if (this.mounted) {
                    this.setState({
                        pulling: true
                    });
                }
            }
        }

        else {
            // If they stopped pulling and did not wait, forget the attempt
            // if (!this.state.pulling) {
            //     console.log('Pull abandoned')
            // }

            // If they stopped pulling after waiting long enough, initiate a refresh
            if (this.state.pulling && moment().diff(this.pullStartedAt) >= PULL_DOWN_END_DELAY) {
                const { onRefresh } = this.props;

                onRefresh();

                if (this.mounted) {
                    this.setState({
                        pulling: false,
                    });
                }
            }

            this.pullStartedAt = null;
        }
    }

    isPulledDown() {
        return (-window.scrollY / window.innerHeight) >= PULL_DOWN_PERCENTAGE;
    }

    render() {
        const { theme } = this.props;
        return (!this.state.pulling
            ? null
            : (
                <div style={{
                    position: 'absolute',
                    top: (window.scrollY * 0.5) - theme.spacing(1),
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                }}>
                    <Progress />
                </div>
            ));
    }
}

export default withWidth()(withStyles(styles, { withTheme: true })(PullRefresher));
