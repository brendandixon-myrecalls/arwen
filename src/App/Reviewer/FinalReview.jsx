import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/styles';

import Instruction from './Instruction';
import Instructions from './Instructions';

const styles = theme => ({
    root: {
        backgroundColor: 'white',
    },
});

class FinalReview extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        recall: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired
    }

    render() {
        const { classes, recall } = this.props;

        return (
            <div className={classes.root}>
                <Instructions list>
                    <Instruction>
                        If anything looks incorrect, click <strong>Back</strong> and correct it.
                        Once everything looks good, click <strong>Finish</strong>.
                    </Instruction>
                </Instructions>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(FinalReview);
