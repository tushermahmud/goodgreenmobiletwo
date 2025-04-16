// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  /** version of the app release, ensure it matches with package.json */
  version: '1.1.4',
  ggCoreEndpoint: 'https://gg-api.iiinigence.io/core/v1/',
  ggIDMEndpoint: 'https://gg-api.iiinigence.io/core/',
  ggInteriorsEndpoint: 'https://gg-api.iiinigence.io/i15s/v1/',
  ggOpportunityEndpoint: 'https://gg-api.iiinigence.io/o9y/v1/',
  ggIntegrationEndpoint: 'https://gg-api.iiinigence.io/i10s/v1/fs/',

  // ggIntegrationsChat: 'https://api.goodgreenapp.com/prod/i10s/v1/',

  /* ggCoreEndpoint: 'https://api.goodgreenapp.com/qa/core/v1/',
  ggIDMEndpoint: 'https://api.goodgreenapp.com/qa/core/',
  ggInteriorsEndpoint: 'https://api.goodgreenapp.com/qa/i15s/v1/',
  ggOpportunityEndpoint: 'https://api.goodgreenapp.com/qa/o9y/v1/',
  ggIntegrationEndpoint: 'https://api.goodgreenapp.com/qa/i10s/v1/fs/' ,*/

  ggIntegrationsChat: 'http://44.233.141.238:3004/i10s/v1/',
  ggNotificationEndPoint: 'http://44.233.141.238:3005/n11s/v1/',

  clientStripeKey: 'pk_test_51NcWJjHfc1W8ov33NKkk8RHoWVqhRL1ktegleizh0zOZK6EieuIMZBWtAUS56wziaPQmsFNyNKgiSJDIhXYJvhf600GQtXu8mB',

  ggWebHost: 'https://naya.goodgreenapp.com',
  ggWebSpaHost: 'https://nayasign.goodgreenapp.com',

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
