import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

import { withStyles } from '@material-ui/styles';

import { getCategoryIcon } from '../../Common/Constants';

const DEFAULT_FONT_SIZE = '2.4rem';

const styles = theme => ({
    root: {
        height: '2em',
        width: '2em',
        position: 'relative',
    },
    centered: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    },
    icon: {
        color: theme.palette.text.primary,
        position: 'absolute',
        zIndex: 2,
    },
    inner: {
        borderRadius: '50%',
        height: '87%',
        width: '87%',
        position: 'absolute',
        zIndex: 1,
    },
    outer: {
        backgroundColor: theme.palette.background.paper,
        borderRadius: '50%',
        height: '100%',
        width: '100%',
        position: 'relative',
        zIndex: 0,
    },
    disabled: {
        filter: 'grayscale(100%)',
    },
});

class CategoryIcon extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        category: PropTypes.string,
        disabled: PropTypes.bool,
        image: PropTypes.string,
        muted: PropTypes.bool,
        fontSize: PropTypes.string,
    }

    render() {
        const { classes, category, disabled, fontSize, image, muted, theme } = this.props;

        const icon = getCategoryIcon(category);
        const palette = theme.getCategoryPalette(category);
        const backgroundColor = (muted
            ? theme.palette.secondary.light
            : palette.light);

        return (
            <div
                className={classNames(classes.root, !disabled || classes.disabled)}
                style={{ fontSize: fontSize || DEFAULT_FONT_SIZE }}
            >
                <div className={classes.outer}></div>
                {(isEmpty(image)
                    ? (<React.Fragment>
                        <div className={classNames(classes.inner, classes.centered)} style={{ backgroundColor: backgroundColor }}></div>
                        <i className={classNames(icon, classes.icon, classes.centered)}></i>
                    </React.Fragment>)
                    : <img src={image} className={classNames(classes.inner, classes.centered)}></img>)}
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(CategoryIcon);
