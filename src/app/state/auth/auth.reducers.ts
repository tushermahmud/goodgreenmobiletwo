import { createReducer, on } from '@ngrx/store';
import { deleteProfilePic, getAuthData, logIn, logInError, logInSuccess, signOut, updateAgentProfileInfo, updateEmployeeProfileInfo, updateGetStartedStatus, updateProfileInfo, updateProfilePic, updateUserAuthStatus } from './auth.actions';
import { AuthState } from './auth.state';
import { AccountStatus } from 'src/app/definitions/account-status.enum';


export const initialState: AuthState = {
    isAuthenticated: false,
    authMeta: null,
    getStartedViewed: false,
    errorMessage: null,
    status: 'pending',
};

export const authReducer = createReducer(
    // Supply the initial state
    initialState,
    on(logIn, (state) => ({ ...state, status: 'loading' as 'loading' })),

    // login success
    on(logInSuccess, (state, { user: authMeta }) => ({
        ...state,
        isAuthenticated: authMeta?.accessToken ? true : false,
        authMeta: { ...authMeta },
        errorMessage: null,
        status: authMeta?.accessToken ? 'success' as const : 'error' as const,

    })),

    on(updateGetStartedStatus, (state, {getStartedViewed}) => ({// getStartedViewed - true,  means get started is done  (boolean value)
        ...state, 
        isAuthenticated: false,
        authMeta: null,
        getStartedViewed: getStartedViewed === true ? getStartedViewed : false ,
        errorMessage: null,
        status: 'pending' as 'pending',
    })),

    // login error
    on(logInError, (state, { error }) => ({
        ...state,
        isAuthenticated: false,
        authMeta: null,
        errorMessage: error,
        status: 'error' as 'error',
    })),

    on(getAuthData, (state) => ({ ...state, status: 'loading' as 'loading' })),

    // update the profile information of the customer
    on(updateProfileInfo, (state, { payload }) => ({
        ...state,
        authMeta: {
            ...state.authMeta,
            customer: { ...state.authMeta.customer, ...payload }
        }
    })),

    on(updateProfilePic, (state, { payload }) => ({
        
        ...state,
        authMeta: {
            ...state.authMeta,
            profileUrl: payload
        }
        
    })),

    on(deleteProfilePic, (state) => ({
        
        ...state,
        authMeta: {
            ...state.authMeta,
            profileUrl: null
        }
        
    })),

    on(signOut, (state) => ({
        ...state,
        isAuthenticated: false,
        authMeta: null,
        errorMessage: null,
        status: 'pending' as 'pending',
        
    })),


    // update the profile information of the employee
    on(updateEmployeeProfileInfo, (state, { payload }) => ({
        ...state,
        authMeta: {
            ...state.authMeta,
            employee: { ...state.authMeta.employee, ...payload }
        }
    })),
    
    // update the profile information of the employee
    on(updateAgentProfileInfo, (state, { payload }) => ({
        ...state,
        authMeta: {
            ...state.authMeta,
            agent: { ...state.authMeta.agent, ...payload }
        }
    })),

    on(updateUserAuthStatus, (state) => ({
        ...state,
        authMeta: {
          ...state.authMeta,
          accountStatus: AccountStatus.ACTIVE as AccountStatus.ACTIVE,
          customer: {
            ...state.authMeta.customer,
            accountStatus: AccountStatus.ACTIVE,
          },
        },
      })),

     
);

