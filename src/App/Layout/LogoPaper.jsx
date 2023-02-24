import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { clone, isEmpty } from 'lodash';

import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/styles';

import BoxedTitle from './BoxedTitle';
import LocationContext from '../LocationContext';
import Scrim from '../Utilities/Scrim';

const styles = theme => ({
    main: {
        width: 'auto',
        display: 'block', // Fix IE 11 issue.
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(400 + theme.spacing(3) * 2)]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
        paddingTop: theme.spacing(1),
        position: 'relative',
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
    },
    boxTitle: {
        marginBottom: '-1.8rem',
        position: 'relative',
        textAlign: 'center',
        transform: 'translate(0, -50%)',
        width: '100%',
        zIndex: theme.zIndex.appBar - 2,
    },
    wide: {
        [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
            width: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    hide: {
        display: 'none'
    },
});

class LogoPaper extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        alignment: PropTypes.oneOf(['center', 'left', 'justified', 'right']),
        color: PropTypes.string,
        title: PropTypes.string,
        variant: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
        waiting: PropTypes.bool,
        wide: PropTypes.bool,
    }

    render() {
        const { children, classes, className, color, theme, alignment, title, variant, waiting, wide } = this.props;

        let style = clone(theme.typography[variant || 'h3'] || {});
        style.color = color || theme.palette.text.primary;
        style.textAlign = alignment || 'left';

        return (
            <main className={classNames(classes.main, !wide || classes.wide, className)}>
                <Scrim
                    open={waiting}
                />
                <Paper className={classes.paper}>
                    <div className={classes.boxTitle}>
                        <BoxedTitle />
                    </div>
                    <div
                        className={classNames(!isEmpty(title) || classes.hide)}
                        style={style}
                    >
                        {title || ''}
                    </div>
                    {children}
                </Paper>
            </main>
        );
    }
}
LogoPaper.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(LogoPaper);
