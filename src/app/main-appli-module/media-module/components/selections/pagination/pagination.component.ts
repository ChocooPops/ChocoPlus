import { Component, Input } from '@angular/core';
import { PaginationModel } from '../../../models/pagination.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [NgClass],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {

  @Input() pagination: PaginationModel[] = [];
  @Input() marginLeft !: number;

}
