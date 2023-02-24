import { Link as RouterLink } from 'react-router-dom';

import { Paths } from './Paths';

// The usage of React.forwardRef will no longer be required for react-router-dom v6.
// see https://github.com/ReactTraining/react-router/issues/6056
export const AccountLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} to={Paths.account} {...props} />);
export const OverviewLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} to={Paths.overview} {...props} />);
export const RootLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} to={Paths.roots} {...props} />);
export const RecallsLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} to={Paths.recalls} {...props} />);
export const ResetLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} to={Paths.resetPassword} {...props} />);
export const SettingsLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} to={Paths.settings} {...props} />);
export const SigninLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} to={Paths.signin} {...props} />);
export const SignupLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} to={Paths.signup} {...props} />);
export const SubscriptionsLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} to={Paths.subscriptions} {...props} />);
export const VehiclesLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} to={Paths.vehicles} {...props} />);
