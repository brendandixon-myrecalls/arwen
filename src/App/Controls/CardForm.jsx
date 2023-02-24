import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { promisify } from 'util';
import { isEmpty } from 'lodash';

import { CardElement, injectStripe } from 'react-stripe-elements';

import { Button, FormControl } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import LocationContext from '../LocationContext';
import StripeError, { IsStripeError } from '../Utilities/StripeError';

const styles = theme => ({
    container: {
        display: 'block',
    },
    actionsContainer: {
        marginTop: theme.spacing(2),
        textAlign: 'right',
    },
    card: {
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.body1.fontSize,
        fontWeight: 'normal',
    }
});

const MAXIMUM_RETRY_ATTEMPTS = 5;
const setTimeoutPromise = promisify(setTimeout);

class CardForm extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        address: PropTypes.shape({
            line1: PropTypes.string,
            line2: PropTypes.string,
            city: PropTypes.string,
            state: PropTypes.string,
            zip: PropTypes.string,
        }),
        disabled: PropTypes.bool,
        focus: PropTypes.bool,
        onPurchase: PropTypes.func.isRequired,
        onWait: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            cardReady: false,
        }

        this.createToken = this.createToken.bind(this);
        this.handlePurchase = this.handlePurchase.bind(this);
    }

    componentDidMount() {
    }

    createToken() {
        const { user } = this.context;
        const { address, stripe } = this.props;

        return stripe.createToken({
                name: user.fullName,
                address_line1: address.line1,
                address_line2: address.line2,
                address_city: address.city,
                address_state: address.state,
                address_zip: address.zip
            })
            .then(result => {
                result = result || {};
                if (!isEmpty(result.token)) {
                    return result.token;
                }
                else {
                    throw new StripeError(result.error);
                }
            })
    }

    handlePurchase() {
        const { setErrors } = this.context;
        const { onPurchase, onWait } = this.props;

        onWait(true);

        let p = this.createToken();
        for (let i=0; i < MAXIMUM_RETRY_ATTEMPTS; i++) {
            p = p.catch(e => {
                    if (IsStripeError(e) && e.shouldRetry) {
                        return setTimeoutPromise(i * 500)
                            .then(() => this.createToken());
                    }
                    throw e;
                });
        }

        p.then(token => onPurchase(token))
            .catch(error => {
                console.log(error);
                setErrors(IsStripeError(error) && error.isUserError
                    ? error.messages
                    : 'Unable to complete purchase.');
                onWait(false);
            });
    }

    render() {
        const { classes, disabled, focus } = this.props;
        const { cardReady } = this.state;

        return (
            <FormControl className={classes.container} component='fieldset'>
                <CardElement
                    className={classes.card}
                    hidePostalCode={true}
                    onChange={(event) => this.setState({ cardReady: event.complete })}
                    onReady={(el) => {
                        if (focus && !disabled) {
                            el.focus();
                        }
                    }}
                />
                <div className={classes.actionsContainer}>
                    <Button
                        color='primary'
                        disabled={!cardReady || disabled}
                        size='medium'
                        variant='contained'
                        onClick={this.handlePurchase}
                    >Purchase</Button>
                </div>
            </FormControl>
        );
    }
}
CardForm.contextType = LocationContext;

export default injectStripe(withStyles(styles, { withTheme: true })(CardForm));
