import React from 'react';
import PropTypes from 'prop-types';

import { matchPath } from 'react-router';

import { AppBar, Toolbar } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import AccountMenu from './AccountMenu';
import HelpControl from '../Help/HelpControl';
import LocationContext from '../LocationContext';
import Logo from './Logo';
import MenuBarButton from './MenuBarButton';
import { Routes } from '../Routing/Routes';
import Scrim from '../Utilities/Scrim';
import TitleLogo from './TitleLogo';

const styles = theme => ({
    appBar: {
        '& a': {
            fontSize: '2.6rem',
            textDecoration: 'none',
        },
        '& button': {
            fontSize: '2.6rem',
            margin: '0.1em 0 0 0.1em',
        },
    },
    children: {
        padding: 0,
        position: 'relative',
    },
    grow: {
        flex: '1 1 auto',
    },
    logo: {
        margin: 'auto auto',
        width: '4.2em',
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    titleLogo: {
        margin: '0.4em auto 0.8em auto',
        width: '15em',
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
    toolbar: theme.mixins.toolbar,
    hide: {
        display: 'none',
    },
});

class MenuBar extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        disabled: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this.state = {
            accountOpen: false,
            mainItems: [],
        }

        this.handleAccountToggle = this.handleAccountToggle.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    componentDidMount() {
        const { needsHelp, needsWelcome, wantsHelp } = this.context;

        // Note:
        // - Hack to reduce mounting
        wantsHelp(needsHelp(), needsWelcome());

        this.setState({
            mainItems: this.buildMenuItems('main'),
        });
    }

    buildMenuItems(menu) {
        return _.compact(Routes.map(route => {
            if (!route.path.startsWith('/sign') && route.menu === menu) {
                return route.asMenuItem;
            }
            else {
                return null;
            }
        })).sort((a, b) => a.order < b.order ? -1 : a.order > b.order ? 1 : 0);
    }

    isItemDisabled(item) {
        const { credentials, user } = this.context;
        return (this.isActivePath(item.path) || !credentials.isAuthenticated);
    }

    handleAccountToggle(open) {
        this.setState({
            accountOpen: open,
        });
    }

    handleClose(event) {
        const { needsHelp, wantsHelp } = this.context;

        if (needsHelp()) {
            wantsHelp(false);
        }

        if (event) {
            event.stopPropagation();
        }
    }

    isActivePath(p) {
        return matchPath(this.context.location.pathname, {path: p, exact: true}) != null;
    }

    renderMenu() {
        const { mainItems } = this.state;

        return (<React.Fragment>{
            mainItems.map(item => {
                return (<MenuBarButton
                    disabled={this.isItemDisabled(item)}
                    icon={<i className={item.icon}></i>}
                    key={item.label}
                    label={item.label}
                    path={item.path}
                />);
            })
        }</React.Fragment>);

    }

    render() {
        const { needsHelp } = this.context;
        const { children, classes } = this.props;
        const { accountOpen } = this.state;

        const showHelp = needsHelp();
        return (
            <div onClick={this.handleClose}>
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <Logo className={classes.logo} />
                        <TitleLogo className={classes.titleLogo} />
                        <div className={classes.grow}></div>
                        <div>
                            {this.renderMenu()}
                            <AccountMenu
                                onClose={() => this.handleAccountToggle(false)}
                                onOpen={() => this.handleAccountToggle(true)}
                            />
                        </div>
                    </Toolbar>
                </AppBar>
                <div className={classes.toolbar} style={{ width: '100%' }} />
                <div className={classes.children}>
                    {children}
                    <Scrim
                        hasToolbar={true}
                        open={accountOpen || showHelp}
                    />
                    <HelpControl
                        onClose={this.handleClose}
                        open={showHelp}
                    />
                </div>
            </div>
        );
    }
}
MenuBar.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(MenuBar);
