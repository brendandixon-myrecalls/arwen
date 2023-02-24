import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/styles';

import { AUDIENCE } from '../../Common/Constants';

import Instruction from './Instruction';
import Instructions from './Instructions';
import OptionsControl from '../Controls/OptionsControl';
import PressRelease from './PressRelease';

const styles = theme => ({
    root: {
        backgroundColor: 'white',
    },
});

class AssignAudience extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        recall: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired
    }

    render() {
        const { classes, onChange, recall } = this.props;

        return (
            <div className={classes.root}>
                <Instructions>
                    <Instruction>
                        Most recalls affect <strong>Consumers</strong>,
                        some address <strong>Professionals</strong> as well or exclusively.
                        Based on the <PressRelease recall={recall} />, is the recall
                        directed to <strong>Consumers</strong>, <strong>Professionals</strong>,
                        or both?
                    </Instruction>
                </Instructions>
                <OptionsControl
                    values={recall.audience || []}
                    name='audience'
                    options={AUDIENCE}
                    onChange={onChange}
                />
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(AssignAudience);
