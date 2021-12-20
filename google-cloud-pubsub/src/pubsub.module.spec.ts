import { Test } from '@nestjs/testing';
import { PubSubModule } from './pubsub.module';

describe('PubSubModule', () => {
  it('should initialise the module without errors', async () => {
    const module = Test.createTestingModule({
      imports: [PubSubModule],
    }).compile();

    await expect(module).resolves.toBeDefined();
  });
});
