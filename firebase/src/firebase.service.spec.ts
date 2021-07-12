import { Test } from '@nestjs/testing';
import { app } from 'firebase-admin/lib/firebase-namespace-api';
import { FIREBASE_APP } from './firebase.constants';
import { FirebaseModule } from './firebase.module';
import { FirebaseService } from './firebase.service';
import App = app.App;

describe('FirebaseService', () => {
  async function setupFirebaseService(name: string, app: Partial<App>): Promise<FirebaseService> {
    const module = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRoot({
          name,
        }),
      ],
    })
      .overrideProvider(FIREBASE_APP)
      .useValue(app)
      .compile();
    return module.get(FirebaseService);
  }

  describe('name', () => {
    it('should return the name provided by the Firebase app', async () => {
      const returnValue = 'test';
      const firebaseService = await setupFirebaseService('name', {
        name: returnValue,
      });

      const name = firebaseService.name;

      expect(name).toBe(returnValue);
    });
  });

  describe('options', () => {
    it('should return the options object provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService('options', {
        options: returnValue,
      });

      const options = firebaseService.options;

      expect(options).toBe(returnValue);
    });
  });

  describe('appCheck', () => {
    it('should return the AppCheck instance provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService('appCheck', {
        appCheck: jest.fn().mockReturnValue(returnValue),
      });

      const appCheck = firebaseService.appCheck();

      expect(appCheck).toBe(returnValue);
    });
  });

  describe('auth', () => {
    it('should return the Auth instance provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService('auth', {
        auth: jest.fn().mockReturnValue(returnValue),
      });

      const auth = firebaseService.auth();

      expect(auth).toBe(returnValue);
    });
  });

  describe('database', () => {
    it('should return the Database instance provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService('database', {
        database: jest.fn().mockReturnValue(returnValue),
      });

      const database = firebaseService.database();

      expect(database).toBe(returnValue);
    });
  });

  describe('delete', () => {
    it('should call the delete function provided by the Firebase app', async () => {
      const deleteFn = jest.fn();
      const firebaseService = await setupFirebaseService('delete', {
        delete: deleteFn,
      });

      await firebaseService.delete();

      expect(deleteFn).toHaveBeenCalled();
    });
  });

  describe('firestore', () => {
    it('should return the Firestore instance provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService('firestore', {
        firestore: jest.fn().mockReturnValue(returnValue),
      });

      const firestore = firebaseService.firestore();

      expect(firestore).toBe(returnValue);
    });
  });

  describe('installations', () => {
    it('should return the Installations instance provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService('installations', {
        installations: jest.fn().mockReturnValue(returnValue),
      });

      const installations = firebaseService.installations();

      expect(installations).toBe(returnValue);
    });
  });

  describe('instanceId', () => {
    it('should return the InstanceId instance provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService('instanceId', {
        instanceId: jest.fn().mockReturnValue(returnValue),
      });

      const instanceId = firebaseService.instanceId();

      expect(instanceId).toBe(returnValue);
    });
  });

  describe('machineLearning', () => {
    it('should return the MachineLearning instance provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService('machineLearning', {
        machineLearning: jest.fn().mockReturnValue(returnValue),
      });

      const machineLearning = firebaseService.machineLearning();

      expect(machineLearning).toBe(returnValue);
    });
  });

  describe('messaging', () => {
    it('should return the Messaging instance provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService('messaging', {
        messaging: jest.fn().mockReturnValue(returnValue),
      });

      const messaging = firebaseService.messaging();

      expect(messaging).toBe(returnValue);
    });
  });

  describe('projectManagement', () => {
    it('should return the ProjectManagement instance provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService('projectManagement', {
        projectManagement: jest.fn().mockReturnValue(returnValue),
      });

      const projectManagement = firebaseService.projectManagement();

      expect(projectManagement).toBe(returnValue);
    });
  });

  describe('remoteConfig', () => {
    it('should return the RemoteConfig instance provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService('remoteConfig', {
        remoteConfig: jest.fn().mockReturnValue(returnValue),
      });

      const remoteConfig = firebaseService.remoteConfig();

      expect(remoteConfig).toBe(returnValue);
    });
  });

  describe('securityRules', () => {
    it('should return the SecurityRules instance provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService('securityRules', {
        securityRules: jest.fn().mockReturnValue(returnValue),
      });

      const securityRules = firebaseService.securityRules();

      expect(securityRules).toBe(returnValue);
    });
  });

  describe('storage', () => {
    it('should return the Storage instance provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService('storage', {
        storage: jest.fn().mockReturnValue(returnValue),
      });

      const storage = firebaseService.storage();

      expect(storage).toBe(returnValue);
    });
  });
});
