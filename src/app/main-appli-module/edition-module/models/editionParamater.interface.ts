import { MenuTabModel } from "../../menu-module/model/menu-tab.interface";

export interface EditionParameterModel {
    id: number,
    name: string,
    isClicked: boolean,
    underParameter: MenuTabModel[];
}