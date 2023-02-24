import React from 'react'
import PropTypes from 'prop-types'

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/styles';

import { STATES, TERRITORIES } from '../../Common/Constants'

import Instruction from './Instruction';
import Instructions from './Instructions';
import OptionsControl from '../Controls/OptionsControl';
import PressRelease from './PressRelease';

const styles = theme => ({
    root: {
        backgroundColor: 'white',
    },
    actionContainer: {
        paddingLeft: 0,
        paddingTop: theme.spacing(1),
    },
    button: {
        marginLeft: 0,
        marginRight: theme.spacing(1),
    },
});

class AssignDistribution extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        recall: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        this._allStates = STATES.map(option => option.value).sort()

        this.handleClear = this.handleClear.bind(this);
        this.handleNationwide = this.handleNationwide.bind(this)
    }

    handleClear(event) {
        this.props.onChange([]);
    }

    handleNationwide(event) {
        this.props.onChange({distribution: this._allStates});
    }

    render() {
        const { classes, onChange, messages, recall, theme } = this.props;

        return (
            <div className={classes.root}>
                <Instructions>
                    <Instruction>
                        Select the state(s) or region(s) listed in the <PressRelease recall={recall} />.
                    </Instruction>
                </Instructions>
                <Instructions>
                    <Instruction>If the <PressRelease recall={recall} /> does not specify a distribution, select Nationwide.</Instruction>
                    <Instruction>If the <PressRelease recall={recall} /> lists online sales, assume Nationwide distribution.</Instruction>
                    <Instruction>For outlying territories, such as Military Bases or Puerto Rico, select Territories.</Instruction>
                </Instructions>
                <OptionsControl
                    values={recall.distribution}
                    name='distribution'
                    options={[...STATES, ...TERRITORIES]}
                    onChange={onChange}
                />
                <div className={classes.actionContainer}>
                    <Button
                        className={classes.button}
                        color='primary'
                        variant='outlined'
                        size='small'
                        onClick={this.handleNationwide}
                    >
                        Nationwide Impact
                    </Button>
                    <Button
                        className={classes.button}
                        color='primary'
                        variant='outlined'
                        size='small'
                        onClick={this.handleClear}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(AssignDistribution);
