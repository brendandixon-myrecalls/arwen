import React from 'react';
import PropTypes from 'prop-types';

import { Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import LocationContext from '../LocationContext';
import PreferencesControl from '../Controls/PreferencesControl';
import Scrim from '../Utilities/Scrim';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        margin: '2em auto',
        padding: theme.spacing(3),
        textAlign: 'left',
        width: '80%',
        [theme.breakpoints.up('xs')]: {
            width: '90%',
        },
        [theme.breakpoints.up('sm')]: {
            width: '80%',
        },
        [theme.breakpoints.up('md')]: {
            width: '60%',
        },
        [theme.breakpoints.up('lg')]: {
            width: '50%',
        },
    },
    title: {
        color: theme.palette.primary.contrastText,
        fontSize: theme.typography.h2.fontSize,
        [theme.breakpoints.down('sm')]: {
            fontSize: theme.typography.h3.fontSize,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: theme.typography.h4.fontSize,
        },
        textAlign: 'center',
    },
});

class Preferences extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this.mounted = false;

        this.state = {
            waiting: false,
        };

        this.handleComplete = this.handleComplete.bind(this);
        this.handleWait = this.handleWait.bind(this);
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleComplete() {
        const { evaluateError, host, setErrors, setMessages, setUser } = this.context;

        host.readUser()
            .then(user => {
                setMessages(['Changes saved!']);
                setUser(user);
                this.handleWait(false);
            })
            .catch(e => {
                console.log(e);
                if (!evaluateError(e)) {
                    setErrors('Unable to save preferences. Try again later.');
                }
                this.handleWait(false);
            });
    }

    handleWait(waiting) {
        if (this.mounted) {
            this.setState({
                waiting: waiting,
            });
        }
    }

    render() {
        const { user } = this.context;
        const { classes } = this.props;
        const { waiting } = this.state;

        return (
            <React.Fragment>
                <div className={classes.title}>
                    Your Settings
                </div>
                <Paper
                    className={classes.root}
                >
                    <Scrim
                        isLocal={true}
                        open={waiting}
                    />
                    <PreferencesControl
                        onComplete={this.handleComplete}
                        onWait={this.handleWait}
                        preference={user.preference}
                    />
                </Paper>
            </React.Fragment>
        )
    }
}
Preferences.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(Preferences);
