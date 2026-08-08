import { supabase } from './api/client';
import { TABLES } from './api/endpoints';

export interface Forum {
  id?: string;
  title: string;
  description: string;
  category: string;
  // Add other fields as needed
}

export const getForums = async () => {
  const { data, error } = await supabase.from(TABLES.FORUMS).select('*');

  if (error) throw error;
  return data;
};

export const getForumById = async (id: string) => {
  const { data, error } = await supabase
    .from(TABLES.FORUMS)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createForum = async (forum: Omit<Forum, 'id'>) => {
  const { data, error } = await supabase
    .from(TABLES.FORUMS)
    .insert(forum)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateForum = async (id: string, updates: Partial<Forum>) => {
  const { data, error } = await supabase
    .from(TABLES.FORUMS)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteForum = async (id: string) => {
  const { error } = await supabase.from(TABLES.FORUMS).delete().eq('id', id);

  if (error) throw error;
};
