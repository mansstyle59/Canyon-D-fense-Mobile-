/**
 * Utility for triggering haptic feedback on mobile devices using the Vibration API.
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    switch (type) {
      case 'light':
        // A short, subtle tap
        window.navigator.vibrate(12);
        break;
      case 'medium':
        // A more pronounced tap
        window.navigator.vibrate(25);
        break;
      case 'heavy':
        // A strong vibration for impacts or explosions
        window.navigator.vibrate(65);
        break;
      case 'success':
        // Double tap for confirmation
        window.navigator.vibrate([15, 40, 20]);
        break;
      case 'warning':
        // Repetitive vibration for alerts
        window.navigator.vibrate([40, 80, 40]);
        break;
      case 'error':
        // Multiple vibrations for failure
        window.navigator.vibrate([60, 60, 60, 60]);
        break;
      default:
        window.navigator.vibrate(20);
    }
  }
}
