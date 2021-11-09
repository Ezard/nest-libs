import { Test } from '@nestjs/testing';
import { trace } from '@opentelemetry/api';
import { GoogleCloudTraceModule } from './google-cloud-trace.module';
import { GoogleCloudTraceService } from './google-cloud-trace.service';

describe('GoogleCloudTracePlugin', () => {
  describe('startSpan', () => {
    let googleCloudTraceService: GoogleCloudTraceService;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [GoogleCloudTraceModule.forRoot({ service: expect.getState().currentTestName })],
      }).compile();
      googleCloudTraceService = module.get(GoogleCloudTraceService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should use the default tracer', () => {
      const getTracerSpy = jest.spyOn(trace, 'getTracer');

      googleCloudTraceService.startSpan('foo');

      expect(getTracerSpy).toHaveBeenCalledWith('default');
    });

    it('should use the supplied name as the trace name', () => {
      const name = 'foo';
      const tracer = trace.getTracer('default');
      jest.spyOn(trace, 'getTracer').mockReturnValue(tracer);
      const startSpanSpy = jest.spyOn(tracer, 'startSpan');

      googleCloudTraceService.startSpan(name);

      expect(startSpanSpy).toHaveBeenCalledWith(name, expect.anything());
    });

    it("should set the trace's service attribute to be injected value", () => {
      const name = 'foo';
      const tracer = trace.getTracer('default');
      jest.spyOn(trace, 'getTracer').mockReturnValue(tracer);
      const startSpanSpy = jest.spyOn(tracer, 'startSpan');

      googleCloudTraceService.startSpan(name);

      expect(startSpanSpy).toHaveBeenCalledWith(expect.anything(), {
        attributes: {
          service: expect.getState().currentTestName,
        },
      });
    });

    it('should add the supplied attributes to the span', () => {
      const name = 'foo';
      const attributes = {
        bar: 'baz',
      };
      const tracer = trace.getTracer('default');
      jest.spyOn(trace, 'getTracer').mockReturnValue(tracer);
      const startSpanSpy = jest.spyOn(tracer, 'startSpan');

      googleCloudTraceService.startSpan(name, attributes);

      expect(startSpanSpy).toHaveBeenCalledWith(expect.anything(), {
        attributes: {
          service: expect.getState().currentTestName,
          ...attributes,
        },
      });
    });
  });
});
