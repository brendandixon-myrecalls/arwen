import React from 'react';
import PropTypes from 'prop-types';
import { AllHtmlEntities } from 'html-entities';
import classNames from 'classnames';

import { Button, Checkbox, FormControlLabel } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

const DATE_FORMAT = 'MMMM D, YYYY';

const VinCheckbox = withStyles(theme => ({
    root: {
        color: theme.palette.grey['500'], // theme.getCategoryPalette('vehicles').main,
        '&$checked': {
            color: theme.getCategoryPalette('vehicles').main,
        }
    },
    checked: {},
}), { withTheme: true })(props => <Checkbox color='default' {...props} />);

const styles = theme => ({
    root: {
        color: theme.palette.text.primary,
        flexGrow: 1,
        fontSize: '1.2rem',
        fontWeight: 300,
        maxWidth: 750,
        position: 'relative',
    },
    actions: {
        right: '0.5em',
        top: '0.2em',
        position: 'absolute',

        '& button': {
            color: theme.getCategoryPalette('vehicles').main,
        },
    },
    label: {
        display: 'inline-block',
        fontSize: '0.8em',
        marginLeft: '-4px',
    },
    links: {
        color: theme.palette.text.primary,
        fontSize: '1.3em',
        paddingTop: '1em',

        '& a': {
            color: theme.getCategoryPalette('vehicles').light,
            textDecoration: 'none',
        },
    },
    details: {
        borderRadius: '4px',
        paddingTop: theme.spacing(1),
        position: 'relative',
    },
    paneBottom: {
        width: '100%',
    },
    paneTop: {
        width: '100%',
    },
    text: {
        color: theme.palette.text.primary,
        fontSize: '1.3em',
        fontWeight: 400,
        letterSpacing: '0.05em',
        lineHeight: '1.4em',
        [theme.breakpoints.up('md')]: {
            fontWeight: 300,
        },
    },
    title: {
        color: theme.getCategoryPalette('vehicles').main,
        fontSize: '1.6em',
        fontWeight: 600,
        letterSpacing: '0.05em',
        marginTop: `${theme.spacing(1) * 1.5}`,
    },
    unresolved: {
        borderRadius: '4px',
        backgroundColor: '#9D2929',
        color: theme.palette.primary.contrastText,
        fontSize: '1.6em',
        fontWeight: 'bold',
        marginBottom: `-${theme.spacing(1)}`,
        marginTop: theme.spacing(1),
        padding: theme.spacing(1),
        textAlign: 'center',
    },
    hide: {
        display: 'none',
    },
});

class VehicleRecall extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        expanded: PropTypes.bool,
        onResolved: PropTypes.func.isRequired,
        recall: PropTypes.object.isRequired,
        resolved: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this.state = {
            expanded: props.expanded || false
        }

        this._entities = new AllHtmlEntities();

        this.handleExpand = this.handleExpand.bind(this);
        this.handleResolved = this.handleResolved.bind(this);
    }

    handleExpand() {
        const { expanded } = this.state;
        this.setState({
            expanded: !expanded
        });
    }

    handleResolved(event) {
        const { onResolved, recall } = this.props;
        onResolved(recall, event.target.checked);
    }

    renderTop() {
        const { classes, recall } = this.props;

        return (
            <div className={classes.text}>
                {this._entities.decode(recall.consequence)}
            </div>
        );
    }

    renderBottom() {
        const { classes, recall } = this.props;
        const { expanded } = this.state;

        return (
            <div
                className={classNames(classes.paneBottom, expanded || classes.hide) }
            >
                <div className={classes.title}>Summary</div>
                <div className={classes.text}>
                    {this._entities.decode(recall.summary)}
                </div>
                <div className={classes.title}>Remedy</div>
                <div className={classes.text}>
                    {this._entities.decode(recall.remedy)}
                </div>
                <div className={classes.links}>
                    Read the <a href={recall.link} target='_blank'>NHTSA Notice ({recall.campaignId})</a>
                </div>
            </div>
        );
    }

    render() {
        const { classes, recall, resolved } = this.props;
        const { expanded } = this.state;

        return (
            <React.Fragment>
                <div className={classNames(classes.unresolved, !resolved || classes.hide)}>
                    Attention Needed
                </div>
                <div className={classes.root}>
                    <div className={classes.actions}>
                        <Button
                            onClick={this.handleExpand}
                            variant='text'
                        >{expanded ? 'Less' : 'More'}</Button>
                    </div>
                    <div className={classes.title}>
                        <div className={classNames(!resolved || classes.hide)}>
                            <FormControlLabel
                                classes={{ label: classes.label }}
                                control={
                                    <VinCheckbox
                                        checked={resolved}
                                        name={`resolved-${recall.id}`}
                                        onChange={this.handleResolved}
                                        value={1}
                                    />
                                }
                                label={(<span>I&apos;ve contacted my dealer</span>)}
                            />
                        </div>
                        {recall.publicationDate ? recall.publicationDate.format(DATE_FORMAT) : 'Unknown'}
                    </div>
                    <div className={classes.details}>
                        {this.renderTop()}
                        {this.renderBottom()}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default withStyles(styles, { withTheme: true })(VehicleRecall);
