import React from 'react';
import PropTypes from 'prop-types';
import { assign } from 'lodash';

import { withStyles } from '@material-ui/styles';

import AppContext from '../AppContext';
import ErrorBoundary from '../Utilities/ErrorBoundary';
import LocationContext from '../LocationContext';

const styles = theme => ({
    root: {
        position: 'relative',
    },
});

class PlainLayout extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        // component: PropTypes.object.isRequired,
        // filterComponent: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        match: PropTypes.object,
        path: PropTypes.string.isRequired,
    }

    render() {
        const { classes, location, match, path } = this.props;

        return (
            <LocationContext.Provider value={assign({ location: location, match: match, path: path }, this.context)}>
                <div className={classes.root}>
                    <ErrorBoundary>
                        <this.props.component
                            location={location}
                            path={path}
                        />
                    </ErrorBoundary>
                </div>
            </LocationContext.Provider>
        ); 
    }    
}
PlainLayout.contextType = AppContext;

export default withStyles(styles, { withTheme: true })(PlainLayout);
