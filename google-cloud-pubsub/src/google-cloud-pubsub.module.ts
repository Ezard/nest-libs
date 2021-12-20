import { PubSub } from '@google-cloud/pubsub';
import { Module } from '@nestjs/common';
import { GoogleCloudPubSubService } from './google-cloud-pubsub.service';

@Module({
  providers: [
    {
      provide: PubSub,
      useValue: new PubSub(),
    },
    GoogleCloudPubSubService,
  ],
  exports: [GoogleCloudPubSubService],
})
export class GoogleCloudPubSubModule {}
