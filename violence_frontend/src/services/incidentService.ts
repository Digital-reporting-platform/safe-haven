import { supabase } from './api/client';
import { TABLES } from './api/endpoints';

export interface Incident {
  id?: string;
  title: string;
  description: string;
  status: string;
  // Add other fields as needed
}

export const getIncidents = async () => {
  const { data, error } = await supabase.from(TABLES.INCIDENTS).select('*');

  if (error) throw error;
  return data;
};

export const getIncidentById = async (id: string) => {
  const { data, error } = await supabase
    .from(TABLES.INCIDENTS)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createIncident = async (incident: Omit<Incident, 'id'>) => {
  const { data, error } = await supabase
    .from(TABLES.INCIDENTS)
    .insert(incident)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateIncident = async (
  id: string,
  updates: Partial<Incident>
) => {
  const { data, error } = await supabase
    .from(TABLES.INCIDENTS)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteIncident = async (id: string) => {
  const { error } = await supabase.from(TABLES.INCIDENTS).delete().eq('id', id);

  if (error) throw error;
};
