import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/styles';

import { RISK } from '../../Common/Constants'

import Instruction from './Instruction';
import Instructions from './Instructions';
import OptionsControl from '../Controls/OptionsControl';
import PressRelease from './PressRelease';

const styles = theme => ({
    root: {
        backgroundColor: 'white',
    },
});

class AssignAllergens extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        recall: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired
    }

    render() {
        const { classes, onChange, recall } = this.props;

        let explanation = null
        if (['fda', 'usda'].includes(recall.feedSource)) {
            explanation = (
                <React.Fragment>
                    <Instructions>
                        <Instruction>
                            For FDA and USDA recalls follow their three-level risk categorization:
                        </Instruction>
                    </Instructions>
                    <Instructions>
                        <Instruction>Class I &mdash; <strong>Probable</strong> health risk</Instruction>
                        <Instruction>Class II &mdash; <strong>Possible</strong> health risk</Instruction>
                        <Instruction>Class III &mdash; No health risk</Instruction>
                    </Instructions>
                </React.Fragment>
            )
        }
        recall.ensureRisk()

        return (
            <div className={classes.root}>
                <Instructions>
                    <Instruction>
                        Choose the most appropriate Health Risk based on the <PressRelease recall={recall} />
                        . Unless otherwise stated in the <PressRelease recall={recall} />
                        , <em>Food</em> recalls should always have <em>at least</em> a <strong>possible</strong> health risk.
                        For other categories (such as <em>Household Products</em>), assign
                        a <strong>possible</strong> health risk if there is any chance of injury.
                    </Instruction>
                </Instructions>
                {explanation}
                <OptionsControl
                    singleton
                    values={[recall.risk]}
                    name='risk'
                    options={RISK}
                    onChange={onChange}
                />
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(AssignAllergens);
