import { FirebaseModule } from '@apposing/nest-firebase';
import { Test } from '@nestjs/testing';
import { FirebaseCloudMessagingModule } from './firebase-cloud-messaging.module';
import { FirebaseCloudMessagingService } from './firebase-cloud-messaging.service';

describe('FirebaseCloudMessagingModule', () => {
  it('should initialise the module without errors', async () => {
    const builder = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRoot({
          name: expect.getState().currentTestName,
        }),
        FirebaseCloudMessagingModule,
      ],
    });

    const module = builder.compile();

    await expect(module).resolves.toBeDefined();
  });

  it('should provide FirebaseCloudMessagingService', async () => {
    const module = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRoot({
          name: expect.getState().currentTestName,
        }),
        FirebaseCloudMessagingModule,
      ],
    }).compile();

    const firebaseCloudMessagingService = await module.get(FirebaseCloudMessagingService);

    expect(firebaseCloudMessagingService).toBeDefined();
  });
});
