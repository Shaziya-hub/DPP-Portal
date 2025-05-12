// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  mock: false,
  DPP_BACKEND_HOST: "http://24.28.75.78:2007/restv2",//"http://72.182.209.93:2007/restv2",http://122.170.2.166:3007/
//DPP_BACKEND_HOST: "http://122.170.2.166:3007/restv2",
  //DPP_BACKEND_HOST: "http://122.170.2.166:2007",
   //DPP_BACKEND_HOST:"https://dpp-api.cst.gov.sa",
  //DPP_BACKEND_HOST: "http://10.27.30.11:4000",
  //DPP_BACKEND_HOST: "http://10.32.64.11:4000",
  // DPP_BACKEND_HOST:"https://dpp-api.cst.gov.sa/restv2/getMenuByUser",
  minimumSpaceAlertThresholdValue: 10 //KB
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
