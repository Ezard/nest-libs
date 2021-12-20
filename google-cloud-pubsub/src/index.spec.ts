import { PubSubModule, PubSubService, PubSubSubscription } from './index';

describe('index', () => {
  it('should export PubSubModule', () => {
    expect(PubSubModule).toBeDefined();
  });

  it('should export PubSubService', () => {
    expect(PubSubService).toBeDefined();
  });

  it('should export PubSubSubscription', () => {
    expect(PubSubSubscription).toBeDefined();
  });
});
