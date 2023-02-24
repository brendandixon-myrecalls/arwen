import { Redirect, Route } from 'react-router-dom';

import AppContext from '../AppContext';
import { Paths } from './Paths';

export default function AppRoute({ render: render, authorizer: authorizer, ...rest }) {
    return (
        <AppContext.Consumer>
            {context => (
                <Route
                    {...rest}
                    render={props => {
                        const { credentials, user } = context;
                        const location = props.location;
                        const path = location.pathname;
                        const token = ((props.match || {}).params || {}).token

                        context.trackPageview(location);

                        if (path.startsWith(Paths.signin) ||
                            path.startsWith(Paths.signout) ||
                            path.startsWith(Paths.signup) ||
                            path.startsWith(Paths.password) ||
                            (path.startsWith(Paths.recall) && token)) {
                            return render(props);
                        }

                        else if (credentials.isAuthenticated) {

                            if (!authorizer(user) || path == Paths.root) {
                                const homePath = (user.hasRecallSubscription
                                    ? Paths.overview
                                    : (user.hasVehicleSubscription
                                        ? Paths.vehicles
                                        : Paths.subscriptions));

                                return <Redirect to={{
                                    pathname: homePath,
                                }} />
                            }
                            else {
                                return render(props);
                            }
                        }

                        else {
                            const wasSignOut = path.startsWith(Paths.signout);
                            const target = {
                                pathname: Paths.signin,
                                state: {
                                    from: {
                                        pathname: wasSignOut ? Paths.root : (path || Paths.root),
                                        search: location.search || '',
                                    },
                                }
                            };
                            return (<Redirect to={target} />);
                        }
                    }}
                />
            )}
        </AppContext.Consumer>
    )
}
