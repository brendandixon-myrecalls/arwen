import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    root: {
        width: '100%',
    },
    content: {
        paddingLeft: theme.spacing(2),
    },
    actionsContainer: {
        textAlign: 'right',
    },
    button: {
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
});

class ReviewStepper extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        activeStep: PropTypes.number.isRequired,
        disabled: PropTypes.bool,
        onStep: PropTypes.func.isRequired,
        steps: PropTypes.arrayOf(PropTypes.string).isRequired,
    };

    constructor(props) {
        super(props);

        this.handleBack = this.handleBack.bind(this);
        this.handleNext = this.handleNext.bind(this);
    }

    handleBack() {
        this.props.onStep(this.props.activeStep - 1);
    };

    handleNext() {
        this.props.onStep(this.props.activeStep + 1);
    };

    render() {
        const { activeStep, disabled, children, classes, steps, theme } = this.props;

        return (
            <Stepper
                activeStep={activeStep}
                className={classes.root}
                orientation='vertical'
            >
                {steps.map((step, index) => {
                    return (
                        <Step key={step}>
                            <StepLabel>{step}</StepLabel>
                            <StepContent style={{position: 'relative'}}>
                                {activeStep == index
                                    ? <div className={classes.content}>
                                        {children}
                                        <div className={classes.actionsContainer}>
                                            <Button
                                                className={classes.button}
                                                color='primary'
                                                disabled={disabled || activeStep === 0}
                                                onClick={this.handleBack}
                                                size='medium'
                                                variant='contained'
                                            >
                                                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                                                Back
                                            </Button>
                                            <Button
                                                className={classes.button}
                                                color='primary'
                                                disabled={disabled || activeStep == steps.length}
                                                onClick={this.handleNext}
                                                size='medium'
                                                variant='contained'
                                            >
                                                {activeStep == steps.length - 1 ? 'Finish' : 'Next'}
                                                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                                            </Button>
                                        </div>
                                    </div>
                                    : null}
                            </StepContent>
                        </Step>
                    );
                })}
            </Stepper>
        )
    }
}

export default withStyles(styles, { withTheme: true })(ReviewStepper);
