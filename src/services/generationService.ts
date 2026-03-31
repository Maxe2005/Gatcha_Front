import { createApiClient } from './apiClient';

// Client dédié pour les endpoints de génération
const generationApi = createApiClient('/admin-service/api/v1');

export const generateMonster = async (prompt: string): Promise<any> => {
  const response = await generationApi.post('/monsters/generate', { prompt });
  return response.data;
};

export const generateMonsterBatch = async (
  n: number,
  prompt: string
): Promise<any> => {
  const response = await generationApi.post('/monsters/generate-batch', {
    n,
    prompt,
  });
  return response.data;
};

export const initiateImageGeneration = async (
  monsterId: string | number,
  imageName: string,
  customPrompt?: string
): Promise<any> => {
  const response = await generationApi.post('monsters/images/generate', {
    monster_id: monsterId,
    image_name: imageName,
    custom_prompt: customPrompt,
  });
  return response.data;
};
