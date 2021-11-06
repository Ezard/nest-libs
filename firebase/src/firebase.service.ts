import { Inject, Injectable } from '@nestjs/common';
import { App, AppOptions } from 'firebase-admin/app';
import { FIREBASE_APP } from './firebase.constants';

@Injectable()
export class FirebaseService implements App {
  constructor(@Inject(FIREBASE_APP) private readonly firebaseApp: App) {}

  get app(): App {
    return this.firebaseApp;
  }

  get name(): string {
    return this.firebaseApp.name;
  }

  get options(): AppOptions {
    return this.firebaseApp.options;
  }
}
