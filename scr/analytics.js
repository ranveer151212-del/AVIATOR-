import analytics from '@react-native-firebase/analytics';

// Analytics must never prevent the main app from working if collection is unavailable.
export async function logAppOpened() {
  try {
    await analytics().logAppOpen();
  } catch (error) {
    if (__DEV__) console.warn('Firebase Analytics logAppOpen failed:', error?.message);
  }
}

export async function logDashboardViewed() {
  try {
    await analytics().logEvent('dashboard_viewed');
  } catch (error) {
    if (__DEV__) console.warn('Firebase Analytics dashboard event failed:', error?.message);
  }
}
