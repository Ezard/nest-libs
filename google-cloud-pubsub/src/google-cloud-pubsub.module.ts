import { PubSub } from '@google-cloud/pubsub';
import { DynamicModule, Module } from '@nestjs/common';
import { GoogleCloudPubSubOptions } from './google-cloud-pubsub-options';
import { GoogleCloudPubSubService } from './google-cloud-pubsub.service';

@Module({
  providers: [GoogleCloudPubSubService],
  exports: [GoogleCloudPubSubService],
})
export class GoogleCloudPubSubModule {
  static forRoot(options?: GoogleCloudPubSubOptions): DynamicModule {
    return {
      global: true,
      module: GoogleCloudPubSubModule,
      providers: [
        {
          provide: PubSub,
          useValue: new PubSub({
            projectId: options?.projectId,
          }),
        },
      ],
      exports: [PubSub],
    };
  }
}
