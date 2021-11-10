import {
  ContextWithRootSpan,
  GoogleCloudTraceModule,
  GoogleCloudTraceModuleOptions,
  GoogleCloudTracePlugin,
  GoogleCloudTraceService,
  SPAN_EXPORTER,
  TRACE_SERVICE,
  TRACER_PROVIDER,
} from './index';

describe('index', () => {
  it('should export ContextWithRootSpan', () => {
    const context: ContextWithRootSpan = {};
    expect(context).toBeDefined();
  });

  it('should export GoogleCloudTraceModule', () => {
    expect(GoogleCloudTraceModule).toBeDefined();
  });

  it('should export GoogleCloudTraceModuleOptions', () => {
    const options: GoogleCloudTraceModuleOptions = { service: '' };
    expect(options).toBeDefined();
  });

  it('should export GoogleCloudTracePlugin', () => {
    expect(GoogleCloudTracePlugin).toBeDefined();
  });

  it('should export GoogleCloudTraceService', () => {
    expect(GoogleCloudTraceService).toBeDefined();
  });

  it('should export SPAN_EXPORTER', () => {
    expect(SPAN_EXPORTER).toBeDefined();
  });

  it('should export TRACE_SERVICE', () => {
    expect(TRACE_SERVICE).toBeDefined();
  });

  it('should export TRACER_PROVIDER', () => {
    expect(TRACER_PROVIDER).toBeDefined();
  });
});
