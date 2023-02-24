import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    root: {
        alignItems: 'left',
        color: theme.palette.primary.contrastText,
        fontSize: '1.1em',
        margin: '0 auto',
        width: '80%',
        [theme.breakpoints.down('sm')]: {
            fontSize: '1em',
            width: '100%',
        },
        '& li': {
            marginBottom: 0,
        },
        '& ul': {
            margin: `${theme.spacing(1)} 0 0 ${theme.spacing(1)}`,
            paddingLeft: theme.spacing(1),
        },
    },
    hide: {
        display: 'none',
    },
});

export const QUALIFICATIONS = [
    <span>Recalls come from public government sources which determines both their timeliness and accuracy.</span>,
    <span>Alerts are delivered on a &ldquo;best effort&rdquo; basis. Email availability and delivery may affect timeliness.</span>,
    <span>NHTSA product recalls limited to carseats and tires. NHTSA vehicle recalls are based on vehicle make, model, and year.</span>
]

class Qualifications extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
    }

    render() {
        const { classes, className } = this.props;

        return (
            <div className={classNames(classes.root, className)}>
                <ul>
                    {QUALIFICATIONS.map((q, i) => <li key={`qualification-${i}`}>{q}</li>)}
                </ul>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(Qualifications);
