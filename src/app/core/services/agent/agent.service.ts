import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettings } from '../../utils/app-settings';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private GG_CORE = AppSettings.GG_CORE_ENDPOINT;
  private GG_OPR = AppSettings.GG_OPR_ENDPOINT;

  constructor(private http: HttpClient) { }

  /**
   * Get affiliation invites for a specific agent
   * Endpoint: this.GG_CORE +  agents/:agentId/affiliations/invites
   * @param agentId ID of the agent for which to get affiliation invites
   * @returns Observable that emits the response from the API
   */
  getAffiliationInvites(agentId: string) {
    return this.http.get( this.GG_CORE + `agents/${agentId}/affiliations/invites`);
  }

  /**
   * Get affiliations for a specific agent
   * Endpoint: this.GG_CORE +  agents/:agentId/affiliations
   * @param agentId ID of the agent for which to get affiliations
   * @returns Observable that emits the response from the API
   */
  getAffiliations(agentId: string) {
    return this.http.get( this.GG_CORE + `agents/${agentId}/affiliations`);
  }

  /**
   * Update the affiliation status for a specific agent and business account
   * Endpoint: this.GG_CORE +  agents/business-accounts/:businessAccountId/:agentId/affiliate-status?state='active'
   * State can be 'active' or 'rejected'
   * @param businessAccountId ID of the business account for which to update affiliation status
   * @param agentId ID of the agent for which to update affiliation status
   * @param state New state of the affiliation ('active' or 'rejected')
   * @returns Observable that emits the response from the API
   */
  updateAffiliationStatus(businessAccountId: string, agentId: string, state: 'active' | 'rejected'): Observable<any> {
    return this.http.put( this.GG_CORE + `business-accounts/${businessAccountId}/agents/${agentId}/affiliate-status?state=${state}`, {});
  }


  /**
 * Creates a new service request for the specified agent.
 * @param agentId The ID of the agent for whom to create the service request.
 * @param data The data to include in the request body.
 * @returns An Observable that resolves with the created service request.
 */
  createServiceRequest(agentId: string, payload: any): Observable<any> {
    return this.http.post( this.GG_OPR + `agents/${agentId}/service-requests`, payload);
  } 
  
  /**
 * Retrieves the service requests for the specified agent ID.
 * @param agentId: number The ID of the agent to retrieve service requests for.
 * @returns {Observable<any>} An observable that resolves to the service requests.
 */
  getServiceRequests(agentId): Observable<any> { // for dashboard
    return this.http.get( this.GG_OPR + `agents/${agentId}/service-requests`);
  }

  /**
 * Retrieves the specified service item for the specified service request and agent.
 * @param agentId The ID of the agent that owns the service request and item.
 * @param serviceRequestId The ID of the service request that the item belongs to.
 * @param serviceItemId The ID of the service item to retrieve.
 * @returns An observable that resolves to the service item.
 */
  getServiceDetails(agentId: string, serviceRequestId: string, serviceItemId: string): Observable<any> {
    return this.http.get(this.GG_OPR + `agents/${agentId}/service-requests/${serviceRequestId}/service-items/${serviceItemId}`)
  }

  /**
   * Sends a PUT request to update an agent's information.
   * 
   * @param agentId The ID of the agent to update.
   * @param payload The data to update the agent with.
   * @returns An Observable of the updated agent's data.
   */
  updateAgentProfile(agentId: string, payload: any): Observable<any>  {
    return this.http.put(this.GG_CORE + `agents/${agentId}` , payload);
  }

}
