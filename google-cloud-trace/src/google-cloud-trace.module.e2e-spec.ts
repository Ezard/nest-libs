import { Inject, Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TRACE_SERVICE } from './constants';
import { GoogleCloudTraceModule } from './google-cloud-trace.module';
import { GoogleCloudTracePlugin } from './google-cloud-trace.plugin';
import { GoogleCloudTraceService } from './google-cloud-trace.service';

@Injectable()
class TraceServiceTestService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(@Inject(TRACE_SERVICE) _: string) {
    // unused
  }
}

@Module({
  imports: [GoogleCloudTraceModule.forRoot({ service: 'foo' })],
  providers: [TraceServiceTestService],
})
class TraceServiceTestModule {}

@Injectable()
class GoogleCloudTraceServiceTestService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_: GoogleCloudTraceService) {
    // unused
  }
}

@Module({
  imports: [GoogleCloudTraceModule.forRoot({ service: 'foo' })],
  providers: [GoogleCloudTraceServiceTestService],
})
class GoogleCloudTraceServiceTestModule {}

@Injectable()
class GoogleCloudTracePluginTestService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_: GoogleCloudTracePlugin) {
    // unused
  }
}

@Module({
  imports: [GoogleCloudTraceModule.forRoot({ service: 'foo' })],
  providers: [GoogleCloudTracePluginTestService],
})
class GoogleCloudTracePluginTestModule {}

describe('GoogleCloudTraceModule', () => {
  it('should export TRACE_SERVICE', async () => {
    const testModule = Test.createTestingModule({
      imports: [TraceServiceTestModule],
    }).compile();

    await expect(testModule).resolves.toBeDefined();
  });

  it('should export GoogleCloudTraceService', async () => {
    const testModule = Test.createTestingModule({
      imports: [GoogleCloudTraceServiceTestModule],
    }).compile();

    await expect(testModule).resolves.toBeDefined();
  });

  it('should export GoogleCloudTracePlugin', async () => {
    const testModule = Test.createTestingModule({
      imports: [GoogleCloudTracePluginTestModule],
    }).compile();

    await expect(testModule).resolves.toBeDefined();
  });
});
