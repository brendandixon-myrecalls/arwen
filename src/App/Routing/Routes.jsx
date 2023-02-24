import {
    Account,
    Overview,
    Preferences,
    Recalls,
    ResetPassword,
    Reviewer,
    SetPassword,
    SharedRecall,
    Subscriptions,
    Vehicles,
} from './Components';

import { Paths, Icons } from './Paths';
import SignIn from '../SignIn';
import SignOut from '../SignOut';

class Route {
    constructor(path, component, options = {}) {
        this.path = path || '';
        this.component = component;

        const authorizer = options['authorizer'] || (user => user.actsAsMember);
        this.authorizer = (user => {
            if (!user) {
                return false;
            }
            return authorizer(user);
        });
        this.layout = options['layout'] || 'main';

        const menuItem = options['menuItem'] || {};
        this.menu = menuItem['menu'];
        this.menuIcon = menuItem['icon'];
        this.menuLabel = menuItem['label'];
        this.menuOrder = menuItem['order'] || 1;
    }

    get asMenuItem() {
        return {
            authorizer: this.authorizer,
            icon: this.menuIcon,
            label: this.menuLabel,
            order: this.menuOrder,
            path: this.path,
        }
    }
}

export const Routes = [
    new Route(
        Paths.root,
        Overview,
        { authorizer: (user => user.actsAsMember) }),
    new Route(
        Paths.overview,
        Overview,
        { authorizer: (user => user.actsAsMember), menuItem: { icon: Icons.root, label: 'Overview', menu: 'main', order: 0 } }),
    new Route(
        Paths.recallWithToken,
        SharedRecall,
        {}),

    new Route(
        Paths.recalls,
        Recalls,
        { authorizer: (user => user.actsAsMember), menuItem: { icon: Icons.recalls, label: 'Recalls', menu: 'main', order: 20 } }),
    new Route(
        Paths.vehicles,
        Vehicles,
        { authorizer: (user => user.actsAsMember), menuItem: { icon: Icons.vehicles, label: 'Vehicles', menu: 'main', order: 30 } }),

    new Route(
        Paths.subscriptions,
        Subscriptions,
        { authorizer: (user => user.actsAsMember) }),

    new Route(
        Paths.account,
        Account,
        { menuItem: { label: 'Account', menu: 'account', order: 0 } }),
    new Route(
        Paths.review,
        Reviewer,
        { authorizer: (user => user.actsAsWorker), menuItem: { label: 'Review', menu: 'account', order: 10 } }),
    new Route(
        Paths.settings,
        Preferences,
        { menuItem: { label: 'Settings', menu: 'account', order: 20 } }),

    new Route(
        Paths.signin,
        SignIn,
        { layout: 'plain', menuItem: { label: 'Sign In' } }),
    new Route(
        Paths.signinWithToken,
        SignIn,
        { layout: 'plain', menuItem: { label: 'Sign In' } }),
    new Route(
        Paths.signout,
        SignOut,
        { layout: 'plain', menuItem: { label: 'Sign Out' } }),

    new Route(
        Paths.signup,
        Subscriptions,
        { authorizer: (() => true), layout: 'plain' }),

    new Route(
        Paths.resetPassword,
        ResetPassword,
        { authorizer: (() => true), layout: 'plain' }),
    new Route(
        Paths.setPassword,
        SetPassword,
        { authorizer: (() => true), layout: 'plain' }),
]
