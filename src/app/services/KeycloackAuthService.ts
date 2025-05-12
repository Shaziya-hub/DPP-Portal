import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import KeycloakAdminClient from "keycloak-admin";
import { KeycloakService } from "keycloak-angular";
import { User } from "../model/user";
import { StoreService } from "./store.service";

@Injectable()
export class KAuthService {
    constructor(private keycloackService: KeycloakService, private http: HttpClient, private store: StoreService) { }


    kcAdminClient = new KeycloakAdminClient();
    getLoggedUser() {
        try {
            let userDetails: any = this.keycloackService.getKeycloakInstance().tokenParsed;

            if (userDetails) {

                let user = new User();

                user.name = userDetails.name;
                user.email = userDetails.email;
                user.id = userDetails.sub;

                this.store.user.next(user);
            }

            return userDetails;
        } catch (e) {
            console.log('get loggeduser exception', e);
            return undefined
        }

        // Authorize with username / password


    }

    logOut() {
        localStorage.setItem('selectedLang', '');
        this.keycloackService.logout("http://localhost:4200/DPP");
        // this.keycloackService.logout("https://dpp-portal.cst.gov.sa/DPP");
        //  this.keycloackService.logout("https://stg-dpp-portal.cst.gov.sa/DPP");
    }
    redirectToProfile() {
        this.keycloackService.getKeycloakInstance().accountManagement();
    }

    getRoles(): string[] {
        return this.keycloackService.getUserRoles();
    }

    getToken(): Promise<any> {
        return new Promise((resolve, reject) => {

            if (this.keycloackService.getKeycloakInstance().token) {
                this.keycloackService.getKeycloakInstance()
                    .updateToken(5)
                    .success(() => {
                        resolve(this.keycloackService.getKeycloakInstance().token);
                    })
                    .error(() => {
                        reject('Failed to refresh token');
                    });
            } else {
                reject('Not logged in');
            }
        });
    }
    //   getUsersGroup(userId:any){
    //     let headers = new HttpHeaders();
    //     headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
    //   return this.http.get("http://localhost:8082/auth/realms/dpp/users/"+userId+"/groups")
    // }
    async authUserByKcAdmin() {
        await this.kcAdminClient.auth({
            username: 'akram',
            password: 'test',
            grantType: 'password',
            clientId: 'dpp-portal',
            totp: '123456', // optional Time-based One-time Password if OTP is required in authentication flow
        });

    }

}