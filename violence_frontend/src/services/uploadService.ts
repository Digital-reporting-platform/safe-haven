import { supabase } from './api/client';
import { TABLES } from './api/endpoints';

export interface UploadResult {
  id: string;
  path: string;
  fullPath: string;
  url: string;
}

export const uploadFile = async (
  file: File,
  bucket: string = TABLES.UPLOADS,
  path?: string
): Promise<UploadResult> => {
  const filePath = path || `${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    id: data.id,
    path: data.path,
    fullPath: data.fullPath,
    url: urlData.publicUrl,
  };
};

export const downloadFile = async (
  path: string,
  bucket: string = TABLES.UPLOADS
) => {
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) throw error;
  return data;
};

export const getFileUrl = (path: string, bucket: string = TABLES.UPLOADS) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
};

export const deleteFile = async (
  paths: string[],
  bucket: string = TABLES.UPLOADS
) => {
  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) throw error;
};

export const listFiles = async (
  bucket: string = TABLES.UPLOADS,
  path?: string
) => {
  const { data, error } = await supabase.storage.from(bucket).list(path);

  if (error) throw error;
  return data;
};
