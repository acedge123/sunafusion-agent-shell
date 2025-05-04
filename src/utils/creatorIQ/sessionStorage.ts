
// Save state data to session storage for immediate access
// This is useful for operations within the same session/conversation
export const saveStateToSessionStorage = (key: string, data: any): void => {
  try {
    const stateData = {
      key,
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(`ciq_state_${key}`, JSON.stringify(stateData));
    console.log(`State saved to session storage with key: ${key}`);
  } catch (error) {
    console.error("Error saving state to session storage:", error);
  }
};

// Get state data from session storage
export const getStateFromSessionStorage = (key: string): any => {
  try {
    const stateData = sessionStorage.getItem(`ciq_state_${key}`);
    if (!stateData) {
      return null;
    }
    return JSON.parse(stateData).data;
  } catch (error) {
    console.error("Error getting state from session storage:", error);
    return null;
  }
};
