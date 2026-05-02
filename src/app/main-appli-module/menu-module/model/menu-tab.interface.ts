import { MenuType } from "./menu-type.enum"

export interface MenuTabModel {
    id: number,
    name: string,
    type: MenuType,
    route: string,
    srcImage?: string,
    isClicked: boolean
}