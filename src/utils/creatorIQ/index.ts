
import { supabase } from "@/integrations/supabase/client";

// Re-export all functions and types from their respective modules
export * from "./types";
export * from "./sessionStorage";
export * from "./dbStorage";
export * from "./dataExtraction";

// Generate a unique state key based on user ID and query
export const generateStateKey = (userId: string, query: string): string => {
  return `ciq_${userId}_${query.replace(/\s+/g, '_').toLowerCase().substring(0, 20)}_${Date.now()}`;
};
