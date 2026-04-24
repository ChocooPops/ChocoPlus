export interface FilterChoiceModel {
    id: number,
    name: string,
    value: any,
    isSelected: 0 | 1 | 2 //0 => affiché, 1 => sélectionné, 2 => non disponible
}