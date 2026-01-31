import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SavePathService {

  constructor(private router: Router) { }

  private oldPath: string = "";
  private id: number | undefined = undefined;

  public setActualPath(path: string): void {
    this.oldPath = path;
  }

  public setActualId(actualId: number | undefined): void {
    this.id = actualId;
  }

  public navigateToOldPath(): void {
    if (this.id === undefined) {
      this.router.navigateByUrl(this.oldPath);
    } else {
      this.router.navigate([this.oldPath, this.id]);
    }
  }

}
