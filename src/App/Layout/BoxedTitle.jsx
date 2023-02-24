import { isEmpty } from 'lodash';

import { withStyles } from '@material-ui/styles';

import TitleLogo from './TitleLogo';

const styles = theme => ({
    box: {
        backgroundColor: theme.palette.primary.main,
        borderRadius: '4px',
        display: 'inline-block',
        padding: '0.7rem',
        width: '16rem',
    },
    logo: {
        width: '100%',
    },
});

const BoxedTitle = ({
    classes={},
    className = '',
    style = {},
}) =>
    <div className={isEmpty(className) ? classes.box : className} style={style}>
        <TitleLogo className={classes.logo} />
    </div>

export default withStyles(styles)(BoxedTitle);
