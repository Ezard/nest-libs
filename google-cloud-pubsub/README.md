# Nest Google Cloud Pub/Sub

## Installation

`npm i @apposing/nest-google-cloud-pubsub -S`

### Usage

Observing a subscription returns an async generator, which can be used with `for await...of` syntax, e.g.

```typescript
import { PubSubService, PubSubSubscription } from '@apposing/nest-google-cloud-pubsub';

let pubSubService: PubSubService;
let pubSubSubscription: PubSubSubscription = pubSubService.observeSubscription('topicName', 'subscriptionName');

for await (const message of pubSubSubscription) {
  // do something with each message
}
```
