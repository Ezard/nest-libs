import { DynamicModule, Module, ValueProvider } from '@nestjs/common';
import { App, initializeApp } from 'firebase-admin/app';
import { FIREBASE_APP } from './firebase.constants';
import { FirebaseModuleOptions } from './firebase.module-options';
import { FirebaseService } from './firebase.service';

@Module({})
export class FirebaseModule {
  static forRoot(options: FirebaseModuleOptions = {}): DynamicModule {
    return {
      module: FirebaseModule,
      global: true,
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
