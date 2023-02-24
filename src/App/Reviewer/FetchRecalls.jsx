import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';

import LocationContext from '../LocationContext';
import Progress from '../Utilities/Progress';

const styles = theme => ({
    root: {
        textAlign: 'center',
        width: '100%'
    },
});

class FetchRecalls extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        this.handleError = this.handleError.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        const { host } = this.context;
        host.searchRecalls({ state: 'unreviewed' })
            .then(results => {
                const recalls = results.data || [];
                const total = (results.meta || {}).total || recalls.length
                this.handleChange({total: total, recalls: recalls});
            })
            .catch(error => this.handleError(error));
    }

    handleChange(recalls) {
        this.props.onChange(recalls);
    }

    handleError(error) {
        this.props.onError(error);
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Typography variant='h6'>Retrieving Recalls</Typography>
                <Progress />
            </div>
        );
    }
}
FetchRecalls.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(FetchRecalls);
