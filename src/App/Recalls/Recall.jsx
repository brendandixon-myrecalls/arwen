import React from 'react';
import PropTypes from 'prop-types';
import { AllHtmlEntities } from 'html-entities';
import moment from 'moment';
import classNames from 'classnames';
import {
    FacebookIcon,
    FacebookShareButton,
    TwitterIcon,
    TwitterShareButton,
    EmailIcon,
    EmailShareButton,
} from 'react-share';
import { castArray, compact, isEmpty, truncate } from 'lodash';

import { Button, Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import CategoryIcon from '../Controls/CategoryIcon';
import {
    getSourceLabel,
    labelFor,
    mapStatesToRegions,
    AFFECTED,
    AUDIENCE,
    NORMAL_CATEGORIES,
    ALL_CONTAMINANTS,
    FOOD_ALLERGENS,
    REGIONS,
    RISK
} from '../../Common/Constants';
import LocationContext from '../LocationContext';

const SHORT_TITLE_LENGTH = 120;

const styles = theme => ({
    root: {
        color: theme.palette.text.primary,
        flexGrow: 1,
        fontSize: '1.2rem',
        fontWeight: 300,
        margin: '0 auto',
        maxWidth: 750,
        position: 'relative',
    },
    iconBottom: {
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translate(-50%, -50%)',
    },
    iconTop: {
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    },
    paneBottom: {
        borderBottomLeftRadius: '4px',
        borderBottomRightRadius: '4px',
        color: theme.palette.primary.contrastText,
        fontSize: '1.3em',
        marginTop: '2.45rem',
        minHeight: '5em',
        padding: '3rem 1em 0.5em',
        position: 'relative',
        width: '100%',

        '& .actions': {
            right: '0.5em',
            top: 0,
            position: 'absolute',

            '& button': {
                color: theme.palette.primary.contrastText,
            },
        },

        '& .summary': {
            lineHeight: '1.4em',
        },

        '&.expanded': {
            color: theme.palette.text.primary,
            paddingTop: 0,

            '& .actions': {
                top: '-1em',
            },

            '& .links': {
                fontSize: '1em',
                padding: '0 0 0.5em',
                position: 'relative',

                '& a': {
                    textDecoration: 'none',
                },
            },

            '& .description': {
                letterSpacing: '0.05em',
                lineHeight: '1.4em',
                padding: '1.2em 0',
            },

            '& .summary': {
            },
        },
    },
    paneTop: {
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        marginBottom: '2.45rem',
        minHeight: '5em',
        padding: '0.5em 0.5em 0',
        position: 'relative',
        width: '100%',
        '&.expanded': {
            color: theme.palette.primary.contrastText,
            paddingBottom: '2.45rem'
        }
    },
    recallDate: {
        display: 'inline-block',
        fontSize: '1.1em',
        padding: '0.2em 0 0 0.5em',
        textAlign: 'left',
        width: '50%',

        '&.expanded': {
            color: 'inherit',
        },
    },
    social: {
        display: 'inline-block',
        height: theme.spacing(3),
        position: 'absolute',
        right: '0.5em',
        whiteSpace: 'nowrap',

        [theme.breakpoints.down('xs')]: {
            display: 'block',
            position: 'static',
        },
    },
    socialButton:{
        cursor: 'hand',
        display: 'inline-block',
        marginLeft: '0.25em',
        verticalAlign: 'middle',
    },
   socialText: {
    },
    title: {
        fontSize: '1.4em',
        fontWeight: 400,
        letterSpacing: '0.05em',
        padding: '0.5em 0.5em',
        textAlign: 'center',
        [theme.breakpoints.up('md')]: {
            fontWeight: 300,
        },
    },
    hide: {
        display: 'none',
    },
});

class Recall extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        expanded: PropTypes.bool,
        recall: PropTypes.object.isRequired,
        onClick: PropTypes.func,
        onClose: PropTypes.func,
    }

    constructor(props) {
        super(props)

        this._entities = new AllHtmlEntities();

        this.handleClick = this.handleClick.bind(this);
        this.handleShare = this.handleShare.bind(this);
    }

    handleClick(event) {
        const { raiseAnalyticsEvent } = this.context;
        const { expanded, recall, onClick } = this.props;
        if (!expanded) {
            raiseAnalyticsEvent('Recalls', 'Expanded', recall.id);
        }
        onClick(event);
    }

    handleShare(target) {
        const { raiseAnalyticsEvent } = this.context;
        const { recall } = this.props;
        raiseAnalyticsEvent('Recalls', `Shared ${target}`, recall.id);
    }

    transformField(field, values) {
        const content = castArray(this.props.recall[field])
        if (isEmpty(content)) {
            return ''
        }

        const labels = compact(content.map(v => {
            const o = values.find(value => value.value == v);
            if (!o) {
                return null;
            }
            return o.label;
        })).join(', ');
        return this._entities.decode(labels);
    }

    renderDate() {
        const { classes, expanded, recall } = this.props;

        return (<div>
            <div className={classNames(classes.recallDate, !expanded || 'expanded')}>
                {recall.publicationDate.format('LL')}
            </div>
        </div>)
    }

    renderField(field) {
        const { expanded, recall } = this.props;
        switch (field) {
            case 'affected': return this.transformField(field, AFFECTED);
            case 'allergens': return this.transformField(field, FOOD_ALLERGENS);
            case 'audience': return this.transformField(field, AUDIENCE);
            case 'categories': return this.transformField(field, NORMAL_CATEGORIES);
            case 'contaminants': return this.transformField(field, ALL_CONTAMINANTS);
            case 'description': return (
                <React.Fragment>
                    {this._entities.decode(recall[field] || '')}
                </React.Fragment>
            );
            case 'distribution':
                const distribution = mapStatesToRegions(recall[field]);
                return (distribution.length == REGIONS.length
                    ? 'Nationwide'
                    : distribution.join(', '));
            case 'feedSource': return getSourceLabel(recall['feedSource']);
            case 'publicationDate': return moment(recall[field]).format('LL');
            case 'risk': return labelFor(recall[field], RISK);
            case 'title': {
                let title = recall[field] || '';
                if (!expanded) {
                    title = truncate(recall[field], { length: SHORT_TITLE_LENGTH, omission: '&hellip;' });
                }
                return this._entities.decode(title);
            }
            default: return this._entities.decode(recall[field] || '');
        }
    }

    renderProperty(title, value, titleColor='#FFFFFF') {
        return (<div><span style={{color: titleColor}}>{title}</span>: {value}</div>)
    }

    renderTop() {
        const { classes, expanded, recall, theme } = this.props;

        const category = recall.preferredCategory;
        const palette = theme.getCategoryPalette(category);

        if (expanded) {
            return (
                <div
                    className={classNames(classes.paneTop, 'expanded')}
                    style={{ backgroundColor: palette.main }}
                >
                    {this.renderDate()}
                    <div className={classes.iconTop}>
                        <CategoryIcon category={category} />
                    </div>
                    <div className={classes.title}>
                        {this.renderField('title')}
                    </div>
                </div>
            );
        }

        else {
            return (
                <div
                    className={classes.paneTop}
                >
                    {this.renderDate()}
                    <div className={classes.title}>
                        {this.renderField('title')}
                    </div>
                </div>
            );
        }

    }

    renderBottom() {
        const { classes, expanded, recall, theme } = this.props;

        const category = recall.preferredCategory;
        const palette = theme.getCategoryPalette(category);
        const categoryColor = palette.main;

        if (expanded) {
            return (
                <div className={classNames(classes.paneBottom, 'expanded')}>
                    <div className='summary'>
                        {this.renderProperty('Health Risk', this.renderField('risk'), categoryColor)}
                        {this.renderProperty('Categories', this.renderField('categories'), categoryColor)}
                        {isEmpty(recall.allergens)
                            ? null
                            : this.renderProperty('Allergens', this.renderField('allergens'), categoryColor)}
                        {isEmpty(recall.contaminants)
                            ? null
                            : this.renderProperty('Contaminants', this.renderField('contaminants'), categoryColor)}
                        {this.renderProperty('Affected Regions', this.renderField('distribution'), categoryColor)}
                        {this.renderProperty('Recalling Agency', this.renderField('feedSource'), categoryColor)}
                        {this.renderProperty('Effective', this.renderField('publicationDate'), categoryColor)}
                    </div>
                    <div className='description'>
                        {this.renderField('description')}
                    </div>
                    <div className='links'>
                        Read the <a href={recall.link} target='_blank' style={{ color: categoryColor }}>PRESS RELEASE</a>
                        <div className={classes.social}>
                            <span className={classes.socialText}>Share this Recall</span>
                            <FacebookShareButton
                                beforeOnClick={() => this.handleShare('Facebook')}
                                className={classes.socialButton}
                                hashtag={'#myrecalls'}
                                quote={this.renderField('title')}
                                url={recall.shareLink}
                            >
                                <FacebookIcon size={theme.spacing(3)} round={true} />
                            </FacebookShareButton>
                            <TwitterShareButton
                                beforeOnClick={() => this.handleShare('Twitter')}
                                className={classes.socialButton}
                                hashtags={['myrecalls']}
                                title={this.renderField('title')}
                                url={recall.shareLink}
                            >
                                <TwitterIcon size={theme.spacing(3)} round={true} />
                            </TwitterShareButton>
                            <EmailShareButton
                                beforeOnClick={() => this.handleShare('Email')}
                                className={classes.socialButton}
                                subject={this.renderField('title')}
                                body={`You may find this recall interesting.`}
                                url={recall.shareLink}
                            >
                                <EmailIcon size={theme.spacing(3)} round={true} />
                            </EmailShareButton>
                        </div>
                    </div>
                    <div className='actions'>
                        <Button
                            onClick={this.handleClick}
                            style={{ color: categoryColor }}
                            variant='text'
                        >Less</Button>
                    </div>
                </div>
            );
        }

        else {
            return (
                <div
                    className={classes.paneBottom}
                    style={{ backgroundColor: categoryColor }}
                >
                    <div className={classes.iconBottom}>
                        <CategoryIcon category={category} />
                    </div>
                    <div className='summary'>
                        {this.renderProperty('Health Risk', this.renderField('risk'))}
                        {isEmpty(recall.allergens)
                            ? null
                            : this.renderProperty('Allergens', this.renderField('allergens'))}
                        {isEmpty(recall.contaminants)
                            ? null
                            : this.renderProperty('Contaminants', this.renderField('contaminants'))}
                        {this.renderProperty('Recalling Agency', this.renderField('feedSource'))}
                    </div>
                    <div className='actions'>
                        <Button
                            onClick={this.handleClick}
                            variant='text'
                        >More</Button>
                    </div>
                </div>
            );
        }
    }

    render() {
        const { classes } = this.props;

        return (
            <Paper className={classes.root}>
                {this.renderTop()}
                {this.renderBottom()}
            </Paper>
        );
    }
}
Recall.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(Recall);
