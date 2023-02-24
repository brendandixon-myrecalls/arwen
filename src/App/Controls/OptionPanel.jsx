import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { withStyles } from '@material-ui/styles';

import OptionsControl from '../Controls/OptionsControl';

const styles = theme => ({
    actions: {
        marginTop: theme.spacing(2),
        textAlign: 'right'
    },
    details: {
        display: 'block',
    },
    icon: {
        color: theme.palette.primary.main,
        fontSize: '1.5rem',
        marginLeft: theme.spacing(1),
        marginTop: '0.1em',
    },
    summary: {
        fontFamily: theme.typography.fontFamily,
        fontSize: '1.5rem',
        fontWeight: theme.typography.fontWeight,
        minHeight: 0,
    },
    hide: {
        display: 'none',
    },
});

class OptionPanel extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        open: PropTypes.bool,
        panel: PropTypes.shape({
                header: PropTypes.string.isRequired,
                options: PropTypes.arrayOf(
                    PropTypes.shape({
                        label: PropTypes.string.isRequired,
                        value: PropTypes.oneOfType([
                            PropTypes.string,
                            PropTypes.arrayOf(PropTypes.string),
                        ]).isRequired,
                    }).isRequired
                ).isRequired,
                name: PropTypes.string.isRequired
            }).isRequired,
        values: PropTypes.arrayOf(PropTypes.string),
        onChange: PropTypes.func.isRequired,
        onExpansion: PropTypes.func.isRequired,
    }

    render() {
        const { classes, open, panel, values, onChange, onExpansion } = this.props;

        const icon = (<div className={classNames(classes.icon, values.length > 0 || classes.hide)}>
            <i className='far fa-check'></i>
        </div>)

        return (
            <ExpansionPanel 
                expanded={open}
                onChange={() => onExpansion(panel.name)}>
                <ExpansionPanelSummary
                    classes={{ root: classes.summary }}
                    expandIcon={<i className='fal fa-angle-up'></i>}
                >
                    {panel.header}{icon}
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                    <OptionsControl
                        values={values}
                        name={panel.name}
                        options={panel.options}
                        onChange={onChange}
                    />
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    }
}

export default withStyles(styles, { withTheme: true })(OptionPanel);
