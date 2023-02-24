import React from 'react'
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types'

import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import LocationContext from './LocationContext';
import LogoPaper from './Layout/LogoPaper';
import { Paths } from './Routing/Paths';
import Progress from './Utilities/Progress';

const styles = theme => ({
    root: {
    },
});

class SignOut extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this.mounted = false;

        this.state = {
            signedOut: false,
        }
    }

    componentDidMount() {
        const { credentials, setCredentials, setUser } = this.context;

        this.mounted = true;

        if (credentials.isAuthenticated) {
            Promise.resolve()
                .catch((e) => console.log(e))
                .then(() => {
                    if (this.mounted) {
                        this.setState({
                            signedOut: true
                        });
                    }

                    credentials.clearToken();
                    setCredentials(credentials, false);
                    setUser(null);
                })
        }
        else {
            this.setState({
                signedOut: !credentials.isAuthenticated
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        const { signedOut } = this.state;

        if (signedOut) {
            return (
                <Redirect to={Paths.signin} />
            );
        }

        return (
            <LogoPaper
                title='Signing Out'
                variant='h3'
            >
                <Progress />
            </LogoPaper>
        );
    }
}
SignOut.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(SignOut);
