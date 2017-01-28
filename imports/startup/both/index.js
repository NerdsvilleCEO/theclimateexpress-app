// Import modules used by both client and server through a single index entry point
// e.g. useraccounts configuration file.
import { AccountsTemplates } from 'meteor/useraccounts:core';

AccountsTemplates.configure({
    defaultLayout: 'App_body',
    defaultLayoutRegions: {
        nav: 'nav'
    },
    defaultContentRegion: 'main',
    enablePasswordChange: true,
    showForgotPasswordLink: true,
    confirmPassword: false,
    overrideLoginErrors: true,
    lowercaseUsername: true,

    negativeFeedback: false,
    positiveFeedback: false,
    negativeValidation: true,
    positiveValidation: true
});

AccountsTemplates.configureRoute('signIn', {
    name: 'signin',
    path: '/signin'
});

AccountsTemplates.configureRoute('signUp', {
    name: 'join',
    path: '/join'
});

AccountsTemplates.configureRoute('forgotPwd');

AccountsTemplates.configureRoute('resetPwd', {
    name: 'resetPwd',
    path: '/reset-password'
});
