import { AllHtmlEntities } from 'html-entities'
import React from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'

import Link from '@material-ui/core/Link';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';

import { AFFECTED, AUDIENCE, NORMAL_CATEGORIES, FOOD_ALLERGENS, ALL_CONTAMINANTS, RISK, STATES, TERRITORIES } from '../../Common/Constants'
import { joinBy } from '../../Common/Core'

import PressRelease from './PressRelease';
import ReviewTimer from './ReviewTimer';

const styles = theme => ({
    details: {
        fontSize: '1.6rem',
        marginTop: theme.spacing(1),
        paddingTop: 0,
    },
    term: {
        fontSize: theme.typography.body1.fontSize,
        fontWeight: 'bold',
        marginBottom: 0,
    },
    definition: {
        fontSize: theme.typography.body1.fontSize,
        margin: 0,
        marginBottom: theme.spacing(1),
        padding: 0,
    }
});

const HEAD_WHITELIST = [
    'title',
    'description',
]

const BODY_WHITELIST = [
    'publicationDate',
    'categories',
    'contaminants',
    'allergens',
    'risk',
    'affected',
    'audience',
    'distribution',
]

const ALL_WHITELIST = [...HEAD_WHITELIST, ...BODY_WHITELIST]

class RenderRecall extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        current: PropTypes.number.isRequired,
        expanded: PropTypes.bool,
        recall: PropTypes.object.isRequired,
        start: PropTypes.object.isRequired,
        total: PropTypes.number.isRequired,
        showAll: PropTypes.bool
    }

    constructor(props) {
        super(props)

        this.state = {
            expanded: Boolean(props.expanded)
        }

        this._entities = new AllHtmlEntities();

        this.onChange = this.onChange.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.expanded != prevProps.expanded) {
            this.setState({
                expanded: this.props.expanded
            });
        }
    }

    onChange() {
        this.setState({
            expanded: !this.state.expanded
        })
    }

    transformField(field, values) {
        let content = this.props.recall[field]
        if (!content) {
            return ''
        }
        content = Array.isArray(content) ? content : [content]
        return this._entities.decode(joinBy(content.map(v => values.find(value => value.value === v).label)))
    }

    renderField(field) {
        const { recall } = this.props;
        switch (field) {
            case 'affected': return this.transformField(field, AFFECTED)
            case 'allergens': return this.transformField(field, FOOD_ALLERGENS)
            case 'audience': return this.transformField(field, AUDIENCE)
            case 'categories': return this.transformField(field, NORMAL_CATEGORIES)
            case 'contaminants': return this.transformField(field, ALL_CONTAMINANTS)
            case 'description': return (
                <React.Fragment>
                    {this._entities.decode(recall[field] || '')}
                </React.Fragment>
            )
            case 'distribution': return this.transformField(field, [...STATES, ...TERRITORIES])
            case 'publicationDate': return moment(recall[field]).format('LLLL')
            case 'risk': return this.transformField(field, RISK)
            default: return this._entities.decode(recall[field] || '')
        }
    }

    render() {
        const { classes, current, recall, showAll, start, total } = this.props;
        const { expanded } = this.state;
        let whitelist = showAll ? ALL_WHITELIST : HEAD_WHITELIST
        let terms = whitelist.map(field => {
            if ((['allergens'].includes(field) && recall.canHaveAllergens) ||
                (['contaminants'].includes(field) && recall.actsAsContaminable) ||
                !(['allergens', 'contaminants'].includes(field))) {
                let v = recall[field]
                let count = !Array.isArray(v) || v.length <= 1
                    ? ''
                    : ` (${v.length} values)`;
                return (
                    <React.Fragment key={field}>
                        <dt className={classes.term}>{field.split('_').map(s => _.capitalize(s)).join(' ')}{count}</dt>
                        <dd className={classes.definition}>{this.renderField(field)}</dd>
                    </React.Fragment>
                )
            }
            else {
                return ''
            }
        })
        return (
            <ExpansionPanel expanded={expanded} onChange={this.onChange}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant='h6' style={{width: '100%', postion: 'relative'}}>
                        <Typography variant='body2' style={{position: 'absolute', top: 2, right: 2}}>
                            <ReviewTimer current={current} start={start} total={total} />
                        </Typography>
                        Recall Details
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                    <div>
                        <dl className={classes.details}>{terms}</dl>
                        <PressRelease recall={recall} />
                    </div>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }
}

export default withStyles(styles, { withTheme: true })(RenderRecall);
