import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.examiq.prediction',
  appName: 'ExamIQ AI Prediction',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
