import { RoleModel } from "../../../common-module/models/role.enum"

export interface UserModel {
    id: number,
    pseudo: string,
    firstName: string,
    lastName: string,
    dateBorn: Date,
    email: string,
    role: RoleModel
    createdAt: Date,
    profilPhoto: string
}