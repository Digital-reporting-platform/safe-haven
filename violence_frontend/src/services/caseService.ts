import { supabase } from './api/client';
import { TABLES } from './api/endpoints';

export interface Case {
  id?: string;
  title: string;
  description: string;
  status: string;
  // Add other fields as needed
}

export const getCases = async () => {
  const { data, error } = await supabase.from(TABLES.CASES).select('*');

  if (error) throw error;
  return data;
};

export const getCaseById = async (id: string) => {
  const { data, error } = await supabase
    .from(TABLES.CASES)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createCase = async (caseData: Omit<Case, 'id'>) => {
  const { data, error } = await supabase
    .from(TABLES.CASES)
    .insert(caseData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCase = async (id: string, updates: Partial<Case>) => {
  const { data, error } = await supabase
    .from(TABLES.CASES)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCase = async (id: string) => {
  const { error } = await supabase.from(TABLES.CASES).delete().eq('id', id);

  if (error) throw error;
};
