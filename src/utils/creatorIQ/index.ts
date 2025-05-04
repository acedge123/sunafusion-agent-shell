
import { supabase } from "@/integrations/supabase/client";

// Re-export all functions and types from their respective modules
export * from "./types";
export * from "./dbStorage";
export * from "./dataExtraction";
export * from "./errorHandling";

// Export sessionStorage utilities but avoid ambiguous re-export
import { creatorIQCache as cache } from "./sessionStorage";
export { cache as creatorIQCache };

// Generate a unique state key based on user ID and query
export const generateStateKey = (userId: string, query: string): string => {
  return `ciq_${userId}_${query.replace(/\s+/g, '_').toLowerCase().substring(0, 20)}_${Date.now()}`;
};
