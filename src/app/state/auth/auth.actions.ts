import { createAction, props } from '@ngrx/store';
import { Customer } from 'src/app/models/customer.model';
import { LoginPayload } from 'src/app/models/login-payload.model';
import { ProfileInfo } from 'src/app/models/profile-information.model';
import { AuthMeta } from './auth-meta.state';
import { AccountStatus } from 'src/app/definitions/account-status.enum';

export const logIn = createAction(
    '[Auth] Login',
    props<{ payload: LoginPayload }>()
);

export const logInSuccess = createAction(
    '[Auth] Login Success',
    props<{ user: AuthMeta }>()
);

export const logInError = createAction(
    '[Auth] Login Error',
    props<{ error: string }>()
);

export const getAuthData = createAction(
    '[Auth] Get Auth Data'
);

export const signOut = createAction(
    '[Auth] Signout'
);

export const updateProfileInfo = createAction(
    '[Auth] Update Profile Info',
    props<{ payload: any }>()
);

export const updateProfilePic = createAction(
    '[Auth] Update Profile Pic',
    props<{ payload: string }>()
);

export const deleteProfilePic = createAction(
    '[Auth] Delete Profile Pic'
);

export const updateGetStartedStatus = createAction(
    '[Auth] Update Get Started Status',
    props<{ getStartedViewed: boolean }>()
);


export const updateEmployeeProfileInfo = createAction(
    '[Auth] Update Employee Info',
    props<{payload:any}>()
)
export const updateAgentProfileInfo = createAction(
    '[Auth] Update Agent Info',
    props<{payload:any}>()
)

export const updateUserAuthStatus = createAction(
    '[Auth] Update User auth status',
    // props<{ status: string }>()
);