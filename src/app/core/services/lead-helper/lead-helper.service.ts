import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MediaUploadLocation } from 'src/app/definitions/media-upload-location.interface';
import { CreateAddendum } from 'src/app/models/create-addendum';
import { StartOrEndJob } from 'src/app/models/todays-job.model';
import { AppSettings } from '../../utils/app-settings';

@Injectable({
  providedIn: 'root'
})
export class LeadHelperService {

  private GG_CORE = AppSettings.GG_CORE_ENDPOINT;
  private GG_OPR = AppSettings.GG_OPR_ENDPOINT;
  private GG_INTG = AppSettings.GG_INTRG_ENDPOINT;

  constructor(
    private http: HttpClient,
  ) { }


  // jobs
  getTodaysJob(businessAccountId: string, accountId: number): Observable<any> {
    const date = new Date().toISOString().slice(0,10);
    return this.http.get(this.GG_OPR + 'job-cards/business-accounts/'+ businessAccountId +'/platform-accounts/'+ accountId +'/jobs/' + date);
  }

  startOrEndJob(businessAccountId: string, accountId: number, jobCardId: number, actionType: 'start' | 'end', payload: any): Observable<any> {
    return this.http.post(`${this.GG_OPR }job-cards/business-accounts/${businessAccountId}/platform-accounts/${accountId}/job-cards/${jobCardId}/${actionType}`, payload);
  }

  uploadStartOrEndJobMedia(baId: string , context:string , contextId, payload) {
    return this.http.post<MediaUploadLocation[]>(this.GG_INTG + `business-accounts/${baId}/${context}/${contextId}/job-media`, payload);
  }
  ackUploadLocation(baId: string , context:string , contextId, payload) {
    return this.http.put(this.GG_INTG + `business-accounts/${baId}/${context}/${contextId}/job-media`, payload);
  }

  getUpcomingJobs(businessAccountId: string, accountId: number): Observable<any> {
    return this.http.get(this.GG_OPR + 'job-cards/business-accounts/'+ businessAccountId +'/platform-accounts/'+ accountId +'/jobs');
  }


  getOngoingJobs(businessAccountId: string, accountId: number): Observable<any> {
    return this.http.get(this.GG_OPR + 'job-cards/business-accounts/' + businessAccountId + '/platform-accounts/' + accountId + '/jobs-ongoing')
  }

  jobCheckIn(businessAccountId: string, accountId: number, jobId: number): Observable<any> {
    //{{host-o9y}}/o9y/v1/job-cards/business-accounts/:businessAccountId/platform-accounts/:accountId/jobs/:jobId/check-in
    return this.http.post(this.GG_OPR + 'job-cards/business-accounts/'+ businessAccountId +'/platform-accounts/'+ accountId +'/jobs/' + jobId + '/check-in', null)
  }

  clockInOrOut(businessAccountId: string, accountId: number, jobId: number, logType: string, payload: any): Observable<any>  {
    //{{host-o9y}}/o9y/v1/job-cards/business-accounts/:businessAccountId/platform-accounts/:accountId/jobs/:jobId/:logType
    return this.http.post(this.GG_OPR + 'job-cards/business-accounts/'+ businessAccountId +'/platform-accounts/'+ accountId +'/jobs/' + jobId + '/' + logType, payload)
  }

  // ###################### Job Details ######################
  getJobDetails(businessAccountId: string, accountId: number, jobCardId: number, jobId: number) {
    return this.http.get(this.GG_OPR + 'job-cards/business-accounts/'+ businessAccountId +'/platform-accounts/'+ accountId + '/job-cards/' + jobCardId + '/jobs/' + jobId + '/details');
  }

  getJobLogs(businessAccountId: string, accountId: number, jobCardId: number, jobId: number) {
    return this.http.get(this.GG_OPR + 'job-cards/business-accounts/'+ businessAccountId +'/platform-accounts/'+ accountId + '/job-cards/' + jobCardId + '/jobs/' + jobId + '/logs');
  }

  getOngoingJobCard(jobCardId: number): Observable<any> {
    // {{host-o9y}}/o9y/v1/job-cards/:jobCardId
    return this.http.get(this.GG_OPR + `job-cards/${jobCardId}`);
  }


  saveJobMedia(businessAccountId: string, accountId: number, jobCardId: number, jobId: number, media: any) {
    const url = `${this.GG_OPR}job-cards/business-accounts/${businessAccountId}/platform-accounts/${accountId}/job-cards/${jobCardId}/jobs/${jobId}/media`;

    return this.http.post(url, media);
  }

  createAddendum(payload: CreateAddendum): Observable<any>  {
    return this.http.post(this.GG_OPR + 'change-order', payload)
  }


  //get order details for lead
  getOrderDetails(accountId: number, serviceRequestId: number, serviceItemId: number): Observable<any> {
    return this.http.get(this.GG_OPR + 'lead-mover/platform-account/' + `${accountId}` + '/service-requests/' + `${serviceRequestId}` + '/service-item/' + `${serviceItemId}`);
  }


  //get completed job details
  getCompletedJobs(businessAccountId: string, accountId: number): Observable<any> {
    return this.http.get(this.GG_OPR + 'job-cards/business-accounts/' + `${businessAccountId}` + '/platform-accounts/' + `${accountId}` + '/jobs-history');
  }

  //update user profile details
  updateUserProfile(userId:string,payload:any):Observable<any>{
    return this.http.put(this.GG_CORE+`users/${userId}/update-profile`,payload);
  }


  //get request time offs for employee
  getTimeOff(businessAccountId: string, accountId: number): Observable<any> {
    return this.http.get(this.GG_OPR+`business-accounts/${businessAccountId}/platform-accounts/${accountId}/time-off`)
  }


  //get request time offs for employee
  updateTimeOff(businessAccountId: string, accountId: number,payload:any): Observable<any> {
    return this.http.put(this.GG_OPR+`business-accounts/${businessAccountId}/platform-accounts/${accountId}/time-off`,payload)
  }


  //get payment details for employee
  getPaymentDetails(businessAccountId: string, serviceRequestId: number, serviceItemId: number) {
    return this.http.get(this.GG_OPR + `payment/business-accounts/${businessAccountId}/service-requests/${serviceRequestId}/service-items/${serviceItemId}`)
  }


  deleteJobMedia(businessAccountId: string, accountId: number, jobCardId: number, jobId: number, mediaId: number): Observable<any> {
    return this.http.delete(this.GG_OPR + `job-cards/business-accounts/${businessAccountId}/platform-accounts/${accountId}/job-cards/${jobCardId}/jobs/${jobId}/media/${mediaId}`)
  }


  getDefaultSupplyItems(partnerAccountId): Observable<any> {
    // {{host-o9y}}/o9y/v1/business-accounts/{{partnerAccountId}}/supply-items
    return this.http.get(this.GG_OPR + 'business-accounts/' + partnerAccountId + '/supply-items');
  }
}
