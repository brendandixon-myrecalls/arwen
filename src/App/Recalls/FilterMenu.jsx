import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Fab, Popover } from '@material-ui/core';
import { FilterList } from '@material-ui/icons';
import { withStyles } from '@material-ui/styles';

import LocationContext from '../LocationContext';
import RecallFilter from './RecallFilter';

const styles = theme => ({
    root: {
        position: 'fixed',
        right: theme.spacing(1),
        top: 64 + theme.spacing(2),
        zIndex: theme.zIndex.appBar - 2,
    },
    menu: {
        minWidth: 220,
        zIndex: theme.zIndex.appBar,
    },
    hide: {
        display: 'none',
    },
});

class FilterMenu extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        filters: PropTypes.object,
        onClose: PropTypes.func.isRequired,
        onFilter: PropTypes.func.isRequired,
        onOpen: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            anchorEl: null
        }

        this.handleFilter = this.handleFilter.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
    }

    handleFilter(filters = {}) {
        this.props.onFilter(filters);
        this.handleToggle();
    }

    handleToggle(anchorEl) {
        const { onClose, onOpen } = this.props;
        this.setState({
            anchorEl: anchorEl,
        });
        Boolean(anchorEl) ? onOpen() : onClose();
    }

    renderFilter() {
        const { classes, filters } = this.props;
        const { anchorEl } = this.state;

        return (
            <Popover
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                className={classes.menu}
                open={Boolean(anchorEl)}
                onClose={() => this.handleToggle()}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <RecallFilter
                    filters={filters}
                    onFilter={this.handleFilter}
                />
            </Popover>
        );
    }

    render() {
        const { classes } = this.props;

        return (
            <React.Fragment>
                {this.renderFilter()}
                <Fab
                    className={classNames(classes.root)}
                    color='primary'
                    onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.handleToggle(event.currentTarget);
                    }}
                    size='medium'
                >
                    <FilterList fontSize='large' />
                </Fab>
            </React.Fragment>
        );
    }
}
FilterMenu.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(FilterMenu);
