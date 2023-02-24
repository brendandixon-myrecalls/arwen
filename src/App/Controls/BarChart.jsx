import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty, maxBy, round } from 'lodash';

import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    root: {
        fontFamily: theme.typography.fontFamily,
        fontWeight: 400,
        [theme.breakpoints.up('sm')]: {
            fontWeight: 300,
        },
    },
    bar: {
        position: 'relative',
    },
    value: {
        borderRadius: '4px',
        color: theme.palette.primary.contrastText,
        fontSize: '2rem',
        margin: '0 0.4rem 0.4rem',
        overflow: 'hidden',
        padding: "0.9rem 0.6rem",
        position: 'relative',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        width: '100%',
        zIndex: 1,

        '& span': {
            fontSize: '1.4rem',
            fontWeight: 300,
            [theme.breakpoints.up('md')]: {
                fontWeight: 300,
            },
        },
    },
    // Inverted *must* follow value to give it CSS precedence
    inverted: {
        backgroundColor: 'transparent',
        position: 'absolute',
        color: theme.palette.text.primary,
        zIndex: 0,
    },
});

class BarChart extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        data: PropTypes.arrayOf(PropTypes.shape({
            value: PropTypes.number.isRequired,
            color: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        }).isRequired).isRequired,
        style: PropTypes.object,
    }

    renderBar(value, label, color, width) {
        const { classes } = this.props;
        const text = <div>{label} <span>({value > 0 ? value : 'No'} Recalls)</span></div>;
        return (<div className={classes.bar} key={label}>
            <div className={`${classes.value} ${classes.inverted}`}>{text}</div>
            <div className={classes.value} style={{ backgroundColor: color, width: width }}>{text}</div>
        </div>);    }

    render() {
        const { classes, data, style, theme } = this.props;

        if (isEmpty(data)) {
            return (<div className={classes.root} style={style}>
                {this.renderBar(0, '', theme.palette.primary.main, '0%')}
            </div>);
        }

        const max = maxBy(data, d => d.value).value;
        const widths = data.map(d => max > 0 ? `${round((d.value / max) * 100)}%` : '0%')
        return (<div className={classes.root} style={style}>{
            data.map((d, i) => {
                return this.renderBar(d.value, d.label, d.color, widths[i]);
            })
        }</div>);
    }
}

export default withStyles(styles, { withTheme: true })(BarChart);
