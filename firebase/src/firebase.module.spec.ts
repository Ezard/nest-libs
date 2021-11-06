import { Test } from '@nestjs/testing';
import * as FirebaseAdminApp from 'firebase-admin/app';
import { FirebaseModule } from './firebase.module';
import { FirebaseModuleOptions } from './firebase.module-options';
import { FirebaseService } from './firebase.service';

jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn().mockReturnValue({}),
}));

describe('FirebaseModule', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('forRoot', () => {
    it('should initialise the module without errors', async () => {
      const module = Test.createTestingModule({
        imports: [FirebaseModule.forRoot()],
      }).compile();

      await expect(module).resolves.toBeDefined();
    });
  });

  it('should pass the provided FirebaseModuleOptions to FirebaseService', async () => {
    const initialiseApp = jest.spyOn(FirebaseAdminApp, 'initializeApp');
    const options: FirebaseModuleOptions = {
      name: expect.getState().currentTestName,
      appOptions: {
        projectId: 'bar',
      },
    };

    await Test.createTestingModule({
      imports: [FirebaseModule.forRoot(options)],
    }).compile();

    expect(initialiseApp).toHaveBeenCalledWith(options.appOptions, options.name);
  });

  it('should provide FirebaseService', async () => {
    const module = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRoot({
          name: expect.getState().currentTestName,
        }),
      ],
    }).compile();

    const firebaseService = await module.get(FirebaseService);

    expect(firebaseService).toBeDefined();
  });
});
