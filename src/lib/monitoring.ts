let sentryInited = false;

export function initMonitoring() {
  if (sentryInited) return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  try {
    // Lazy require to avoid client bundling if unused
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/nextjs');
    Sentry.init({ dsn, tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.05) });
    sentryInited = true;
  } catch {
    // ignore
  }
}

export function captureError(e: unknown, context?: Record<string, any>) {
  try {
    initMonitoring();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/nextjs');
    if (context) Sentry.setContext('extra', context);
    Sentry.captureException(e);
  } catch {
    // no-op
  }
}

