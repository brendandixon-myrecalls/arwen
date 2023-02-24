import React from 'react';

import ErrorPage from './ErrorPage';

const LoadChunkFailure = new RegExp(/.*Loading chunk.*failed.*/);

class ErrorBoundary extends React.Component {

    static getDerivedStateFromError(error, errorInfo) {
        const message = error.toString();

        return {
            errors: [LoadChunkFailure.test(message) ? '' : message]
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            errors: null,
            stack: null,
        }
    }

    componentDidCatch(error, errorInfo) {
        const message = error.toString();

        this.setState({
            errors: [LoadChunkFailure.test(message) ? '' : message],
            stack: errorInfo.componentStack,
        });

        console.log(`${error.toString()}\n${errorInfo.componentStack}`)
    }

    render() {
        const { children } = this.props;
        const { errors, stack } = this.state;

        if (!errors || errors.length < 0) {
            return children;
        }

        return (<ErrorPage errors={errors} stack={stack} />)
    }
}

export default ErrorBoundary = ErrorBoundary;
