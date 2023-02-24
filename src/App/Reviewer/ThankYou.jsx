import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    root: {
        textAlign: 'center',
        width: '100%'
    },
});

class ThankYou extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        messages: PropTypes.arrayOf(PropTypes.string)
    }

    render() {
        const { classes, messages } = this.props;
        const finalStatus = (messages && messages.length > 0
            ? <Typography variant='body1'>{messages.join(' ')}</Typography>
            : null);

        return (
            <div className={classes.root}>
                <Typography variant='h5'>Thank you!</Typography>
                <Typography variant='body1'>
                    No more Recalls require a review.
                 </Typography>
                 {finalStatus}
                <Typography variant='body1'>
                    Thank you for your time and assistance.
                 </Typography>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(ThankYou);
