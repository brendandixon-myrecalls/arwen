import React from 'react';
import PropTypes from 'prop-types';
import { castArray, cloneDeep } from 'lodash';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/styles';

import {
    FOOD_CONTAMINANTS,
    FOOD_ALLERGENS,
    NORMAL_CATEGORIES,
    REGIONS,
    RISK,
    PUBLIC_SOURCES
} from '../../Common/Constants'
import OptionPanel from '../Controls/OptionPanel';

const styles = theme => ({
    root: {
        maxWidth: 300,
        [theme.breakpoints.up('md')]: {
            maxWidth: 400,
        },
        paddingBottom: '1em',
    },
    actions: {
        marginTop: theme.spacing(2),
        textAlign: 'right',
        '& button':{
            marginRight: theme.spacing(1),
        }
    },
});

const PANELS = [
    { header: 'Allergens', options: FOOD_ALLERGENS, name: 'allergens' },
    { header: 'Categories', options: NORMAL_CATEGORIES, name: 'categories' },
    { header: 'Contaminants', options: FOOD_CONTAMINANTS, name: 'contaminants' },
    { header: 'Regions', options: REGIONS, name: 'distribution' },
    { header: 'Risk', options: RISK, name: 'risk' },
    { header: 'Source', options: PUBLIC_SOURCES, name: 'feedSource' }
]

class RecallFilter extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        filters: PropTypes.objectOf(PropTypes.array),
        onFilter: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.applyFilter = this.applyFilter.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleExpansion = this.handleExpansion.bind(this);

        this.state = {
            openPanel: null,
            filters: props.filters ? cloneDeep(props.filters) : {},
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.filters != this.props.filters) {
            const { filters } = this.props;
            this.setState({
                openPanel: null,
                filters: filters ? cloneDeep(filters) : {},
            });
        }
    }

    applyFilter(event) {
        this.props.onFilter(this.state.filters);
    }

    clearFilter(event) {
        this.props.onFilter({});
    }

    handleChange(json) {
        let { filters } = this.state;
        Object.keys(json).forEach(key => {
            filters[key] = castArray(json[key] || []);
        });
        this.setState({
            filters: filters,
        });
    }

    handleExpansion(panel) {
        this.setState({
            openPanel: this.state.openPanel != panel ? panel : null,
        });
    }

    render() {
        const { classes } = this.props;
        const { openPanel, filters } = this.state;

        return (
            <div className={classes.root}>
                {PANELS.map(panel => (
                    <OptionPanel
                        key={panel.name}
                        open={openPanel == panel.name}
                        panel={panel}
                        values={filters[panel.name] || []}
                        onChange={this.handleChange}
                        onExpansion={this.handleExpansion}
                    />
                ))}
                <div className={classes.actions}>
                    <Button onClick={this.applyFilter} color='primary' variant='contained'>Apply</Button>
                    <Button onClick={this.clearFilter} color='primary' variant='contained'>Remove</Button>
                </div>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(RecallFilter);
