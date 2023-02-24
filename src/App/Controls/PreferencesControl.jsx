import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isEmpty, isEqual } from 'lodash';

import { Button } from '@material-ui/core'
import { withStyles } from '@material-ui/styles';

import { load as loadPreference } from '../../Common/Preference';

import NotificationsControl from '../Controls/NotificationsControl';
import CategoryControl from '../Controls/CategoryControl'
import LocationContext from '../LocationContext';
import RegionControl from '../Controls/RegionControl';

const styles = theme => ({
    actions: {
        textAlign: 'right',
    },
    actionButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
});

class PreferencesControl extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        onComplete: PropTypes.func.isRequired,
        onWait: PropTypes.func.isRequired,
        preference: PropTypes.object.isRequired,
        saveRequired: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this.mounted = false;

        const { preference } = props;

        this.state = {
            alertByEmail: preference.alertByEmail,
            alertByPhone: preference.alertByPhone,
            sendSummaries: preference.sendSummaries,

            audience: preference.audience,
            categories: preference.categories,
            distribution: preference.distribution,
            risk: preference.risk,

            alertForVins: preference.alertForVins,
            sendVinSummaries: preference.sendVinSummaries,

            categoriesReady: false,
            distributionReady: false,
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleNotifications = this.handleNotifications.bind(this);

        this.isChanged = this.isChanged.bind(this);

        this.savePreferences = this.savePreferences.bind(this);
    }

    componentDidMount() {
        const { user } = this.context;
        const { categories, distribution } = this.state;

        this.mounted = true;

        this.setState({
            categoriesReady: !user.hasRecallSubscription || !isEmpty(categories),
            distributionReady: !user.hasRecallSubscription || !isEmpty(distribution),
        })
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleChange(valueField, readyField) {
        return (value, ready) => {
            this.setState({
                [valueField]: value,
                [readyField]: ready,
            });
        }
    }

    handleNotifications(values) {
        this.setState({
           alertByEmail: values.alertByEmail,
           alertByPhone: values.alertByPhone,
           sendSummaries: values.sendSummaries,
           alertForVins: values.alertForVins,
           sendVinSummaries: values.sendVinSummaries,
        });
    }

    isChanged() {
        const { preference, saveRequired } = this.props;
        const {
            alertByEmail,
            alertByPhone,
            sendSummaries,
            categories,
            distribution,
            alertForVins,
            sendVinSummaries } = this.state;

        return (
            saveRequired ||
            preference.alertByEmail != alertByEmail ||
            preference.alertByPhone != alertByPhone ||
            preference.sendSummaries != sendSummaries ||
            preference.alertForVins != alertForVins ||
            preference.sendVinSummaries != sendVinSummaries ||
            !isEqual(preference.categories.sort(), categories.sort()) ||
            !isEqual(preference.distribution.sort(), distribution.sort()));
    }

    savePreferences() {
        const { evaluateError, host } = this.context;
        const { onComplete, onWait } = this.props;

        const preference = loadPreference(this.state);

        onWait(true);
        host.updateUserPreference(preference)
            .then(() => {
                onComplete();
            })
            .catch(e => {
                console.log(e);
                onWait(false);
                evaluateError(e);
            });
    }

    render() {
        const { user } = this.context;
        const { classes, saveRequired } = this.props;
        const {
            alertByEmail,
            alertByPhone,
            sendSummaries,
            categories,
            distribution,
            alertForVins,
            sendVinSummaries,
            categoriesReady,
            distributionReady } = this.state;

        const isChanged = this.isChanged();
        const isReady = categoriesReady && distributionReady;

        return (
            <React.Fragment>
                <NotificationsControl
                    alertByEmail={alertByEmail}
                    alertByPhone={alertByPhone}
                    sendSummaries={sendSummaries}
                    alertForVins={alertForVins}
                    sendVinSummaries={sendVinSummaries}
                    onChange={this.handleNotifications}
                />

                <CategoryControl
                    categories={categories}
                    disabled={!user.hasRecallSubscription}
                    required={user.hasRecallSubscription}
                    onChange={this.handleChange('categories', 'categoriesReady')}
                />

                <RegionControl
                    disabled={!user.hasRecallSubscription}
                    distribution={distribution}
                    required={user.hasRecallSubscription}
                    onChange={this.handleChange('distribution', 'distributionReady')}
                />

                <div className={classes.actions}>
                    <Button
                        className={classNames(classes.actionButton, !saveRequired || classes.hide)}
                        color='primary'
                        disabled={!isChanged}
                        variant='contained'
                        onClick={this.loadPreferences}
                    >Reset</Button>
                    &nbsp;
                    <Button
                        className={classes.actionButton}
                        color='primary'
                        disabled={!isChanged || !isReady}
                        variant='contained'
                        onClick={this.savePreferences}
                    >Save</Button>
                </div>
            </React.Fragment>
        );
    }
}
PreferencesControl.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(PreferencesControl);
