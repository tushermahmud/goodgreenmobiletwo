import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AgentService } from 'src/app/core/services/agent/agent.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { AgentAffiliations } from 'src/app/models/agent-affiliations.model';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';

@Component({
  selector: 'app-affiliations-list',
  templateUrl: './affiliations-list.component.html',
  styleUrls: ['./affiliations-list.component.css']
})
export class AffiliationsListComponent implements OnInit {

  getAuthState: Observable<AuthState>;
  authData: AuthState;

  affiliationsData: AgentAffiliations = null;

  agentId: string = '';

  constructor(
    private agentService: AgentService,
    private store: Store<AppState>,
    private loaderService: IonLoaderService
  ) { 
    this.getAuthState = this.store.select(selectAuthData);
   }

  ngOnInit(): void {

    this.getAuthState.subscribe((authData) => {
      this.authData = authData;
      if (this.authData.isAuthenticated) {
        this.agentId =  this.authData.authMeta.agent.id;
      }
      console.log('this.authData AffiliationsListComponent', this.authData);
    });

    this.getAffiliationsList(this.agentId);
  }

  getAffiliationsList(agentId: string) {
    this.loaderService.createLoading('Loading affiliations ...')
    this.agentService.getAffiliations(agentId).subscribe({
      next: async (data:AgentAffiliations) => {
        this.affiliationsData = data;
        console.log('this.affiliationsList', this.affiliationsData);
        await this.loaderService.dismissLoading();
      },
      error: async (error) => {
        console.log('error',error);
       await this.loaderService.dismissLoading();
      }
    })
  }

  refreshAffiliations() {
    this.getAffiliationsList(this.agentId);
  }


  handlePullRefresh(event) {
    setTimeout(() => {
      // Any calls to load data go here
     this.refreshAffiliations()
     event.target.complete();
    }, 2000);
  }

}
