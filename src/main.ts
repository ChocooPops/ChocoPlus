import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { TranslateService } from '@ngx-translate/core';

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    const translate = appRef.injector.get(TranslateService);

    // // langues dispo
    // translate.addLangs(['en', 'fr']);
    // translate.setDefaultLang('en');

    // // 🔥 détection langue
    // let lang = 'en';

    // lang = navigator.language;

    // // normalisation (fr-FR → fr)
    // lang = lang.split('-')[0];

    // // sécurité
    // if (!['en', 'fr'].includes(lang)) {
    //   lang = 'en';
    // }

    // translate.use(lang);
  })
  .catch((err) => console.error(err));