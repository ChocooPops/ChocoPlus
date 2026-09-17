import { ElementRef } from "@angular/core"

export interface SpriteModel {
    id: number,
    image: string,
    x: number,
    y: number,
    offsetX?: number,
    offsetY?: number,
    height: number,
    width: number,
    speed: number,
    component?: ElementRef
}