import React from 'react';
import PropTypes from 'prop-types';
import { compact } from 'lodash';
import classNames from 'classnames';

import { Link } from 'react-router-dom';

import { Menu, MenuItem, MenuList } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import LocationContext from '../LocationContext';
import MenuBarButton from './MenuBarButton';
import { Paths, Icons } from '../Routing/Paths';
import { Routes } from '../Routing/Routes';

const styles = theme => ({
    root: {
        zIndex: theme.zIndex.modal + 10,
        '& a': {
            color: theme.palette.text.primary,
            textDecoration: 'none',
            '& li': {
                fontSize: '1.8rem',
                fontWeight: 300,
            },
        },
    },
    hide: {
        display: 'none',
    },
});

const ITEMS = compact(Routes.map(route => {
    return (route.menu == 'account'
        ? route.asMenuItem
        : null);
})).sort((a, b) => a.order < b.order ? -1 : a.order > b.order ? 1 : 0);

class AccountMenu extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
        onOpen: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            anchorEl: null,
            items: []
        }

        this.handleToggle = this.handleToggle.bind(this);
        this.raiseHelp = this.raiseHelp.bind(this);
    }

    componentDidMount() {
        const { user } = this.context;
        const { classes } = this.props;

        const items = ITEMS.map(item => {
            return (
                <Link
                    className={classNames(item.authorizer(user) || classes.hide)}
                    key={item.label}
                    to={item.path}
                >
                    <MenuItem button>{item.label}</MenuItem>
                </Link>
            )
        });

        this.setState({
            items: items,
        });
    }

    handleToggle(anchorEl) {
        const { onClose, onOpen } = this.props;
        this.setState({
            anchorEl: anchorEl,
        });
        Boolean(anchorEl) ? onOpen() : onClose();
    }

    raiseHelp() {
        const { wantsHelp } = this.context;
        wantsHelp(true);
        this.handleToggle(null);
    }

    render() {
        const { credentials, match } = this.context;
        const { classes } = this.props;
        const { anchorEl, items } = this.state;

        const token = ((match || {}).params || {}).token;

        return (
            <React.Fragment>
                <MenuBarButton
                    icon={<i className={Icons.account}></i>}
                    label='Account'
                    onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.handleToggle(event.currentTarget);
                    }}
                />
                <Menu
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    classes={{ paper: classes.root }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorEl)}
                    onClose={() => this.handleToggle(null)}
                >
                    <MenuList>
                        {items}
                        <Link
                            key='help'
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                this.raiseHelp();
                            }}
                        >
                            <MenuItem button>Help</MenuItem>
                        </Link>
                        <Link
                            className={classNames(!credentials.isAuthenticated || classes.hide)}
                            key='signin'
                            to={`${Paths.signin}${token}`}
                        >
                            <MenuItem button>Sign In</MenuItem>
                        </Link>
                        <Link
                            className={classNames(credentials.isAuthenticated || classes.hide)}
                            key='signout'
                            to={Paths.signout}
                        >
                            <MenuItem button>Sign Out</MenuItem>
                        </Link>
                    </MenuList>
                </Menu>
            </React.Fragment>
        );
    }
}
AccountMenu.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(AccountMenu);
