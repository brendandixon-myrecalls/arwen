import React from 'react';
import PropTypes from 'prop-types';
import { castArray } from 'lodash';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/styles';

import { IsHostError } from '../../Common/HostError';
import LocationContext from '../LocationContext';

import AssignAudience from './AssignAudience';
import AssignAffected from './AssignAffected';
import AssignAllergens from './AssignAllergens';
import AssignCategories from './AssignCategories';
import AssignContaminants from './AssignContaminants';
import AssignDistribution from './AssignDistribution';
import AssignRisk from './AssignRisk';
import FetchRecalls from './FetchRecalls';
import FinalReview from './FinalReview';
import ReadPressRelease from './ReadPressRelease';
import RenderRecall from './RenderRecall';
import ReviewStepper from './ReviewStepper';
import SaveRecall from './SaveRecall';
import ThankYou from './ThankYou';

const styles = theme => ({
    grow: {
        flexGrow: 1
    },
    container: {
        flexFlow: 'row wrap',
        justifyContent: 'space-around',
    },
});

const getArray = (json, f) => {
    return (json || {})[f] || [];
}
const getSingle = (json, f, v) => {
    json = (json || {})[f];
    return (Array.isArray(json) ? json[0] : json) || v;
}

const setArray = (recall, json, f) => { recall[f] = getArray(json, f) }
const validateArray = (recall, f) => (recall[f] && recall[f].length > 0);

const setSingle = (recall, json, f) => { recall[f] = getSingle(json, f, ''); }
const validateSingle = (recall, f) => (recall[f] && recall[f].length > 0);

const setBoolean = (recall, json, f) => { recall[f] = Boolean(getSingle(json, f, false)); }
const validateBoolean = (recall, f) => (recall[f] === true || recall[f] === false);

const ReviewSteps = [
    {
        label: 'Fetch Recalls',
        component: FetchRecalls,
        onChange: null,
        onValidate: ((recall) => true),
    },
    {
        label: 'Read Press Release',
        component: ReadPressRelease,
        onChange: null,
        onValidate: ((recall) => true),
    },
    {
        label: 'Assign Categories',
        component: AssignCategories,
        errorMessage: 'At least one Category must be specified',
        onChange: ((recall, json) => setArray(recall, json, 'categories')),
        onValidate: ((recall) => validateArray(recall, 'categories')),
    },
    {
        label: 'Assign Contaminants',
        component: AssignContaminants,
        onChange: ((recall, json) => setArray(recall, json, 'contaminants')),
        onValidate: ((recall) => true),
    },
    {
        label: 'Assign Allergens',
        component: AssignAllergens,
        onChange: ((recall, json) => setArray(recall, json, 'allergens')),
        onValidate: ((recall) => true),
    },
    {
        label: 'Assign Risk',
        component: AssignRisk,
        errorMessage: 'Risk must be specified',
        onChange: ((recall, json) => setSingle(recall, json, 'risk')),
        onValidate: ((recall) => validateSingle(recall, 'risk')),
    },
    {
        label: 'Determine Who\'s Affected',
        component: AssignAffected,
        onChange: ((recall, json) => setArray(recall, json, 'affected')),
        onValidate: ((recall) => true),
    },
    {
        label: 'Assign Audience',
        component: AssignAudience,
        errorMessage: 'At least one Audience must be specified',
        onChange: ((recall, json) => setArray(recall, json, 'audience')),
        onValidate: ((recall) => validateArray(recall, 'audience')),
    },
    {
        label: 'Set Geographic Impact',
        component: AssignDistribution,
        errorMessage: 'At least one State must be specified',
        onChange: ((recall, json) => setArray(recall, json, 'distribution')),
        onValidate: ((recall) => validateArray(recall, 'distribution')),
    },
    {
        label: 'Final Review',
        component: FinalReview,
        onChange: null,
        onValidate: ((recall) => true),
    },
    {
        label: 'Saving Recall',
        component: SaveRecall,
        onChange: null,
        onValidate: ((recall) => true),
    },
    {
        label: 'Thank you',
        component: ThankYou,
        onChange: null,
        onValidate: ((recall) => true),
    }
];

const FetchStep = 0;
const RecallStartStep = FetchStep + 1;
const FinalReviewStep = ReviewSteps.length - 3;
const SaveStep = ReviewSteps.length - 2;
const ThankYouStep = ReviewSteps.length -1;

const StepperSteps = ReviewSteps.slice(RecallStartStep, SaveStep).map(step => step.label);

class Reviewer extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            recalls: [],
            current: 0,
            total: 0,

            activeStep: 0,
            start: moment(),
            recall: null,

            processed: 0
        }

        this.mounted = false;

        this.handleChange = this.handleChange.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleStep = this.handleStep.bind(this);
        this.moveToRecall = this.moveToRecall.bind(this);
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    moveToRecall(state, next) {
        if (!this.mounted) {
            return;
        }

        const { setErrors, setMessages } = this.context;
        const { recalls } = state;

        setErrors();
        setMessages();

        let nextStep = ThankYouStep;
        if (next == 0 && recalls.length <= 0) {
            nextStep = ThankYouStep;
        }

        else if (next >= recalls.length) {
            nextStep = FetchStep;
        }

        else {
            state.current = next;
            state.start = moment();
            state.recall = recalls[next];
            nextStep = RecallStartStep;
        }

        this.setState(state);
        this.handleStep(nextStep);
    }

    handleChange(json) {
        const { setErrors, setMessages } = this.context;
        let state = this.state;
        let { activeStep, current, recall } = state;
        const step = ReviewSteps[activeStep];

        json = json || {};

        if (activeStep == FetchStep) {
            state.recalls = json.recalls || [];
            state.total = json.total || 0;
            this.moveToRecall(state, 0);
        }

        else if (activeStep == SaveStep) {
            state.processed += 1;
            this.moveToRecall(state, current+1);
        }

        else if (activeStep == ThankYouStep) {
            if (processed > 0) {
                setMessages([`You successfully reviewed ${processed} Recall${processed > 1 ? 's' : ''}`]);
            }
        }

        else if (step.onChange) {
            step.onChange(recall, json);
            setErrors();
            setMessages();

            if (this.mounted) {
                this.setState({
                    recall: recall,
                });
            }
        }
    }

    handleError(error) {
        const { evaluateError } = this.context;
        evaluateError(error);

        if (this.mounted) {
            this.setState({
                activeStep: ThankYouStep,
            });
        }
    }

    handleStep(nextStep) {
        const { setErrors, setMessages } = this.context;
        let { activeStep, recall } = this.state;
        const step = ReviewSteps[activeStep];

        if (nextStep > activeStep && !step.onValidate(recall)) {
            setErrors([step.errorMessage]);
        }

        else {
            setErrors();
            setMessages();

            if (this.mounted) {
                this.setState({
                    activeStep: nextStep,
                });
            }
        }
    }

    render() {
        const { activeStep, current, recall, recalls, start, total } = this.state;
        const { classes } = this.props;
        const step = ReviewSteps[activeStep];

        if (activeStep < RecallStartStep || activeStep >= SaveStep) {
            return (
                <step.component
                    recall={recall}
                    onChange={this.handleChange}
                    onError={this.handleError}
                />
            )
        }

        return (
            <Grid
                container
                alignContent='flex-start'
                direction='column'
                className={classes.container}
            >
                <Grid item xs={12}>
                    <Paper>
                        <RenderRecall
                            current={current}
                            recall={recall}
                            start={start}
                            total={total}
                            expanded={activeStep === RecallStartStep || activeStep === FinalReviewStep}
                            showAll={activeStep === FinalReviewStep} />
                        <ReviewStepper
                            activeStep={activeStep - RecallStartStep}
                            steps={StepperSteps}
                            onStep={(nextStep) => this.handleStep(nextStep + 1)}
                        >
                            <step.component
                                recall={recall}
                                onChange={this.handleChange}
                                onError={this.handleError}
                            />
                        </ReviewStepper>
                    </Paper>
                </Grid>
            </Grid>
        );
    }
}
Reviewer.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(Reviewer);
