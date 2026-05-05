import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { TranslateService } from '@ngx-translate/core';

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    const translate = appRef.injector.get(TranslateService);

    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');

    let lang = 'en';

    lang = navigator.language;

    lang = lang.split('-')[0];

    if (!['en', 'fr'].includes(lang)) {
      lang = 'en';
    }

    translate.use(lang);
  })
  .catch((err) => console.error(err));