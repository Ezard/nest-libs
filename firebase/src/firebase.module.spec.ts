import { Test } from '@nestjs/testing';
import * as FirebaseAdmin from 'firebase-admin';
import { FirebaseModule } from './firebase.module';
import { FirebaseModuleOptions } from './firebase.module-options';

describe('FirebaseModule', () => {
  describe('forRoot', () => {
    it('should initialise the module without errors', async () => {
      const builder = await Test.createTestingModule({
        imports: [FirebaseModule.forRoot()],
      });

      const module = builder.compile();

      await expect(module).resolves.toBeDefined();
    });
  });

  it('should pass the provided FirebaseModuleOptions to FirebaseService', async () => {
    const initialiseApp = jest.spyOn(FirebaseAdmin, 'initializeApp');
    const options: FirebaseModuleOptions = {
      name: 'Foo',
      appOptions: {
        projectId: 'bar',
      },
    };

    await Test.createTestingModule({
      imports: [FirebaseModule.forRoot(options)],
    }).compile();

    expect(initialiseApp).toHaveBeenCalledWith(options.appOptions, options.name);
  });
});
