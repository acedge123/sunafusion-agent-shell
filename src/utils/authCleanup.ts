
/**
 * Utility functions for cleaning up authentication state to prevent limbo states
 */

export const cleanupAuthState = () => {
  try {
    console.log('Starting comprehensive auth cleanup...');
    
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('supabase')) {
        console.log('Removing localStorage key:', key);
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if it exists
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('supabase')) {
          console.log('Removing sessionStorage key:', key);
          sessionStorage.removeItem(key);
        }
      });
    }
    
    // Clear any IndexedDB data related to Supabase
    try {
      if ('indexedDB' in window) {
        indexedDB.deleteDatabase('supabase-auth');
        indexedDB.deleteDatabase('supabase');
      }
    } catch (e) {
      console.log('IndexedDB cleanup failed (continuing anyway):', e);
    }
    
    console.log('Auth state cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

export const forceSignOut = async (supabase: any) => {
  try {
    console.log('Attempting force sign out...');
    await supabase.auth.signOut({ scope: 'global' });
    console.log('Force sign out completed');
  } catch (error) {
    console.error('Force sign out error (continuing anyway):', error);
  }
};

export const clearAllBrowserData = async () => {
  try {
    // Clear localStorage and sessionStorage
    cleanupAuthState();
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
    });
    
    // Clear caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    console.log('All browser data cleared');
  } catch (error) {
    console.error('Error clearing browser data:', error);
  }
};
