import type { NextWebVitalsMetric } from 'next/app';

const reportWebVitals = (metric: NextWebVitalsMetric) => {
  switch (metric.name) {
    case 'FCP': // First Contentful Paint
      console.log(`FCP: ${metric.startTime}`);
      break;
    case 'LCP': // Largest Contentful Paint
      console.log(`LCP: ${metric.startTime}`);
      break;
    case 'CLS': // Cumulative Layout Shift
      console.log(`CLS: ${metric.value}`);
      break;
    case 'FID': // First Input Delay
      console.log(`FID: ${metric.startTime}`);
      break;
    case 'TTFB': // Time to First Byte
      console.log(`TTFB: ${metric.startTime}`);
      break;
    default:
      break;
  }
};

export default reportWebVitals;
