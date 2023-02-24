import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/styles';

import { getSourceCategories } from '../../Common/Constants'
import Instruction from './Instruction';
import Instructions from './Instructions';
import OptionsControl from '../Controls/OptionsControl';

const styles = theme => ({
    root: {
        backgroundColor: 'white',
    },
});

class AssignCategories extends React.Component {
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
                        Select one or more categories that apply.
                    </Instruction>
                </Instructions>
                <OptionsControl
                    values={recall.categories}
                    name='categories'
                    options={getSourceCategories(recall.feedSource)}
                    onChange={onChange}
                />
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(AssignCategories);
