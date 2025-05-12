import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { KeycloakAuthGuard, KeycloakService } from "keycloak-angular";

@Injectable({ providedIn: 'root' })
export class AuthGuard extends KeycloakAuthGuard {
  constructor(protected router: Router, protected keycloack: KeycloakService) {
    super(router, keycloack);
  }
  public async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    //console.log("this.authenticated state:",this.authenticated);
    if (!this.authenticated) {
      await this.keycloack.login({
        redirectUri: window.location.origin + state.url,
      });
    }
    const requirredRoles = route.data;
    if (!(requirredRoles instanceof Array) || requirredRoles.length === 0) {
      return true;
    }

    return requirredRoles.every((role) => this.roles.includes(role))
  }



}