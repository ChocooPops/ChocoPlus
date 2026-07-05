import { Component, Input, SimpleChanges } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SelectionModel } from '../../../models/selection.interface';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { Operation } from '../../../models/catalog/operation.enum';
import { FILTERS } from '../../../models/catalog/filters.interface';
import { FiltersCatalogService } from '../../../services/filters-catalog/filters-catalog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-see-everything',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './see-everything.component.html',
  styleUrl: './see-everything.component.css'
})
export class SeeEverythingComponent {

  @Input() selection!: SelectionModel;
  @Input() marginLeft!: number;
  @Input() nbPosterPerLine!: number;

  isUnlocked: boolean = false;
  isVisible: boolean = true;

  constructor(private readonly filtersCatalogService: FiltersCatalogService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    if (this.selection && (this.selection.createFrom === MediaTypeModel.SELECTION 
        || this.selection.createFrom === MediaTypeModel.CATEGORY
        || this.selection.createFrom === MediaTypeModel.LICENSE)
    ) {
      this.isUnlocked = true;
    }
    if (this.selection.createFrom === MediaTypeModel.LICENSE) {
      this.isVisible = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nbPosterPerLine'] && this.selection.createFrom !== MediaTypeModel.LICENSE) {
      if (this.selection.mediaList.length > this.nbPosterPerLine) {
        this.isVisible = true;
      } else {
        this.isVisible = false;
      }
    }
  }

  onClick(): void {
    if (!this.isUnlocked) return;

    const filters: FILTERS[] = [
      {
        id: -1,
        typeData: this.selection.createFrom as any,
        operation: Operation.CONTAIN,
        value: [
          {
            name: this.selection.name,
            value: this.selection.id
          }
        ]
      }
    ];
    this.filtersCatalogService.setFilterFromMediaPage(filters);
    this.router.navigateByUrl('main-app/catalog');
  }

}
