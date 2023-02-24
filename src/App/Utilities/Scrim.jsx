import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    root: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        top: 0,
        left: 0,
        zIndex: theme.zIndex.appBar - 1,
    },
    effect: {
        backgroundColor: 'black',
        opacity: '0.75',
    },
    toolbar: {
        paddingTop: theme.spacing(12),
    },
    hide: {
        display: 'none',
    },
});

class Scrim extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        hasToolbar: PropTypes.bool,
        isLocal: PropTypes.bool,
        onClick: PropTypes.func,
        onScroll: PropTypes.func,
        open: PropTypes.bool,
    }

    render() {
        const { children, classes, hasToolbar, isLocal, onClick, onScroll, open } = this.props;

        return (
            <div
                className={classNames(
                    classes.root,
                    classes.effect,
                    !hasToolbar || classes.toolbar,
                    open || classes.hide)}
                style={{ position: isLocal ? 'absolute' : 'fixed'}}
                onClick={onClick}
                onScroll={onScroll}
            >
                {children}
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(Scrim);
