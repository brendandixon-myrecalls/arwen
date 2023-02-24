import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import classNames from 'classnames';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { withStyles } from '@material-ui/styles';

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};

const variants = ['success', 'warning', 'error', 'info'];

const stylesContent = theme => ({
    success: {
        color: theme.palette.primary.contrastText,
        backgroundColor: green[600],
    },
    error: {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.dark,
    },
    warning: {
        color: theme.palette.primary.contrastText,
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing(1),
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
});

function AlertContent(props) {
    const { classes, className, messages, onClose, variant, ...other } = props;
    const Icon = variantIcon[variant];

    return (
        <SnackbarContent
            className={classNames(classes[variant], className)}
            aria-describedby="client-snackbar"
            message={
                <React.Fragment>
                    <span id="client-snackbar" className={classes.message}>
                        <Icon className={classNames(classes.icon, classes.iconVariant)} />
                        {!messages || messages.length <= 1
                        ? (messages ||  [])[0]
                        : (<ul>
                            {messages.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>)}
                    </span>
                </React.Fragment>
            }
            action={[
                <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    className={classes.close}
                    onClick={onClose}
                >
                    <CloseIcon className={classes.icon} />
                </IconButton>,
            ]}
            {...other}
        />
    );
}

AlertContent.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    className: PropTypes.string,
    message: PropTypes.node,
    onClose: PropTypes.func,
    variant: PropTypes.oneOf(variants).isRequired,
};

const AlertContentWrapper = withStyles(stylesContent, { withTheme: true })(AlertContent);

const stylesAlert = theme => ({
    margin: {
        margin: theme.spacing(1),
    },
});

class Alert extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        messages: PropTypes.arrayOf(PropTypes.node),
        variant: PropTypes.oneOf(variants).isRequired,
    }

    constructor(props) {
        super(props)

        this.mounted = false;

        this.state = {
            currentVersion: -1,
            prevVersion: -1,
        }

        this.handleClose = this.handleClose.bind(this);
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentDidUpdate(prevProps) {
        const props = this.props;
        if (!isEmpty(props.messages) && prevProps.messages != props.messages) {
            this.setState(state => {
                return ({
                    currentVersion: state.currentVersion + 1
                });
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleClose(event, reason) {
        if (reason === 'clickaway') {
            return;
        }

        this.setState(state => {
            return ({
                prevVersion: state.currentVersion
            });
        });
    };

    render() {
        const { classes, messages, variant } = this.props;
        const { currentVersion, prevVersion } = this.state;

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                className={classes[variant]}
                open={!isEmpty(messages) && currentVersion > prevVersion}
                autoHideDuration={variant == 'success' || variant == 'info' ? 3000 : 5000}
                onClose={this.handleClose}
            >
                <AlertContentWrapper
                    className={classes.margin}
                    messages={messages}
                    onClose={this.handleClose}
                    variant={variant}
                />
            </Snackbar>
        );
    }
}

export default withStyles(stylesAlert, { withTheme: true })(Alert);
