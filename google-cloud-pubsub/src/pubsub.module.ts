import { PubSub } from '@google-cloud/pubsub';
import { Module } from '@nestjs/common';
import { PubSubService } from './pubsub.service';

@Module({
  providers: [
    {
      provide: PubSub,
      useValue: new PubSub(),
    },
    PubSubService,
  ],
  exports: [PubSubService],
})
export class PubSubModule {}
