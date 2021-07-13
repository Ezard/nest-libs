import { Inject, Injectable } from '@nestjs/common';
import {
  app,
  appCheck,
  auth,
  database,
  installations,
  instanceId,
  machineLearning,
  messaging,
  projectManagement,
  remoteConfig,
  securityRules,
  storage,
} from 'firebase-admin';
import { AppOptions } from 'firebase-admin/lib/firebase-namespace-api';
import { FIREBASE_APP } from './firebase.constants';
import App = app.App;
import AppCheck = appCheck.AppCheck;
import Auth = auth.Auth;
import Database = database.Database;
import Firestore = FirebaseFirestore.Firestore;
import Installations = installations.Installations;
import InstanceId = instanceId.InstanceId;
import MachineLearning = machineLearning.MachineLearning;
import Messaging = messaging.Messaging;
import ProjectManagement = projectManagement.ProjectManagement;
import RemoteConfig = remoteConfig.RemoteConfig;
import SecurityRules = securityRules.SecurityRules;
import Storage = storage.Storage;

@Injectable()
export class FirebaseService implements App {
  constructor(@Inject(FIREBASE_APP) private readonly firebaseApp: App) {}

  get name(): string {
    return this.firebaseApp.name;
  }

  get options(): AppOptions {
    return this.firebaseApp.options;
  }

  appCheck(): AppCheck {
    return this.firebaseApp.appCheck();
  }

  auth(): Auth {
    return this.firebaseApp.auth();
  }

  database(url?: string): Database {
    return this.firebaseApp.database(url);
  }

  delete(): Promise<void> {
    return this.firebaseApp.delete();
  }

  firestore(): Firestore {
    return this.firebaseApp.firestore();
  }

  installations(): Installations {
    return this.firebaseApp.installations();
  }

  instanceId(): InstanceId {
    return this.firebaseApp.instanceId();
  }

  machineLearning(): MachineLearning {
    return this.firebaseApp.machineLearning();
  }

  messaging(): Messaging {
    return this.firebaseApp.messaging();
  }

  projectManagement(): ProjectManagement {
    return this.firebaseApp.projectManagement();
  }

  remoteConfig(): RemoteConfig {
    return this.firebaseApp.remoteConfig();
  }

  securityRules(): SecurityRules {
    return this.firebaseApp.securityRules();
  }

  storage(): Storage {
    return this.firebaseApp.storage();
  }
}
