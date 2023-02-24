import React from 'react'
import PropTypes from 'prop-types'

import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'
momentDurationFormatSetup(moment)

import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    root: {
        fontSize: '1rem',
        whiteSpace: 'nowrap'
    },
    count: {
        display: 'inline-block',
        paddingRight: theme.spacing(1),
    },
    danger: {
        color: 'red'
    }
});

class ReviewTimer extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        current: PropTypes.number.isRequired,
        start: PropTypes.object.isRequired,
        total: PropTypes.number.isRequired,
        expectedSeconds: PropTypes.number
    }

    constructor(props) {
        super(props)

        const start = moment(props.start)
        this.state = {
            start: start,
            now: start,
            timer: null,
            expectedFinish: moment(start).add(props.expectedSeconds || (3 * 60), 'seconds')
        }

        this.tick = this.tick.bind(this)
    }

    componentDidMount() {
        let state = this.state
        if (!state.timer) {
            this.setState({ timer: setInterval(this.tick, 1000) })
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.start != this.props.start ||
            prevProps.expectedSeconds != this.props.expectedSeconds) {
            const start = moment(this.props.start);
            this.setState({
                start: start,
                now: start,
                expectedFinish: moment(start).add(this.props.expectedSeconds || (3 * 60), 'seconds')
            })
        }
    }

    componentWillUnmount() {
        let state = this.state
        if (state.timer) {
            clearInterval(state.timer)
            this.setState({ timer: null })
        }
    }

    tick() {
        this.setState({ now: moment() })
    }

    render() {
        const { classes, current, total } = this.props;
        const { now, expectedFinish, start } = this.state;
        return (
            <span className={classes.root}>
                <span className={classes.count}> {`${current + 1} of ${total}`}</span>
                Elapsed Time
                <span className={(now > expectedFinish ? classes.danger : '')}>
                    &nbsp;
                    {moment.duration(now.diff(start)).format('mm:ss', { trim: false })}
                    &nbsp;
                </span>
            </span>
        )
    }
}

export default withStyles(styles, { withTheme: true })(ReviewTimer);
