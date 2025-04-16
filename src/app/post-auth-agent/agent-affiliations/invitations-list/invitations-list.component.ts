import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AgentService } from 'src/app/core/services/agent/agent.service';
import { CommonService } from 'src/app/core/services/common/common.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
// import { Affiliation } from 'src/app/models/agent-affiliations.model';
import { Affiliation, AgentInvitations } from 'src/app/models/agent-invitations.model';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';

@Component({
  selector: 'app-invitations-list',
  templateUrl: './invitations-list.component.html',
  styleUrls: ['./invitations-list.component.css']
})
export class InvitationsListComponent implements OnInit {

  getAuthState: Observable<AuthState>;
  authData: AuthState;

  agentId: string = '';
  invitationsData: AgentInvitations = null;

  selectedAffiliation: Affiliation = null;
  isListAVailable: boolean = false;

  constructor(
    private agentService: AgentService,
    private store: Store<AppState>,
    private loaderService: IonLoaderService,
    private alertController: AlertController,
    private toastService: ToastController,
    private commonService: CommonService
  ) { 
    this.getAuthState = this.store.select(selectAuthData);
    
  }

  async ngOnInit() {

    this.getAuthState.subscribe((authData) => {
      this.authData = authData;
      if (this.authData.isAuthenticated) {

        this.agentId =  this.authData.authMeta.agent.id;
        console.log('this.authData', this.authData);
      }
    });

    await this.getAgentInvites(this.agentId);
  } 

  async getAgentInvites(agentId: string) {
    await this.loaderService.createLoading('Loading invitations ...')
    this.agentService.getAffiliationInvites(agentId).subscribe({
      next: (data: AgentInvitations) => {
        this.invitationsData = data;
        this.invitationsData.affiliations.forEach(aff => {
          aff.isControlVisible = true;
        })
        console.log('this.invitationsData', this.invitationsData.affiliations);
        this.loaderService.dismissLoading();
      },
      error: (error) => {
        console.log('error',error);
        this.loaderService.dismissLoading();
      }
    })
  }

  async acceptInvite(affiliation: Affiliation) {
      console.log('affiliation', affiliation);
      this.selectedAffiliation = affiliation;
      const alert = await this.alertController.create({
        header: 'Alert',
        subHeader: 'Important message',
        message: `Are you sure you want to accept this invitation? By doing so, you'll be joining and gaining access to this affiliation's Service requests. You can always leave later if you change your mind. Press 'Accept' to join or 'Cancel' to decline.`,
        buttons: [
          {
            text:'Accept',
            role: 'confirm' ,
            handler: (val) => {
             console.log('Accepted', val);
             this.confirmInvite();
            }
           },
           {
             text:'Cancel',
             role: 'cancel' ,
             handler: (val) => {
              console.log('Cancel', val);
             }
            }
        ],
      });
  
      await alert.present();
  }
  async rejectInvite(affiliation: Affiliation) {
      console.log('affiliation', affiliation);
      this.selectedAffiliation = affiliation;
      const alert = await this.alertController.create({
        header: 'Alert',
        subHeader: 'Important message',
        message: `Are you sure you want to reject this invitation ?`,
        buttons: [
          {
            text:'Reject',
            role: 'confirm' ,
            handler: (val) => {
             console.log('Accepted', val);
             this.rejectInvitation()
            }
           },
           {
             text:'Cancel',
             role: 'cancel' ,
             handler: (val) => {
              console.log('Cancel', val);
             }
            }
        ],
      });
  
      await alert.present();
  }

  async confirmInvite() {
    await this.loaderService.createLoading('Accepting invite...');
    this.agentService.updateAffiliationStatus(this.selectedAffiliation.id, this.agentId, 'active').subscribe({
      next: (data: AgentInvitations) => {
        console.log('data updateAffiliationStatus', data);
        // data.affiliations.length > 0 ? this.isListAVailable = true : this.isListAVailable = false;
        this.refreshInvites();
        this.loaderService.dismissLoading();
      },
      error: (error) => {
        console.log('error', error);
        this.commonService.showToast(
          'Error while accepting invite, please try again.'
        );
        this.loaderService.dismissLoading();
      }
    })
  }
  async rejectInvitation() {
    await this.loaderService.createLoading('rejecting invite...');
    this.agentService.updateAffiliationStatus(this.selectedAffiliation.id, this.agentId, 'rejected').subscribe({
      next: (data: AgentInvitations) => {
        console.log('data updateAffiliationStatus', data);
        // data.affiliations.length > 0 ? this.isListAVailable = true : this.isListAVailable = false;
        this.selectedAffiliation.isControlVisible = false;
        this.refreshInvites();
        this.loaderService.dismissLoading();
      },
      error: (error) => {
        console.log('error', error);
        this.commonService.showToast(
          'Error while accepting invite, please try again.'
        );
        this.loaderService.dismissLoading();
      }
    })
  }

  async refreshInvites() {
    await this.getAgentInvites(this.agentId);
  }


 handlePullRefresh(event) {
    setTimeout(() => {
      // Any calls to load data go here
    this.refreshInvites()
     event.target.complete();
    }, 2000);
  }
}

