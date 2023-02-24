import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { CircularProgress } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    root: {
        color: theme.palette.primary.main,
        fontSize: '5.5rem',
    },
});

class Progress extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        color: PropTypes.string,
        fontSize: PropTypes.string,
        thickness: PropTypes.number,
    }

    render() {
        const { color, fontSize, thickness } = this.props;

        return (
            <CircularProgress
                color={color || 'primary'}
                size={fontSize || '5em' }
                thickness={thickness || 2.6}
            />
        );

        // const { classes, fontSize } = this.props;
        // const style=(fontSize ? {fontSize: fontSize} : {});

        // // Or 'fal fa-spinner fa-pulse'
        // return (<i
        //     className={classNames('fal fa-circle-notch fa-spin', classes.root)}
        //     style={style}></i>);
    }
}

export default withStyles(styles, { withTheme: true })(Progress);
