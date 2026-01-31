import { SpriteModel } from "../models/sprite.interface";
import { BehaviorSubject, Observable } from "rxjs";
import { DimensionModel } from "../../common-module/models/dimension.interface";
import { ElementRef } from "@angular/core";

export class SpriteObserver {

    protected mainSpriteSubject: BehaviorSubject<SpriteModel> = new BehaviorSubject<SpriteModel>(this.getSpriteNull());
    protected sprite$: Observable<SpriteModel> = this.mainSpriteSubject.asObservable();

    protected isLoadSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    protected isLoad$: Observable<boolean> = this.isLoadSubject.asObservable();

    protected originelDimension: DimensionModel = { height: 0, width: 0 };
    private static id: number = 0;

    protected widthWindows!: number;

    public getSpriteNull(): SpriteModel {
        return {
            id: -1,
            image: '',
            x: 0,
            y: 0,
            height: 0,
            width: 0,
            speed: 0
        }
    }

    constructor(image: string, x: number, y: number, height: number, speed: number) {
        this.init(image, x, y, height, speed);
    }

    private async init(image: string, x: number, y: number, height: number, speed: number): Promise<void> {
        this.widthWindows = window.innerWidth;
        try {
            const dimension = await this.getImageDimensions(image);
            this.originelDimension = dimension;
            const ratio: number = dimension.height / height;
            const width: number = dimension.width / ratio;

            const sprite: SpriteModel = {
                id: SpriteObserver.id,
                image,
                x,
                y,
                height,
                width,
                speed,
            };
            this.updateSprite(sprite);
            this.isLoadSubject.next(true);
            SpriteObserver.id++;
        } catch (error) {
            console.error('Erreur dans init() SpriteObserver :', error);
        }
    }

    private getImageDimensions(src: string): Promise<DimensionModel> {
        return new Promise<DimensionModel>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.onerror = (e) => {
                console.error('Erreur de chargement d’image :', e);
                reject({ width: 0, height: 0 });
            };
            img.src = src;
        });
    }

    public getWidthWindows(): number {
        return this.widthWindows;
    }

    public setWidthWindows(width: number): void {
        this.widthWindows = width;
    }

    public getSprite(): Observable<SpriteModel> {
        return this.sprite$;
    }
    public getSpriteIsLoad(): Observable<boolean> {
        return this.isLoad$;
    }

    public updateSprite(newData: Partial<SpriteModel>): void {
        this.mainSpriteSubject.next({
            ...this.mainSpriteSubject.value,
            ...newData
        })
    }

    public setX(newX: number): void {
        this.updateSprite({ x: newX });
    }

    public setY(newY: number): void {
        this.updateSprite({ y: newY });
    }

    public setOffsetX(newOffsetX: number): void {
        this.updateSprite({ offsetX: newOffsetX });
    }

    public setOffsetY(newOffsetY: number): void {
        this.updateSprite({ offsetY: newOffsetY });
    }

    public setHeight(newHeight: number): void {
        this.updateSprite({ height: newHeight });
    }

    public setWidth(newWidth: number): void {
        this.updateSprite({ width: newWidth });
    }

    public setSpeed(newSpeed: number): void {
        this.updateSprite({ speed: newSpeed });
    }

    public setImageSrc(newImage: string): void {
        this.updateSprite({ image: newImage });
    }

    public getX(): number {
        return this.mainSpriteSubject.value.x;
    }
    public getY(): number {
        return this.mainSpriteSubject.value.y;
    }
    public getOffsetX(): number | undefined {
        return this.mainSpriteSubject.value.offsetX;
    }
    public getOffsetY(): number | undefined {
        return this.mainSpriteSubject.value.offsetY;
    }
    public getSpeed(): number {
        return this.mainSpriteSubject.value.speed;
    }
    public getHeight(): number {
        return this.mainSpriteSubject.value.height;
    }
    public getWidth(): number {
        return this.mainSpriteSubject.value.width;
    }
    public getOriginelDimension(): DimensionModel {
        return this.originelDimension;
    }
    public isLoad(): boolean {
        return this.isLoadSubject.value;
    }

    public setComponent(component: ElementRef): void {
        if (component) {
            this.updateSprite({ component: component });
            this.setClientRectCharacter();
        }
    }

    public setClientRectCharacter(): void {
        const component: ElementRef | undefined = this.mainSpriteSubject.value.component;
        if (component) {
            const rect = component.nativeElement.getBoundingClientRect();
            const newOffsetX: number = rect.left;
            const newOffsetY: number = rect.top;
            const newHeight: number = rect.height;
            const newWidth: number = rect.width;
            this.updateSprite(
                {
                    height: newHeight,
                    width: newWidth,
                    offsetX: newOffsetX,
                    offsetY: newOffsetY
                }
            );
        }
    }

    public checkCollisionWithOtherSprite(otherSprite: SpriteObserver): boolean {
        let collision: boolean = false;
        if (this.getY() < otherSprite.getY() + otherSprite.getHeight() &&
            this.getY() + this.getHeight() > otherSprite.getY() &&
            this.getX() < otherSprite.getX() + otherSprite.getWidth() &&
            this.getX() + this.getWidth() > otherSprite.getX()) {
            collision = true;
        }

        return collision;
    }

}