import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import { concat, uniq, without } from 'lodash';
import { AllHtmlEntities } from 'html-entities';

import { Button, Divider, Grid, Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import LocationContext from '../LocationContext';
import Progress from '../Utilities/Progress';
import Scrim from '../Utilities/Scrim';
import VehicleRecall from './VehicleRecall';
import VinNumberControl from '../Controls/VinNumberControl';
import { create as createVehicle } from '../../Common/Vehicle';
import { create as createVin, isVinValid, retrieveVehicleFromVin } from '../../Common/Vin';

const CHECK_VIN = 'Verify VIN';
const SAVE_VIN = 'Save VIN';
const INSTRUCTIONS = {
    needsVin: [`Enter your vehicle&apos;s VIN above.`],
    checkVin: [`Click &apos;${CHECK_VIN}&apos; to verify your VIN with the NHTSA.`],
    saveVin: [
        `The NHTSA recognized your VIN as the vehicle above.`,
        `If this is correct, click &apos;${SAVE_VIN}&apos;. Otherwise, check VIN you entered and try again.`
    ]
}

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        flexGrow: 1,
        fontSize: '1.2rem',
        fontWeight: 300,
        margin: '0 auto',
        maxWidth: 750,
        position: 'relative',
    },
    actionsContainer: {
        paddingLeft: theme.spacing(2),
        textAlign: 'right',
    },
    button: {
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
    disclaimer: {
        backgroundColor: '#EDEDED',
        borderRadius: '4px',
        fontSize: '1.2em',
        marginTop: theme.spacing(1),
        padding: theme.spacing(1),
        textAlign: 'center',
        '& a': {
            color: theme.getCategoryPalette('vehicles').main,
            textDecoration: 'none',
        }
    },
    divider: {
        marginTop: `${theme.spacing(1) * 0.5}`,
    },
    enabled: {
        padding: `${theme.spacing(1)} ${theme.spacing(1)}`,
    },
    paneBottom: {
        borderBottomLeftRadius: '4px',
        borderBottomRightRadius: '4px',
        padding: `0 ${theme.spacing(2)} ${theme.spacing(2)}`,
    },
    paneTop: {
        backgroundColor: theme.getCategoryPalette('vehicles').main,
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        color: theme.getCategoryPalette('vehicles').text,
        padding: `${theme.spacing(2)} ${theme.spacing(1) * 1.5} ${theme.spacing(1)}`,
    },
    progress: {
        color: theme.getCategoryPalette('vehicles').main,
        marginTop: theme.spacing(1),

        '& span': {
            color: theme.palette.text.primary,
            display: 'inline-block',
            fontSize: '1.4em',
            fontWeight: 300,
            lineHeight: '3em',
            marginLeft: '1em',
            marginTop: '0.35em',
            verticalAlign: 'top',
        },
    },
    text: {
        color: theme.palette.text.primary,
        fontSize: '1.4em',
        fontWeight: 300,
        marginTop: theme.spacing(1),
    },
    title: {
        fontSize: '1.6em',
        fontWeight: 600,
    },
    vehicle: {
        color: theme.getCategoryPalette('vehicles').text,
        fontSize: '1.4em',
        fontWeight: 400,
        marginTop: `${theme.spacing(1)}`,
        [theme.breakpoints.up('sm')]: {
            marginTop: `${theme.spacing(1) * 1.5}`,
        },
    },
});


class Vin extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        focus: PropTypes.bool,
        onUpdate: PropTypes.func.isRequired,
        position: PropTypes.number.isRequired,
        recallsPending: PropTypes.bool,
        vin: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this._entities = new AllHtmlEntities();

        this.state = this.unpackProps();

        this.handleResolved = this.handleResolved.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleVinChange = this.handleVinChange.bind(this);
        this.handleVinCheck = this.handleVinCheck.bind(this);

        this.mounted = false;
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentDidUpdate(prevProps) {
        if (this.mounted && this.props.vin != prevProps.vin) {
            this.setState(this.unpackProps())
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    decodeEntities(s) {
        return this._entities.decode(s || '');
    }

    unpackProps() {
        const { vin } = this.props;
        const vehicle = (vin || {}).vehicle || createVehicle();
        const vinNumber = (vin || {}).vin || '';

        const now = moment().utc();
        return {
            // Note:
            // - This allows first-time only VIN editing
            //   Switch to vin.updatedAllowed to enable editing as VINs expire
            canUpdate: !isVinValid(vinNumber) || !vehicle.isValid,
            errorMessage: null,
            needsSave: false,
            needsVinCheck: isVinValid(vinNumber) && !vehicle.isValid,
            recalls: _.sortBy(vin.recalls || [], r => (now.unix() - r.publicationDate.unix())),
            vehicle: vehicle,
            vinNumber: vinNumber,
            waiting: false,
        };
    }

    handleResolved(recall, resolved) {
        const { host, setErrors } = this.context;
        const { onUpdate, vin } = this.props;

        let newVin = createVin(vin);
        if (resolved) {
            newVin.campaigns = uniq(concat(newVin.campaigns, recall.campaignId));
        }
        else {
            newVin.campaigns = without(newVin.campaigns, recall.campaignId);
        }

        this.setState({
            waiting: true,
        })

        host.updateUserVin(newVin)
            .then(() => {
                onUpdate();
            })
            .catch(error => {
                console.log(error);

                if (this.mounted) {
                    setErrors(['Unable to save the VIN']);
                    this.setState({
                        waiting: false
                    });
                }
            });
    }

    handleSave() {
        const { host, setErrors } = this.context;
        const { onUpdate, vin } = this.props;
        const { vehicle, vinNumber } = this.state;

        const newVin = createVin(vin);
        newVin.vin = vinNumber;
        newVin.vehicle = vehicle;

        this.setState({
            waiting: true,
        })

        host.updateUserVin(newVin)
            .then(() => {
                onUpdate();
            })
            .catch(error => {
                console.log(error);

                if (this.mounted) {
                    setErrors(['Unable to save the VIN']);
                    this.setState({
                        waiting: false
                    });
                }
            });
    }

    handleVinChange(vinNumber) {
        if (this.mounted) {
            this.setState({
                needsSave: false,
                needsVinCheck: isVinValid(vinNumber),
                vehicle: createVehicle(),
                vinNumber: vinNumber,
            });
        }
    }

    handleVinCheck() {
        const { vinNumber } = this.state;

        this.setState({
            waiting: true
        });

        retrieveVehicleFromVin(vinNumber)
            .then(vehicle => {
                const success = vehicle.isValid;

                if (this.mounted) {
                    this.setState({
                        errorMessage: success ? '' : 'The NHTSA does not recognize the VIN',
                        needsSave: success,
                        needsVinCheck: !success,
                        vehicle: vehicle,
                        waiting: false,
                    });
                }
            });
    }

    renderRecall(recall) {
        const { classes, vin } = this.props;

        return (
            <Grid
                item
                key={recall.id}
                xs={12}
            >
                <VehicleRecall
                    recall={recall}
                    resolved={vin.isCampaignResolved(recall.campaignId)}
                    onResolved={this.handleResolved}
                />
                <Divider className={classes.divider} />
            </Grid>
        );
    }

    renderVehicle() {
        const { classes } = this.props;
        const { errorMessage, vehicle } = this.state;

        const description = (vehicle.isValid
            ? vehicle.description
            : errorMessage);
        return (<div className={classes.vehicle}>{description}</div>);
    }

    renderHasVin() {
        const { classes, recallsPending, vin } = this.props;
        const { recalls } = this.state;

        if (recalls.length <= 0) {
            if (recallsPending) {
                return (
                    <div className={classNames(classes.text, classes.progress)}>
                        <Progress fontSize='3em' />
                        <span>Recalls for this VIN are being retrieved.</span>
                    </div>
                );
            }
            else if (!vin.reviewed) {
                return (
                    <div className={classes.text}>
                        We were unable to retrieve recalls at this time. Please check again later.
                    </div>
                );
            }

            else if (recalls.length <= 0) {
                return (
                    <div className={classes.text}>The NHTSA has no recalls published for this vehicle</div>
                );
            }
        }

        return (
            <Grid container>
                <Grid
                    item
                    key={`disclaimer-${vin.id}`}
                    xs={12}
                >
                    <div className={classes.disclaimer}>
                        <div>
                            The <a href='https://www.nhtsa.gov'>NHTSA</a> suggests
                            these {`recall${recalls.length > 1 ? 's' : ''}`} <em>may</em> apply.
                        </div>
                        <div>
                            Contact your local dealer to determine those that do.
                         </div>
                    </div>
                </Grid>
                {recalls.map(recall => this.renderRecall(recall))}
            </Grid>
        );
    }

    renderNeedsVin() {
        const { classes } = this.props;
        const { needsSave, needsVinCheck, waiting } = this.state;

        const state = (needsSave
            ? 'saveVin'
            : (needsVinCheck
                    ? 'checkVin'
                    : 'needsVin'));
        const content = INSTRUCTIONS[state];

        return (<React.Fragment>
            <Scrim
                isLocal={true}
                open={waiting}
            />
            <div className={classes.text}>
                {content.map((s, i) => <p key={`${state}-${i}`}>{this._entities.decode(s)}</p>)}
            </div>
            <div className={classes.actionsContainer}>
                <Button
                    className={classes.button}
                    color='primary'
                    disabled={!needsVinCheck}
                    onClick={this.handleVinCheck}
                    size='medium'
                    variant='contained'
                >{CHECK_VIN}</Button>
                <Button
                    className={classes.button}
                    color='primary'
                    disabled={!needsSave}
                    onClick={this.handleSave}
                    size='medium'
                    variant='contained'
                >{SAVE_VIN}</Button>
            </div>
        </React.Fragment>)
    }

    render() {
        const { classes, focus, vin } = this.props;
        const { canUpdate, vinNumber } = this.state;

        const content = (canUpdate
            ? this.renderNeedsVin()
            : this.renderHasVin());

        return (
            <Paper className={classes.root}>
                <div className={classNames(classes.paneTop, canUpdate ? classes.enabled : null)}>
                    <VinNumberControl
                        focus={focus}
                        disabled={!vin.updateAllowed}
                        onChange={this.handleVinChange}
                        vinNumber={vinNumber}
                    />
                    {this.renderVehicle()}
                </div>
                <div className={classes.paneBottom}>
                    {content}
                </div>
           </Paper>
        );
    }
}
Vin.contextType = LocationContext;

export default withStyles(styles, { withTheme: true })(Vin);
