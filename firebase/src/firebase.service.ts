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
  constructor(@Inject(FIREBASE_APP) private readonly app: App) {}

  get name(): string {
    return this.app.name;
  }

  get options(): AppOptions {
    return this.app.options;
  }

  appCheck(): AppCheck {
    return this.app.appCheck();
  }

  auth(): Auth {
    return this.app.auth();
  }

  database(url?: string): Database {
    return this.app.database(url);
  }

  delete(): Promise<void> {
    return this.app.delete();
  }

  firestore(): Firestore {
    return this.app.firestore();
  }

  installations(): Installations {
    return this.app.installations();
  }

  instanceId(): InstanceId {
    return this.app.instanceId();
  }

  machineLearning(): MachineLearning {
    return this.app.machineLearning();
  }

  messaging(): Messaging {
    return this.app.messaging();
  }

  projectManagement(): ProjectManagement {
    return this.app.projectManagement();
  }

  remoteConfig(): RemoteConfig {
    return this.app.remoteConfig();
  }

  securityRules(): SecurityRules {
    return this.app.securityRules();
  }

  storage(): Storage {
    return this.app.storage();
  }
}
