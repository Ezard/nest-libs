import { DynamicModule, Module, ValueProvider } from '@nestjs/common';
import { app, initializeApp } from 'firebase-admin';
import { FIREBASE_APP } from './firebase.constants';
import { FirebaseModuleOptions } from './firebase.module-options';
import { FirebaseService } from './firebase.service';
import App = app.App;

@Module({})
export class FirebaseModule {
  static forRoot(options: FirebaseModuleOptions = {}): DynamicModule {
    return {
      module: FirebaseModule,
      providers: [
        {
          provide: FIREBASE_APP,
          useValue: initializeApp(options?.appOptions, options?.name),
        } as ValueProvider<App>,
        FirebaseService,
      ],
      exports: [FirebaseService],
    };
  }
}
