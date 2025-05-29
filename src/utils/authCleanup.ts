
/**
 * Utility functions for cleaning up authentication state to prevent limbo states
 */

export const cleanupAuthState = () => {
  try {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if it exists
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('Auth state cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

export const forceSignOut = async (supabase: any) => {
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (error) {
    console.error('Force sign out error (continuing anyway):', error);
  }
};
