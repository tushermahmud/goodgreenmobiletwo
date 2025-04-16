/* eslint-disable @typescript-eslint/naming-convention */
import { environment } from 'src/environments/environment';

export class AppSettings {

    public static GG_CORE_ENDPOINT = environment.ggCoreEndpoint;
    public static GG_IDM_ENDPOINT = environment.ggIDMEndpoint;
    public static GG_IPM_ENDPOINT = environment.ggInteriorsEndpoint;
    public static GG_OPR_ENDPOINT = environment.ggOpportunityEndpoint;
    public static GG_INTRG_ENDPOINT = environment.ggIntegrationEndpoint;
    public static GG_NOTIF_ENDPOINT = environment.ggNotificationEndPoint;
    public static FOUNDER_SLUG = 'FDR_good-green';

}
