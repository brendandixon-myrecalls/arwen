import { isEmpty } from 'lodash';

class StripeError extends Error {
    constructor(error) {
        super(error, stripeError);

        this.error = error;
        this.stripeError = stripeError || {};

        this._messages = [];
        if (!isEmpty(this.stripeError.message)) {
            this._messages = [this.stripeError.message];
        }

        if (this.isFatal) {
            console.log(`Unrecoverable Stripe Error -- ${this}`);
        }
    }

    get messages() { return this._messages.length > 0 ? this._messages : ['Unknown Stripe Error'] }

    get isFatal() { return !this.shouldRetry; }
    get isUserError() { return this.isCardError; }

    get shouldRetry() { return this.isConnectionError || this.isRateLimitError; }

    get isConnectionError() { return this.isStripeErrorType('api_connection_error'); }
    get isApiError() { return this.isStripeErrorType('api_error'); }
    get isAuthenticationError() { return this.isStripeErrorType('authentication_error'); }
    get isCardError() { return this.isStripeErrorType('card_error'); }
    get isIdempotencyError() { return this.isStripeErrorType('idempotency_error'); }
    get isInvalidRequestError() { return this.isStripeErrorType('invalid_request_error'); }
    get isRateLimitError() { return this.isStripeErrorType('rate_limit_error'); }

    isStripeErrorType(type) {
        return (
            !isEmpty(this.stripeError.type) &&
            this.stripeError.type == type
        );
    }

    toString() {
        return cr.joinBy(this.messages);
    }
}

export default StripeError = StripeError;
export const IsStripeError = (e) => (e && e.constructor == StripeError);
