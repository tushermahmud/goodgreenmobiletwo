import { AuthMeta } from './auth-meta.state';

export interface AuthState {
    isAuthenticated: boolean;
    authMeta: AuthMeta | null;
    errorMessage: string | null;
    getStartedViewed?: boolean;
    // the login status of the customer
    status: 'pending' | 'loading' | 'error' | 'success';
}
