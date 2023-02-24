import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { max, min } from 'lodash';

import { Button, ClickAwayListener, IconButton, MobileStepper } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles } from '@material-ui/styles';

import LocationContext from '../LocationContext';
import LogoPaper from '../Layout/LogoPaper';
import AccountPage from './AccountPage';
import RecallsPage from './RecallsPage';
import VehiclesPage from './VehiclesPage';
import WelcomePage from './WelcomePage';

const styles = theme => ({
    actionsContainer: {
        marginTop: theme.spacing(2),
        textAlign: 'right',
    },
    buttonBack: {
        marginRight: theme.spacing(1),
    },
    buttonNext: {
        marginLeft: theme.spacing(1),
    },
    close: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(10),
        zIndex: theme.zIndex.appBar - 1,
    },
    closeIcon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing(1),
    },
    main: {
        position: 'absolute',
        top: theme.spacing(3),
        zIndex: theme.zIndex.appBar - 1,
        [theme.breakpoints.up(400 + theme.spacing(3) * 2)]: {
            left: '50%',
            transform: 'translateX(-50%)',
        },
    },
    page: {
        fontSize: '1.8rem',
        margin: '0 auto',
        width: '94%',
    },
    stepper: {
        backgroundColor: theme.palette.background.paper,
        margin: '0 auto -1em',
        flexGrow: 1,
    },
    hide: {
        display: 'none',
    },
});

const TITLES = [
    {
        title: 'Welcome',
        variant: 'h2',
    },
    {
        title: 'Recalls Subscription',
        variant: 'h4',
    },
    {
        title: 'Vehicles Subscription',
        variant: 'h4',
    },
    {
        title: 'Managing Your Account',
        variant: 'h4',
    },
];

class HelpControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
        open: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this.state = {
            activePage: 1,
            showWelcome: false,
        }

        this.mounted = false;

        this.handleBack = this.handleBack.bind(this);
        this.handleNext = this.handleNext.bind(this);

        this.prepareOpen = this.prepareOpen.bind(this);
    }

    componentDidMount() {
        this.mounted = true;
        this.prepareOpen();
    }

    componentDidUpdate(prevProps) {
        const { open } = this.props;
        if (prevProps.open != open && open) {
            this.prepareOpen();
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    prepareOpen() {
        const { needsWelcome } = this.context;

        const showWelcome = needsWelcome();
        this.setState({
            activePage: showWelcome ? 0 : 1,
            showWelcome: showWelcome,
        });
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
    }

    handleBack(event) {
        this.setState(state => {
            const { showWelcome } = state;
            return ({
                activePage: max([state.activePage - 1, (showWelcome ? 0 : 1)])
            });
        });
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
        event.stopPropagation();
    }

    handleNext(event) {
        this.setState(state => {
            return ({
                activePage: min([state.activePage+1, TITLES.length-1])
            });
        });
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
        event.stopPropagation();
    }

    render() {
        const { classes, onClose, open } = this.props;
        const { activePage, showWelcome } = this.state;

        const stepTitle = TITLES[activePage];
        return (
            <div onClick={event => event.stopPropagation()}>
                <LogoPaper
                    alignment='center'
                    className={classNames(classes.main, open || classes.hide)}
                    title={stepTitle.title}
                    variant={stepTitle.variant}
                    wide={true}
                >
                    <IconButton
                        className={classes.close}
                        onClick={onClose}
                    >
                        <CloseIcon className={classes.closeIcon} />
                    </IconButton>

                    <WelcomePage
                        className={classNames(classes.page, activePage == 0 || classes.hide)}
                        onClose={onClose}
                    />
                    <RecallsPage
                        className={classNames(classes.page, activePage == 1 || classes.hide)}
                        onClose={onClose}
                    />
                    <VehiclesPage
                        className={classNames(classes.page, activePage == 2 || classes.hide)}
                        onClose={onClose}
                    />
                    <AccountPage
                        className={classNames(classes.page, activePage == 3 || classes.hide)}
                        onClose={onClose}
                    />

                    <MobileStepper
                        activeStep={activePage - (showWelcome ? 0 : 1)}
                        className={classes.stepper}
                        position='static'
                        steps={TITLES.length - (showWelcome ? 0 : 1)}
                        variant='dots'
                        backButton={
                            <Button
                                className={classes.buttonBack}
                                disabled={activePage <= (showWelcome ? 0 : 1)}
                                onClick={this.handleBack}
                            >
                                <KeyboardArrowLeft />
                                Back
                        </Button>
                        }
                        nextButton={
                            <Button
                                className={classes.buttonNext}
                                disabled={activePage >= TITLES.length - 1}
                                onClick={this.handleNext}
                            >
                                Next
                            <KeyboardArrowRight />
                            </Button>
                        }
                    />
                </LogoPaper>
            </div>
        );
    }
}
HelpControl.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(HelpControl);
