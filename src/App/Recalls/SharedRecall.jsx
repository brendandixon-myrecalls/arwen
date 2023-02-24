import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import classNames from 'classnames';
import { isNull } from 'lodash';

import { withStyles } from '@material-ui/styles';

import JoinBlurb from '../Controls/JoinBlurb';
import LocationContext from '../LocationContext';
import { Paths, TOKEN_PATTERN } from '../Routing/Paths';
import Recall from './Recall';
import Progress from '../Utilities/Progress';

const styles = theme => ({
    container: {
        alignItems: 'center',
        color: theme.palette.primary.contrastText,
        flexFlow: 'row wrap',
        justifyContent: 'space-around',
        padding: theme.spacing(3),
    },
    blurb: {
        fontSize: theme.typography.h4.fontSize,
        margin: '0 auto',
        textAlign: 'center',
        width: '60%',
        [theme.breakpoints.down('sm')]: {
            fontSize: theme.typography.h5.fontSize,
            width: '80%',
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: theme.typography.h6.fontSize,
        },
    },
    link: {
        cursor: 'hand',
        fontWeight: 'bold',
    },
    links: {
        color: theme.palette.primary.contrastText,
        fontSize: '0.75em',
        marginBottom: theme.spacing(2),
        textAlign: 'center',
    },
    waiting: {
        textAlign: 'center',
    },
    hide: {
        display: 'none',
    },
});

const ERROR_MESSAGES = [<span>We&apos;re sorry! But the recall is no longer available.</span>];

class SharedRecall extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this.mounted = false;

        this.state = {
            expanded: true,
            recall: null,
            token: null,
            tokenIsValid: true,
        }

        this.fetchRecall = this.fetchRecall.bind(this);
        this.toggleExpanded = this.toggleExpanded.bind(this);
    }

    componentDidMount() {
        const { match } = this.context;

        this.mounted = true;

        const token = ((match || {}).params || {}).token || '';
        const tokenIsValid = token.match(TOKEN_PATTERN);
        this.setState({
            token: token,
            tokenIsValid: tokenIsValid,
        });

        this.fetchRecall(token, tokenIsValid);
    }

    componentWillUnmount() {
        const { host } = this.context;

        this.mounted = false;

        host.cancelAll();
    }

    fetchRecall(token, tokenIsValid) {
        const { evaluateError, host, setErrors } = this.context;

        if (!tokenIsValid) {
            setErrors(ERROR_MESSAGES);
            return;
        }

        host.readRecallByToken(token)
            .then(recall => {
                if (this.mounted) {
                    this.setState({
                        recall: recall,
                    });
                }
            })
            .catch(e => {
                if (this.mounted) {
                    this.setState({
                        tokenIsValid: false,
                    });
                    setErrors(ERROR_MESSAGES);
                }
                else {
                    evaluateError(e);
                }
            });
    }

    toggleExpanded() {
        if (this.mounted) {
            this.setState(state => {
                const { expanded } = state;
                return ({
                    expanded: !expanded
                })
            });
        }
    }

    render() {
        const { user } = this.context;
        const { classes } = this.props;
        const { expanded, recall, token, tokenIsValid } = this.state;

        if (!tokenIsValid) {
            return (<Redirect to={Paths.root} />);
        }

        const shouldSignUp = isNull(user) || user.isGuest;

        return (
            <div className={classes.container}>
                <JoinBlurb
                    className={classNames(shouldSignUp || classes.hide)}
                />
                <div className={classNames(classes.waiting, isNull(token) || isNull(recall) || classes.hide)}>
                    <Progress />
                </div>
                {isNull(recall)
                    ? null
                    : (<Recall
                        expanded={expanded}
                        recall={recall}
                        onClick={this.toggleExpanded} />)}
            </div>
        );
    }
}
SharedRecall.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(SharedRecall);
