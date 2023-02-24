import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/styles';

import Instruction from './Instruction';
import Instructions from './Instructions';
import PressRelease from './PressRelease';

const styles = theme => ({
    root: {
        backgroundColor: 'white',
    },
});

class ReadPressRelease extends React.Component {
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
                <Instructions>
                    <Instruction>Open and read the <PressRelease recall={recall} /></Instruction>
                    <Instruction>
                        Press <strong>Next</strong> and
                        answer the following questions, referring back to
                        the <PressRelease recall={recall} /> as necessary.
                    </Instruction>
                </Instructions>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(ReadPressRelease);
