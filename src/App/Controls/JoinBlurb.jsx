import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Link } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import LocationContext from '../LocationContext';
import { SignupLink } from '../Routing/Links';
import TitleLogo from '../Layout/TitleLogo';

const styles = theme => ({
    root: {
        fontSize: theme.typography.h5.fontSize,
        margin: `0 auto ${theme.spacing(1)}`,
        textAlign: 'center',
        width: '55%',
        [theme.breakpoints.down('sm')]: {
            fontSize: theme.typography.h6.fontSize,
            width: '98%',
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: theme.typography.h7.fontSize,
        },
    },
    link: {
        cursor: 'hand',
        fontWeight: 'bold',
    },
    links: {
        color: theme.palette.primary.contrastText,
        fontSize: '0.8em',
        marginTop: theme.spacing(1),
        textAlign: 'center',
    },
    hide: {
        display: 'none',
    },
});

class JoinBlurb extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        blurbOnly: PropTypes.bool,
    }

    render() {
        const { classes, className, blurbOnly } = this.props;

        return (
            <div className={classNames(classes.root, className)}>
                <TitleLogo style={{ width: '5em', marginBottom: '-0.1925em' }} /> delivers timely
                notifications of product and vehicle recalls to keep you and your family safe.
                <div className={classNames(classes.links, !blurbOnly || classes.hide)}>
                    Click <Link
                        component={SignupLink}
                        className={classes.link} >here</Link> to join now!
                    </div>
            </div>
        );
    }
}
JoinBlurb.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(JoinBlurb);
