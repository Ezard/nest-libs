import { Test } from '@nestjs/testing';
import { App } from 'firebase-admin/app';
import { FIREBASE_APP } from './firebase.constants';
import { FirebaseModule } from './firebase.module';
import { FirebaseService } from './firebase.service';

describe('FirebaseService', () => {
  async function setupFirebaseService(firebaseApp: Partial<App>): Promise<FirebaseService> {
    const module = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRoot({
          name: expect.getState().currentTestName,
        }),
      ],
    })
      .overrideProvider(FIREBASE_APP)
      .useValue(firebaseApp)
      .compile();
    return module.get(FirebaseService);
  }

  describe('app', () => {
    it('should return the Firebase app', async () => {
      const returnValue = { name: 'Foo' } as App;
      const firebaseService = await setupFirebaseService(returnValue);

      const app = firebaseService.app;

      expect(app).toBe(returnValue);
    });
  });

  describe('name', () => {
    it('should return the name provided by the Firebase app', async () => {
      const returnValue = 'test';
      const firebaseService = await setupFirebaseService({
        name: returnValue,
      });

      const name = firebaseService.name;

      expect(name).toBe(returnValue);
    });
  });

  describe('options', () => {
    it('should return the options object provided by the Firebase app', async () => {
      const returnValue = {};
      const firebaseService = await setupFirebaseService({
        options: returnValue,
      });

      const options = firebaseService.options;

      expect(options).toBe(returnValue);
    });
  });
});
