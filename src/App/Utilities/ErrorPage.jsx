import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Paper, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import BoxedTitle from '../Layout/BoxedTitle';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        fontSize: '2rem',
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

        '& a': {
            color: theme.palette.primary.main,
        }
    },
    closing: {
        margin: '1rem 0',
        textAlign: 'center'
    },
    title: {
        fontWeight: 400,
        marginBottom: '3rem',
        textAlign: 'center'
    },
});

const NEWLINE_REGEX = /[\n\r]+/gi
const NEWLINE = '%0D%0A';
const variants = ['fatal', 'error', 'warning'];

class ErrorPage extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        errors: PropTypes.arrayOf(PropTypes.string),
        // stack: P
        variant: PropTypes.oneOf(variants),
    }

    render() {
        const { classes, className, errors, stack } = this.props;

        if (!errors || errors.length <= 0) {
            return null;
        }

        const error = `${errors.join(', ')}${NEWLINE}${(stack || '').replace(NEWLINE_REGEX, NEWLINE)}`
        const mailBody = `Hi!${NEWLINE}${NEWLINE}Sadly, while using myRecalls, I received the following error:${NEWLINE}${NEWLINE}${error}`
        const mailLink = `mailto:help@myrecalls.today?subject=myRecalls Application Failed&body=${mailBody}`

        return (
            <Paper className={classNames(classes.root, className)}>
                <Typography className={classes.title} variant='h4'>
                    Despite our best efforts and testing, something is not working correctly.
                </Typography>
                <p>
                    We really apologize for the inconvenience.
                    It may help to re&ndash;open this page in your web browser.
                </p>
                <p>
                    If you&apos;ve ended up here after re&ndash;opening this page, please send mail
                    to our staff at <a href={mailLink}>help@myrecalls.today.</a>
                </p>
                <div className={classes.closing}>
                    <div>Thank you for using</div>
                    <BoxedTitle />
                </div>
            </Paper>
        );
    }
}

export default withStyles(styles, { withTheme: true })(ErrorPage);
