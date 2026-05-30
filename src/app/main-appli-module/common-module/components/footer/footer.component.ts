import { Component } from '@angular/core';
import { VersionService } from '../../../../common-module/services/version/version.service';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserParametersService } from '../../../user-module/service/user-parameters/user-parameters.service';
import { MenuType } from '../../../menu-module/model/menu-type.enum';
import { MenuTabModel } from '../../../menu-module/model/menu-tab.interface';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { TranslationLanguageService } from '../../../../common-module/services/translation-language/translation-language.service';
import { LangOption } from '../../../../common-module/models/lang_option.interface';
import { UpperCasePipe } from '@angular/common';
import { SupportedLang } from '../../../../common-module/models/supported-lang.enum';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe, RouterModule, CommonModule, UpperCasePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  appVersion!: string;
  buildDate!: string;
  readonly currentYear = new Date().getFullYear();

  readonly navLinks: MenuTabModel[] = [];
  readonly userLinks: MenuTabModel[] = [];
  readonly langs: LangOption[] = []

  constructor(private readonly versionService: VersionService,
      private readonly userParametersService: UserParametersService,
      private readonly menuTabService: MenuTabService,
      private readonly translationLanguageService: TranslationLanguageService
  ) { 
    const typesUserMenu: MenuType[] = [MenuType.PROFIL, MenuType.HISTORIC, MenuType.META_DATA, MenuType.DOCUMENTATION, MenuType.USER_SUPPORT];
    const typesNavMenu: MenuType[] = [MenuType.HOME, MenuType.MOVIES, MenuType.SERIES, MenuType.SEARCH, MenuType.CATALOG];
    
    this.userLinks = this.userParametersService.getUserParamByType(typesUserMenu);
    this.navLinks = this.menuTabService.getMenuTabByType(typesNavMenu);
    this.langs = this.translationLanguageService.availableLangs;
  }

  async ngOnInit() {
    this.appVersion = await this.versionService.getCurrentVersion();
    this.buildDate = new Date().getFullYear().toString();
  }

  onClickLang(lang: SupportedLang): void {
    this.translationLanguageService.setLang(lang);
  }

}
