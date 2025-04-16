import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { AuthState } from './auth.state';

export const selectAuth = (appState: AppState) => appState.auth;

export const selectUser = createSelector(
    selectAuth,
    (authState: AuthState) => authState.authMeta
);

export const selectIsAuthenticated = createSelector(
    selectAuth,
    (authState: AuthState) => authState.isAuthenticated
);

export const selectAuthData = createSelector(
    selectAuth,
    (authState: AuthState) => authState
);

// gives me customer/profile data
export const selectProfileData = createSelector(
    selectAuth,
    (authState: AuthState) => authState.authMeta.customer ? authState.authMeta.customer : null
);




