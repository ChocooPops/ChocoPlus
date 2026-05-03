import { OS } from "./os.enum";

export interface VersionModel {
    id: number,
    num: string,
    os: OS,
    link: string,
    createdAt: Date,
    updatedAt: Date
}