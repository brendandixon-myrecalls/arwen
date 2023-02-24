import React from 'react'
import PropTypes from 'prop-types'

import Link from '@material-ui/core/Link';
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    root: {
    },
});

class PressRelease extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        recall: PropTypes.object.isRequired
    }

    render() {
        return (
            <Link href={this.props.recall.link} target='_blank'>Press Release</Link>
        )
    }
}

export default withStyles(styles, { withTheme: true })(PressRelease);
