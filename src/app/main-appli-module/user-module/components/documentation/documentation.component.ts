import { Component } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { DocumentationService } from '../../service/documentation/documentation.service';
import { DomSanitizer } from '@angular/platform-browser';
import { take } from 'rxjs';

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [],
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css', '../../../../common-module/styles/loader.css']
})
export class DocumentationComponent {
  
  pdfUrl!: SafeResourceUrl;

  constructor(
    private docService: DocumentationService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.docService.getMainDocumentation().pipe(take(1)).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
  }

}
