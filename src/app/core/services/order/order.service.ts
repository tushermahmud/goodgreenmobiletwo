/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MediaUploadLocation } from 'src/app/definitions/media-upload-location.interface';
import { CustomerServiceItem } from 'src/app/models/customer-service-item.model';
import { ServiceItemMedia } from 'src/app/models/service-item-media.model';
import { AppSettings } from '../../utils/app-settings';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private GG_CORE = AppSettings.GG_CORE_ENDPOINT;
  private GG_OPR = AppSettings.GG_OPR_ENDPOINT;
  private GG_INTG = AppSettings.GG_INTRG_ENDPOINT;

  constructor(
    private http: HttpClient,
  ) { }

  getServices(agentId?:string): Observable<any> {
    return this.http.get(this.GG_CORE + 'platform/services?slug=' + `${agentId ? agentId : AppSettings.FOUNDER_SLUG}`, {headers: {skip: 'true'}});
  }

  getServiceRequests(customerId): Observable<any> {
    return this.http.get(this.GG_OPR + 'customers/' + customerId + '/service-requests');
  }

  getServiceRequest(customerId, requestId): Observable<any> {
    return this.http.get(this.GG_OPR + 'customers/' + customerId + '/service-requests/' + requestId);
  }

  getServiceItem(customerId, requestId, itemId) {
    return this.http.get<CustomerServiceItem>(this.GG_OPR + 'customers/' + customerId + '/service-requests/' + requestId + '/service-items/' + itemId);
  }

  getServiceItemQuote(customerId, itemId): Observable<any> {
    return this.http.get(this.GG_OPR + 'customers/' + customerId + '/service-items/' + itemId + '/quotes');
  }

  getServiceItemQuoteDetails(customerId, itemId, quoteId): Observable<any> {
    return this.http.get(this.GG_OPR + 'customers/' + customerId + '/service-items/' + itemId + '/quotes/' + quoteId);
  }

  newServiceRequest(customerId, payload): Observable<any> {
    return this.http.post(this.GG_OPR + 'customers/' + customerId + '/service-requests', payload);
  }

  generateUploadLocation(customerId,context, contextId, payload) {
    return this.http.post<MediaUploadLocation[]>(this.GG_INTG + `customers/${customerId}/${context}/${contextId}/media-upload`, payload);
  }

  ackUploadLocation(customerId, context, contextId, payload) {
    return this.http.put(this.GG_OPR + `customers/${customerId}/${context}/${contextId}/media-upload`, payload);
  }

  acceptServiceItemQuote(customerId, itemId, payload): Observable<any> {
    return this.http.post(this.GG_OPR + 'customers/' + customerId + '/service-items/' + itemId + '/quotes', payload);
  }

  getServiceMedia(customerId: string, srId: string) {
    // http://44.233.141.238:3003/o9y/v1/customers/customer/service-requests/135/media
    return this.http.get<ServiceItemMedia[]>(this.GG_OPR + `customers/customer/service-requests/${srId}/media`);
    //return this.http.get<CustomerUploadedMedia[]>('http://44.233.141.238:3003/o9y/v1/customers/customer/service-requests/133/media')
  }

  deleteMedia(customerId, srId, mediaId): Observable<any> {
    // v1/customers/:customerId/service-requests/:serviceRequestId/media/:mediaId
    return this.http.delete(this.GG_OPR + `customers/${customerId}/service-requests/${srId}/media/${mediaId}`)
  }

  /**
   * Upload image to s3
   * param {string} url
   * param {File} fileData
   */
   uploadFileS3(url: string, fileData: any) {
    return this.http.put<any>(url, fileData, {headers: {skip: 'true'}} );
  }

  /**
   * get meta info of the payment being made
   * param {string} customerId
   * param {string} serviceItemId
   * param {string} quoteId
   */
  // getPaymentMeta(customerId, serviceItemId, quoteId): Observable<any> {}

  /**
   *  Make payment for service item quote after a contract is signed
   *  param {string} customerId
   */
  makePayment(customerId:string, payload): Observable<any> {
    // {{host-o9y}}/o9y/v1/payment/customer/:customerId
    return this.http.post(this.GG_OPR + 'payment/customer/' + customerId, payload);
  }

  saveCard(customerId:string, payload): Observable<any> {
    // {{host-o9y}}/o9y/v1/payment/customer/CUST_9f8f7cd2-74b3-4394-9f1d-bd7faf86f3cc/card
    return this.http.post(this.GG_OPR + `payment/customer/${customerId}/card`, payload)
  }

  getCardDetails(customerId:string):Observable<any>{
    //{{host-o9y}}/o9y/v1/payment/customer/:customerId/card-details
    return this.http.get(this.GG_OPR+`payment/customer/${customerId}/card-details`)
  }

  updateServiceLocation(customerId, serviceRequestId, serviceItemId, locationId, payload): Observable<any> {
    // {{host-o9y}}/o9y/v1/customers/:customerId/service-requests/:serviceRequestId/service-items/:serviceItemId/locations/:locationId
    return this.http.put(this.GG_OPR + `customers/${customerId}/service-requests/${serviceRequestId}/service-items/${serviceItemId}/locations/${locationId}`, payload);
  }

  updateServiceNotes(customerId, serviceRequestId, serviceItemId, payload): Observable<any> {
    // {{host-o9y}}/o9y/v1/customers/:customerId/service-requests/:serviceRequestId/service-items/:serviceItemId/locations/:locationId
    return this.http.put(this.GG_OPR + `customers/${customerId}/service-requests/${serviceRequestId}/service-items/${serviceItemId}/notes`, payload);
  }

  updateOrderContact(customerId, serviceRequestId, payload): Observable<any> {
    // {{host-o9y}}/o9y/v1/customers/:customerId/service-requests/:serviceRequestId/contact
    return this.http.put(this.GG_OPR + `customers/${customerId}/service-requests/${serviceRequestId}/contact`, payload);
  }


}
