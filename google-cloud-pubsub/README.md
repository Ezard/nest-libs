# Nest Google Cloud Pub/Sub

## Installation

`npm i @apposing/nest-google-cloud-pubsub -S`

### Usage

Add `GoogleCloudPubSubModule.forRoot()` to your main module's imports array,
and then add `GoogleCloudPubSubModule` to the imports array of any module where you wish to use `GoogleCloudPubSubService`

Observing a subscription returns an async generator, which can be used with `for await...of` syntax, e.g.

```typescript
import { GoogleCloudPubSubService, GoogleCloudPubSubSubscription } from '@apposing/nest-google-cloud-pubsub';

let pubSubService: GoogleCloudPubSubService;
let pubSubSubscription = pubSubService.observeSubscription('topicName', 'subscriptionName');

for await (const message of pubSubSubscription) {
  // do something with each message
}
```
