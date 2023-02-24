import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Button, Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import CategoryIcon from './CategoryIcon';
import LocationContext from '../LocationContext';

const styles = theme => ({
    container: {
        marginTop: '1rem',
        minHeight: '25em',
        position: 'relative',
        width: '100%',
    },
    actionsContainer: {
        marginBottom: theme.spacing(1),
        textAlign: 'right',
    },
    iconTop: {
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    },
    bottomPane: {
        borderBottomLeftRadius: '4px',
        borderBottomRightRadius: '4px',
        color: theme.palette.text.primary,
        fontSize: '1.3em',
        marginTop: '2em',
        minHeight: '5em',
        padding: '0 1.5em 0.5em',
        width: '100%',
    },
    topPane: {
        backgroundColor: theme.palette.primary.dark,
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        color: theme.palette.primary.contrastText,
        minHeight: '5em',
        padding: '2.25rem 0.5em 4.25rem',
        position: 'relative',
        width: '100%',
    },
    both: {
        backgroundColor: theme.palette.primary.main,
    },
    discounted: {
        color: theme.palette.secondary.main,
        textDecoration: 'line-through',
    },
    features: {
        fontSize: '1.2em',
        '& ul': {
            margin: '0.5em 0 0',
            padding: '0 0 0 1.2em',
        }
    },
    muted: {
        filter: 'grayscale(100%)',
    },
    price: {
        fontSize: '1.2em',
        fontStyle: 'italic',
        fontWeight: 'bold',
        margin: '0.5em 0 1em 0',
        textAlign: 'center',
    },
    title: {
        fontSize: '2em',
        fontWeight: 'bold',
        lineHeight: '1.6rem',
        textAlign: 'center',
    },
    unavailable: {
        color: theme.palette.secondary.main,
        fontWeight: 'normal',
    },
});

class OfferControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        disabled: PropTypes.bool,
        plan: PropTypes.object.isRequired,
        onComplete: PropTypes.func.isRequired,
    }

    renderIcon() {
        const { classes, disabled, plan } = this.props;

        if (!plan.category) {
            return (<div className={classes.iconTop}>
                <CategoryIcon disabled={disabled} muted={true} image={'/icon-2x.png'} />
            </div>)
        }
        return (<div className={classes.iconTop}>
            <CategoryIcon disabled={disabled} muted={true} category={plan.category} />
        </div>)
    }

    renderPrice() {
        const { classes, disabled, plan } = this.props;

        const price = (plan.hasDiscount && !disabled
            ? <span><span className={classes.discounted}>${plan.price}</span> ${plan.discountPrice}</span>
            : <span>${plan.price}</span>);

        return (<div className={classNames(classes.price, !disabled || classes.unavailable)}>
            Only {price} a year
        </div>
        )
    }

    renderTitle() {
        const { classes, plan } = this.props;

        return (<div className={classes.title}>
            {plan.title}
        </div>)
    }

    render() {
        const { classes, disabled, onComplete, plan } = this.props;

        const isBoth = plan.isForRecalls && plan.isForVehicles;

        return (
            <Paper
                className={classNames(classes.container, !disabled || classes.muted)}
            >
                <div className={classNames(classes.topPane, (!isBoth && !disabled) || classes.both)}>
                    {this.renderIcon()}
                    {this.renderTitle()}
                </div>
                <div className={classes.bottomPane}>
                    <div className={classes.features}>
                        <div>Receive{isBoth ? ' both' : ''}</div>
                        <ul>
                            {plan.features.map((f, i) => <li key={`feature-${i}`}>{f}</li>)}
                        </ul>
                    </div>
                    {this.renderPrice()}
                    <div className={classNames(classes.actionsContainer)}>
                        <Button
                            className={classes.button}
                            color='primary'
                            disabled={disabled}
                            onClick={() => onComplete(plan)}
                            size='medium'
                            variant='contained'
                        >{disabled ? 'Unavailable' : 'Select'}</Button>
                    </div>
                </div>
            </Paper>
        );
    }
}
OfferControl.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(OfferControl);
