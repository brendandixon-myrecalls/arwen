import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

import { Link } from 'react-router-dom';

import { IconButton } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    label: {
        color: theme.palette.text.contrastText,
        display: 'block',
        fontSize: '1.4rem !important',
        marginTop: '-0.7em',
        textDecoration: 'none',
    },
    root: {
        display: 'inline-block',
        fontFamily: theme.typography.fontFamily,
        fontSize: '1rem',
        margin: '-0.8rem 0 auto 4.4rem',
        textAlign: 'center',
        [theme.breakpoints.up('lg')]: {
            marginLeft: '6.4rem',
        },
        [theme.breakpoints.down('sm')]: {
            marginLeft: '3.2rem',
        },
        [theme.breakpoints.down('xs')]: {
            marginLeft: '1.2rem',
        },
    },
    hide: {
        display: 'none',
    },
});

class MenuBarButton extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        disabled: PropTypes.bool,
        icon: PropTypes.object,
        label: PropTypes.string,
        onClick: PropTypes.func,
        path: PropTypes.string,
    }

    render() {
        const { classes, disabled, icon, label, onClick, path } = this.props;

        const iconProps = (isEmpty(path)
            ? { onClick: onClick }
            : { to: path, component: Link });
        const linkProps = (isEmpty(path)
            ? { onClick: onClick, href: "#" }
            : { href: path });

        return (<div className={classes.root}>
            <IconButton
                color='inherit'
                disabled={disabled}
                {...iconProps}
            >
                {icon}
            </IconButton>
            <a className={classNames(classes.label, !disabled || classes.hide)}  {...linkProps}>{label}</a>
            <span className={classNames(classes.label, disabled || classes.hide)}>{label}</span>
        </div>);
    }
}

export default withStyles(styles, { withTheme: true })(MenuBarButton);
