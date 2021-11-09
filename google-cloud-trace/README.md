# Nest Google Cloud Trace

## Installation

`npm i @apposing/nest-google-cloud-trace -S`

### Usage

`GoogleCloudTraceModule` should be imported into `AppModule` using the `forRoot()` static function, e.g.

```typescript
import { GoogleCloudTraceModule } from '@apposing/nest-google-cloud-trace';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    GoogleCloudTraceModule.forRoot({
      service: 'my-api-name'
    })
  ]
})
export class AppModule {
}
```

This will set up the global dependencies to allow for tracing

To enable automatic tracing of GraphQL operations, you will need to add `GoogleCloudTracePlugin` to your list of plugins:

```typescript
import { GoogleCloudTracePlugin } from '@apposing/nest-google-cloud-trace';
import { GraphQLModule } from '@nestjs/graphql';

GraphQLModule.forRoot({
  plugins: [new GoogleCloudTracePlugin()]
})
```
