'use strict';

// CloudLinux/Passenger loads its startup file through CommonJS. The backend is
// compiled as ES modules, so dynamically import the real server entry point.
import('./dist/src/server.js').catch((error) => {
  console.error('Backend startup failed:', error);
  process.exit(1);
});
