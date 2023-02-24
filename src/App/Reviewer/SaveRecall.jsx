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

class SaveRecall extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        recall: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        this.handleError = this.handleError.bind(this);
        this.handleSuccess = this.handleSuccess.bind(this);
    }

    componentDidMount() {
        const { host } = this.context;
        const { recall } = this.props;
        recall.state = 'reviewed';
        host.updateRecall(recall)
            .then(() => this.handleSuccess())
            .catch(error => this.handleError(error));
    }

    handleSuccess() {
        this.props.onChange();
    }

    handleError(error) {
        console.log(error)
        this.props.onError(error);
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Typography variant='h6'>Saving Recall</Typography>
                <Progress />
            </div>
        );
    }
}
SaveRecall.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(SaveRecall);
