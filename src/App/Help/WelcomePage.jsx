import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { withStyles } from '@material-ui/styles';

import { Icons } from '../Routing/Paths';
import LocationContext from '../LocationContext';

const styles = theme => ({
    attention: {
        backgroundColor: theme.palette.primary.main,
        borderRadius: '4px',
        color: theme.palette.primary.contrastText,
        display: 'block',
        fontWeight: 400,
        margin: theme.spacing(1),
        padding: theme.spacing(1),
        textAlign: 'center'
    },
    fauxLink: {
        color: theme.palette.primary.main,
    },
    page: {
        textAlign: 'center',
    },
    hide: {
        display: 'none',
    },
});

class WelcomePage extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
    }

    render() {
        const { className, classes } = this.props;

        return (
            <div className={classNames(classes.page, className)}>
                <p>
                    Congratulations on your new subscription!
                    <span style={{display: 'inline-block'}}>
                        It will help keep and your loved ones safe.
                    </span>
                </p>
                <p>
                    But, before start looking at recalls,
                    you should do
                    one thing: <span className={classes.attention}>Add &apos;alerts@myrecalls.today&apos; to
                    your email contacts</span> This is the address from which you&apos;ll
                    receive alerts. By adding it to your contacts, you make it less likely
                    that important alerts end up in your junk email.
                </p>
                <p>
                    Then, click &ldquo;Next&rdquo; below to review your benefits.
                </p>
                <p>
                    If you don&apos;t have time now, you can revisit these help pages anytime by
                    selecting <span className={classes.fauxLink}>Help</span> from the
                    upper&ndash;left <span className={classes.fauxLink}>Account <i className={Icons.account}></i></span> menu.
                </p>
            </div>
        );
    }
}
WelcomePage.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(WelcomePage);
