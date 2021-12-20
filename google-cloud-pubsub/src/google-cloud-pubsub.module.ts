import { PubSub } from '@google-cloud/pubsub';
import { Module } from '@nestjs/common';
import { GoogleCloudPubsubService } from './google-cloud-pubsub.service';

@Module({
  providers: [
    {
      provide: PubSub,
      useValue: new PubSub(),
    },
    GoogleCloudPubsubService,
  ],
  exports: [GoogleCloudPubsubService],
})
export class GoogleCloudPubSubModule {}
