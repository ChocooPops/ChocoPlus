import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { TranslationLanguageService } from './app/common-module/services/translation-language/translation-language.service';

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    appRef.injector.get(TranslationLanguageService);
  })
  .catch((err) => console.error(err));