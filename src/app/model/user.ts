export interface PagePermission {
    id: number;
    roleId: string;
    pageId: string;
    isactive: number;
    isdeleted: number;
    createdby: string;
    updatedby: string;
    createdOn: any;
    updatedOn: any;
}

export interface Role {
    pagePermissions: PagePermission[];
    name: string;
}

export interface PayLoad {
    id: number;
    name: string;
    role: Role;
    emailId?: any;
    userName: string;
    isCreateRights: number;
    isDeleteRights: number;
    isEditRights: number;
    isActive: number;
    isDeleted: number;
    isExportRights: number;
    isViewRights: number;
}

export class User {
    name: string = '';
    email: string = '';
    id: string = '';
    constructor() { }
    public copy(user: User) {
        return Object.assign(this, user);
    }
}
