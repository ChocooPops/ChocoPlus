import { Component } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { DocumentationService } from '../../service/documentation/documentation.service';
import { DomSanitizer } from '@angular/platform-browser';
import { take } from 'rxjs';
import { UserParametersService } from '../../service/user-parameters/user-parameters.service';
import { MenuType } from '../../../menu-module/model/menu-type.enum';

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [],
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css', '../../../../common-module/styles/loader.css']
})
export class DocumentationComponent {
  
  pdfUrl!: SafeResourceUrl;

  constructor(private readonly userParametersService: UserParametersService,
    private readonly docService: DocumentationService,
    private readonly sanitizer: DomSanitizer
  ) { 
    this.userParametersService.initAllClickedValue(MenuType.DOCUMENTATION);
  }

  ngOnInit(): void {
    this.docService.getMainDocumentation().pipe(take(1)).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
  }

}
