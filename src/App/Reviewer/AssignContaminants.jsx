import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/styles';

import { FOOD_CONTAMINANTS, PRODUCT_CONTAMINANTS } from '../../Common/Constants'

import Instruction from './Instruction';
import Instructions from './Instructions';
import OptionsControl from '../Controls/OptionsControl';
import PressRelease from './PressRelease';

const styles = theme => ({
    root: {
        backgroundColor: 'white',
    },
});

class AssignContaminants extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        recall: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired
    }

    componentDidMount() {
        const { recall, onChange } = this.props;

        if (!recall.actsAsContaminable) {
            onChange();
        }
    }

    render() {
        const { classes, onChange, recall } = this.props;

        const disabled = !recall.actsAsContaminable;

        return (
            <div className={classes.root}>
                <Instructions>
                    <Instruction>
                        {(disabled
                            ? <span>Contaminants do not apply to this recall.</span>
                            : <span>Select any contaminants listed in the <PressRelease recall={recall} />.</span>
                        )}
                    </Instruction>
                </Instructions>
                <OptionsControl
                    disabled={disabled}
                    name='contaminants'
                    options={recall.canHaveAllergens ? FOOD_CONTAMINANTS : PRODUCT_CONTAMINANTS}
                    values={recall.contaminants}
                    onChange={onChange}
                />
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(AssignContaminants);
