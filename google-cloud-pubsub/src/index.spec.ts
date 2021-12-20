import { GoogleCloudPubSubModule, GoogleCloudPubSubService, GoogleCloudPubSubSubscription } from './index';

describe('index', () => {
  it('should export GoogleCloudPubSubModule', () => {
    expect(GoogleCloudPubSubModule).toBeDefined();
  });

  it('should export GoogleCloudPubSubService', () => {
    expect(GoogleCloudPubSubService).toBeDefined();
  });

  it('should export GoogleCloudPubSubSubscription', () => {
    expect(GoogleCloudPubSubSubscription).toBeDefined();
  });
});
