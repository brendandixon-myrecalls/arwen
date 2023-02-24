import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { assign, isNull } from 'lodash';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@material-ui/core/';
import { withStyles } from '@material-ui/styles';

import AppContext from '../AppContext';
import ErrorBoundary from '../Utilities/ErrorBoundary';
import LocationContext from '../LocationContext';

import MenuBar from './MenuBar';
import { Paths } from '../Routing/Paths';
import TitleLogo from './TitleLogo';

const styles = theme => ({
    root: {
        position: 'relative',
    },
    expired: {
        padding: 0,
    },
    expiredTitle: {
        backgroundColor: theme.palette.error.dark,
        color: theme.palette.error.contrastText,
        fontSize: '2.2rem',
        padding: theme.spacing(2),
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    link: {
        textDecoration: 'none',
    },
});

class MainLayout extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        // component: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        match: PropTypes.object,
        path: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props);

        this.mounted = false;

        this.state = {
            version: moment().valueOf(),
        }
    }


    componentDidMount() {
        this.mounted = true;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.mounted) {
            return;
        }

        // Note:
        // - A version change reflects a change in the active user
        //   and forces rendering
        const { user } = this.context;
        const version = isNull(user) ? moment().valueOf() : user.id;

        if (prevState.version != version) {
            this.setState({
                version: version
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    renderExpired() {
        const { handleRemindLater, isExpired } = this.context;
        const { classes, path } = this.props;

        return (
            <Dialog
                open={!path.startsWith(Paths.subscriptions) && isExpired()}
                onClose={this.handleRemindLater}
            >
                <DialogTitle
                    classes={{ root: classes.expired }}
                    disableTypography={true}
                >
                    <div className={classes.expiredTitle}>
                        Your <TitleLogo style={{ width: '5em', marginBottom: '-0.1925em' }} /> Subscription has Expired
                    </div>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Your subscription to myRecalls has expired.
                        You no longer have access to the latest recalls nor
                        will you receive alerts about new recalls.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color='secondary'
                        onClick={handleRemindLater}
                    >Remind Me Later</Button>
                    <Button
                        className={classes.actionButton}
                        color='primary'
                        component={Link}
                        onClick={this.handleRenew}
                        to={Paths.subscriptions}
                    >Renew Now</Button>
                </DialogActions>
            </Dialog>
        );
    }

    render() {
        const { classes, location, match, path } = this.props;
        const { version } = this.state;

        return (
            <LocationContext.Provider value={assign({ location: location, match: match, path: path }, this.context)}>
                <div
                    key={version}
                    className={classes.root}
                    onClick={event => {
                        event.stopPropagation();
                    }}
                >
                    <MenuBar>
                        <ErrorBoundary>
                            <this.props.component />
                        </ErrorBoundary>
                    </MenuBar>
                </div>
                {this.renderExpired()}
            </LocationContext.Provider>
        ); 
    }
}
MainLayout.contextType = AppContext;

export default withStyles(styles, { withTheme: true })(MainLayout);
