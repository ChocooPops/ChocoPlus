import { Component, Input } from '@angular/core';
import { UserModel } from '../../../dto/user.model';
import { NgClass } from '@angular/common';
import { UserHistoricComponent } from '../../user-historic/user-historic.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-detail-user',
  standalone: true,
  imports: [NgClass, UserHistoricComponent, ReactiveFormsModule],
  templateUrl: './detail-user.component.html',
  styleUrls: ['./detail-user.component.css', '../../../styles/role.css']
})
export class DetailUserComponent {

  @Input() user !: UserModel;
  @Input() back !: string;
  detailType: boolean = false;

  formGroup !: FormGroup;
  formControlFirstName: string = 'inputFirstName';
  formControlLastName: string = 'inputLastName';
  formControlPseudo: string = 'inputPseudo';
  formControlDateBorn: string = 'inputDateBorn';

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      inputFirstName: [this.user.firstName],
      inputLastName: [this.user.lastName],
      inputPseudo: [this.user.pseudo],
      inputDateBorn: ['']
    });
    this.formGroup.get(this.formControlDateBorn)?.setValue(new Date(this.user.dateBorn).toISOString().split('T')[0]);
    this.formGroup.disable();
  }

  displayInfoUser(): void {
    this.detailType = false;
  }

  displayStats(): void {
    this.detailType = true;
  }

}
