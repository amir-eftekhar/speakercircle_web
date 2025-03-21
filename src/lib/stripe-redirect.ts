/**
 * Utility function for reliably redirecting to Stripe checkout
 * This uses multiple methods to ensure the redirect works across different browsers
 */
export function redirectToStripe(url: string): void {
  if (!url) {
    console.error('Cannot redirect to empty URL');
    return;
  }

  console.log('Redirecting to Stripe:', url);
  
  try {
    // Primary method: direct location change
    window.location.href = url;
    
    // Backup method: after a short delay, try again with assign()
    setTimeout(() => {
      try {
        window.location.assign(url);
      } catch (error) {
        console.error('Fallback redirect error:', error);
        // Last resort: open in new tab
        window.open(url, '_blank');
      }
    }, 100);
  } catch (error) {
    console.error('Primary redirect error:', error);
    
    // Try alternative methods
    try {
      window.location.assign(url);
    } catch {
      // If all else fails, open in new tab
      window.open(url, '_blank');
    }
  }
}
