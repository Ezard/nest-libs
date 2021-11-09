import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { Test } from '@nestjs/testing';
import { BasicTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SPAN_EXPORTER, TRACER_PROVIDER } from './constants';
import { GoogleCloudTraceModule } from './google-cloud-trace.module';

describe('GoogleCloudTraceModule', () => {
  it('should initialise without errors', async () => {
    const testModule = Test.createTestingModule({
      imports: [GoogleCloudTraceModule.forRoot({ service: expect.getState().currentTestName })],
    });
    let error: unknown | undefined;

    try {
      await testModule.compile();
    } catch (e) {
      error = e;
    }

    expect(error).toBeUndefined();
  });

  describe('onApplicationBootstrap', () => {
    it('should register the tracer provider and add a span processor', async () => {
      const module = await Test.createTestingModule({
        imports: [GoogleCloudTraceModule.forRoot({ service: expect.getState().currentTestName })],
      }).compile();
      const googleCloudTraceModule = module.get(GoogleCloudTraceModule);
      const tracerProvider = module.get<BasicTracerProvider>(TRACER_PROVIDER);
      const spanExporter = module.get<TraceExporter>(SPAN_EXPORTER);
      const registerSpy = jest.spyOn(tracerProvider, 'register');
      const addSpanProcessorSpy = jest.spyOn(tracerProvider, 'addSpanProcessor');

      await googleCloudTraceModule.onApplicationBootstrap();

      expect(registerSpy).toHaveBeenCalled();
      expect(addSpanProcessorSpy).toHaveBeenCalledWith(new BatchSpanProcessor(spanExporter));
    });
  });

  describe('onApplicationShutdown', () => {
    it('should shutdown the tracer provider', async () => {
      const module = await Test.createTestingModule({
        imports: [GoogleCloudTraceModule.forRoot({ service: expect.getState().currentTestName })],
      }).compile();
      const googleCloudTraceModule = module.get(GoogleCloudTraceModule);
      const tracerProvider = module.get<BasicTracerProvider>(TRACER_PROVIDER);
      const shutdownSpy = jest.spyOn(tracerProvider, 'shutdown');

      await googleCloudTraceModule.onApplicationShutdown();

      expect(shutdownSpy).toHaveBeenCalled();
    });
  });
});
