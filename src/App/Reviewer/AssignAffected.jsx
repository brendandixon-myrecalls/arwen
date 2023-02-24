import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/styles';

import { AFFECTED } from '../../Common/Constants'

import Instructions from './Instructions';
import OptionsControl from '../Controls/OptionsControl';
import PressRelease from './PressRelease';

const styles = theme => ({
    root: {
        backgroundColor: 'white',
    },
});

class AssignAffected extends React.Component {
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
                    Only select groups <em>specifically mentioned</em> or <em>strongly implied</em> in the <PressRelease recall={recall} />.
                </Instructions>
                <OptionsControl
                    values={recall.affected}
                    name='affected'
                    options={AFFECTED}
                    onChange={onChange}
                />
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(AssignAffected);
