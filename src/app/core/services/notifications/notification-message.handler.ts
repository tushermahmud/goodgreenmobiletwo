import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Router } from '@angular/router';
import { AuthState } from 'src/app/state/auth/auth.state';

interface Message {
  context: string;
  event: string;
  serviceRequestId?: string;
  serviceItemId?: string;
  jobId?: string;
  jobCardId?: string;
}
@Injectable({
  providedIn: 'root'
})
export class NotificationMessageHandler {


  constructor(
    private nativeStorage: NativeStorage,
    private firebase: FirebaseX,
    private router: Router
  ) { }

  /*** Handles any new message received from the push notifications service - firebase
  *
   * @returns
   */
  newMessages(authState) {
    // on message received
    this.firebase.onMessageReceived().subscribe({
      next: (message: Message | any) => {
        console.log(`NEW MESSAGE RECEIVED: `, message);
        console.log(JSON.stringify(message));
        this.handleMessage(message, authState);
      },
      error: (err) => {
        console.log('error', err);
      }
    });
  }

  private handleMessage(message: Message, authState: AuthState) {
    //message --> Nice to have a Type referance to message param , need to add this for dev ref.
    let obj;
    const loginUserType = authState.authMeta.type;
    // check for message and authdata
    // 
    if(!message || !authState || !loginUserType) return;
    
    // const 
    console.log('message', message);

    // Need to check for login user type and redirect 
    // check for login data before any redirection is done 
    if (message.context === 'partner' && loginUserType === 'employee') {
      obj = {
        businessAccountId: authState?.authMeta?.employee?.businessAccountId,
        accountId: authState.authMeta?.employee?.accountId,
        jobCardId: message?.jobCardId,
        jobId: message?.jobId,
        event: message?.event,
        jobType:'upcoming' // will this be always 'upcoming' ? 
      };

      this.handlePartnerEvent(message.event, obj);

    } else if(message.context === 'customer' && loginUserType === 'customer'){
      obj = { ...message };

      this.handleCustomerEvent(message.event, obj);
    } else if(message.context === 'agent' && loginUserType === 'agent') {
      // yet to be added !!
    }

  }


  private handlePartnerEvent(event: string, obj: any) {
    switch (event) {
        case 'lead-assigned': 
            this.router.navigate(['lead','order-view',`${obj.serviceRequestId}`,`${obj.serviceItemId}`]);
            break;
        case 'quote-accepted': 
            this.router.navigate(['lead', 'order-view', `${obj.serviceRequestId}`, `${obj.serviceItemId}`]);
            break;
        case 'job-assigned': 
        case 'checked-in':
        case 'job-started':
        case 'job-ended':
        case 'job-upcoming':
            this.router.navigate(['lead', 'employee-jobs', 'job-details'], { state: { meta: obj } });
            break;
        default:
            // take the user to dashboard
            this.router.navigate(['lead', 'employee-dashboard']);
            break;
    }
  }

  private handleCustomerEvent(event: string, obj: any) {
    switch (event) {
        //for customers
        case 'quote-sent':
        case 'quote-received':
        case 'contract-signature':
          this.router.navigate(['user', 'dashboard', 'order-details', `${obj?.serviceRequestId}`, `${obj?.serviceItemId}`]);
          break;
        case 'make-payment':
          this.router.navigate(['user', 'dashboard', 'payment', `${obj?.serviceItemId}`]);
          break;

        default:
          // take the user to dashboard
          this.router.navigate(['user', 'dashboard']);
          console.log('take the user to dashboard');
          break;
    }
  }
}
