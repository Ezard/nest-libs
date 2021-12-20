import { GoogleCloudPubSubModule, GoogleCloudPubsubService, GoogleCloudPubSubSubscription } from './index';

describe('index', () => {
  it('should export GoogleCloudPubSubModule', () => {
    expect(GoogleCloudPubSubModule).toBeDefined();
  });

  it('should export GoogleCloudPubsubService', () => {
    expect(GoogleCloudPubsubService).toBeDefined();
  });

  it('should export GoogleCloudPubSubSubscription', () => {
    expect(GoogleCloudPubSubSubscription).toBeDefined();
  });
});
