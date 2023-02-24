const Defaults = {
    credentials: null,
    host: null,
    user: null,

    evaluateError: null,
    handleRemindLater: null,

    isExpired: null,

    needsHelp: null,
    needsWelcome: null,
    wantsHelp: null,

    raiseAnalyticsEvent: null,
    trackPageview: null,

    setCredentials: null,
    setErrors: null,
    setFatal: null,
    setMessages: null,
    setUser: null,
};

export const DefaultAppContext = Defaults;
export const AppContext = React.createContext(Defaults);

export default AppContext;
