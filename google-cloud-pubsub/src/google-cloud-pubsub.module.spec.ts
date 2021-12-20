import { Test } from '@nestjs/testing';
import { GoogleCloudPubSubModule } from './google-cloud-pubsub.module';

describe('GoogleCloudPubSubModule', () => {
  it('should initialise the module without errors', async () => {
    const module = Test.createTestingModule({
      imports: [GoogleCloudPubSubModule],
    }).compile();

    await expect(module).resolves.toBeDefined();
  });
});
