import React from 'react';
import loadable from '@loadable/component';

import Loading from './Loading';


const AsyncAccount = loadable(() => import('../Account/Account' /* webpackChunkName: "account" */), {
    fallback: <Loading />
});
export const Account = (props) => <AsyncAccount {...props} />;

const AsyncOverview = loadable(() => import('../Overview/Overview' /* webpackChunkName: "overview" */), {
    fallback: <Loading />
});
export const Overview = (props) => <AsyncOverview {...props} />;

const AsyncPreferences = loadable(() => import('../Preferences/Preferences' /* webpackChunkName: "preferences" */), {
    fallback: <Loading />
});
export const Preferences = (props) => <AsyncPreferences {...props} />;

const AsyncRecalls = loadable(() => import('../Recalls/Recalls' /* webpackChunkName: "recalls" */), {
    fallback: <Loading />
});
export const Recalls = (props) => <AsyncRecalls {...props} />;

const AsyncResetPassword = loadable(() => import('../ResetPassword' /* webpackChunkName: "reset" */), {
    fallback: <Loading />
});
export const ResetPassword = (props) => <AsyncResetPassword {...props} />;

const AsyncReviewer = loadable(() => import('../Reviewer/Reviewer' /* webpackChunkName: "reviewer" */), {
    fallback: <Loading />
});
export const Reviewer = (props) => <AsyncReviewer {...props} />;

const AsyncSetPassword = loadable(() => import('../SetPassword' /* webpackChunkName: "set" */), {
    fallback: <Loading />
});
export const SetPassword = (props) => <AsyncSetPassword {...props} />;

const AsyncSharedRecall = loadable(() => import('../Recalls/SharedRecall' /* webpackChunkName: "recalls" */), {
    fallback: <Loading />
});
export const SharedRecall = (props) => <AsyncSharedRecall {...props} />;

const AsyncSubscriptions = loadable(() => import('../Subscriptions/Subscriptions' /* webpackChunkName: "subscription" */), {
    fallback: <Loading />
});
export const Subscriptions = (props) => <AsyncSubscriptions {...props} />;

const AsyncVehicles = loadable(() => import('../Vehicles/Vehicles' /* webpackChunkName: "vehicles" */), {
    fallback: <Loading />
});
export const Vehicles = (props) => <AsyncVehicles {...props} />;
