import { KeycloakService } from "keycloak-angular";

export function initializeKeycloack(keycloak: KeycloakService): () => Promise<any> {
    return () =>
        keycloak.init({
            config: {
                url: 'http://localhost:8080/auth',
                realm: 'dpp',
                clientId: 'dpp-portal',
            },
            initOptions: {
                checkLoginIframe: false,
                //checkLoginIframeInterval:100
                onLoad: 'login-required',
                checkLoginIframeInterval: 25
            }
        })
    //url: 'http://122.170.2.166:9071/auth',
    //url: 'https://stg-dpp-portal.cst.gov.sa/auth',
    //url: 'https://10.32.64.13:9081/auth',
    // url: 'http://122.170.2.166:9071/auth',
    //url: 'https://dpp-portal.cst.gov.sa/auth',
    //https://dpp-portal.cst.gov.sa/auth
}