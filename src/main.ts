import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppConfig } from '@core/config';
import { App } from 'app/app';

async function bootstrap() {
  const configService = new AppConfig();
  await configService.loadConfig();

  await bootstrapApplication(App, {
    ...appConfig,
    providers: [
      ...(appConfig.providers ?? []),
      { provide: AppConfig , useValue: configService }
    ]
  });
}

bootstrap().catch(err => console.error(err));
