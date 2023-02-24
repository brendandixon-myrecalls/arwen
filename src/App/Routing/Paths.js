export const TOKEN_PATTERN = '[A-Fa-f0-9]{24,24}';
const TOKEN = `:token(${TOKEN_PATTERN})`

export const Paths = {
    root: '/',
    overview: '/overview',

    recall: '/recall/',
    recalls: '/recalls/',
    recallWithToken: `/recall/${TOKEN}`,
    vehicles: '/vehicles/',

    account: '/account/',
    review: '/review/',
    settings: '/settings/',
    subscriptions: '/subscriptions/',
    users: '/users/',

    password: '/password/',
    resetPassword: '/password/reset/',
    setPassword: '/password/set/',

    signin: '/signin/',
    signinWithToken: `/signin/${TOKEN}`,

    signout: '/signout/',

    signup: '/signup/',
}

export const Icons = {
    root: 'fal fa-calendar',
    overview: 'fal fa-calendar',

    recalls: 'fal fa-exclamation-square',
    vehicles: 'fal fa-cars',

    account: 'fal fa-user',
}
