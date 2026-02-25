import axios from 'axios';

// Create flexible instances that can work with proxy in dev
// In production/docker, we might need a different strategy (e.g. nginx routing)
// For now, we assume the proxy in vite.config.js handles routing to localhost ports
// or in docker we configure the proxy to point to service names if we were using a node server.
// But valid client-side code runs in browser, so "service names" don't resolve.
// The browser needs to hit localhost (if exposed) or the same origin (if served/proxied).
// We will use the relative paths matching the proxy.

export const monstersApi = axios.create({
  baseURL: '/monsters-service',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const joueurApi = axios.create({
  baseURL: '/joueur-service',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = axios.create({
  baseURL: '/auth-service',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const invocationApi = axios.create({
  baseURL: '/invocation-service',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const adminApi = axios.create({
  baseURL: '/admin-service/api/v1/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API for generation endpoints
export const generationApi = axios.create({
  baseURL: '/admin-service/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor
const addToken = (config) => {
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
  const token = match ? match[2] : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Assuming Bearer token
  }
  return config;
};

monstersApi.interceptors.request.use(addToken);
joueurApi.interceptors.request.use(addToken);
authApi.interceptors.request.use(addToken);
invocationApi.interceptors.request.use(addToken);

adminApi.interceptors.request.use(addToken);
generationApi.interceptors.request.use(addToken);

// Generation API functions
export const generateMonster = async (prompt) => {
  try {
    const response = await generationApi.post('/monsters/generate', { prompt });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || error.message;
  }
};

export const generateMonsterBatch = async (n, prompt) => {
  try {
    const response = await generationApi.post('/monsters/generate-batch', {
      n,
      prompt,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || error.message;
  }
};

// Image generation API functions (async with WebSocket)
export const initiateImageGeneration = async (
  monsterId,
  imageName,
  customPrompt
) => {
  try {
    const response = await generationApi.post('monsters/images/generate', {
      monster_id: monsterId,
      image_name: imageName,
      custom_prompt: customPrompt,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || error.message;
  }
};

export const trackImageGeneration = (
  batchId,
  onProgress,
  onComplete,
  onError
) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(
    `${protocol}//${window.location.host}/api/v1/monsters/images/ws/${batchId}`
  );

  ws.onopen = () => {
    console.log(
      `[Image Generation] Connecté au WebSocket pour batch_id: ${batchId}`
    );
    onProgress?.({ status: 'Initialisation de la génération...' });
  };

  ws.onmessage = (event) => {
    const message = event.data;
    console.log('[Image Generation] Message reçu:', message);
    try {
      const data = JSON.parse(message);
      if (data.success) {
        onComplete?.({ success: true });
        ws.close();
      } else if (data.error) {
        onError?.({ error: data.error });
      } else if (data.info) {
        onProgress?.({ info: data.info });
      } else if (data.monster) {
        // Image générée avec succès
        onProgress?.({ image: JSON.parse(data.monster) });
      }
    } catch (e) {
      // Message texte brut
      onProgress?.({ status: message });
    }
  };

  ws.onerror = (error) => {
    console.error('[Image Generation] WebSocket erreur:', error);
    onError?.({ error: 'Erreur de connexion WebSocket' });
  };

  ws.onclose = () => {
    console.log('[Image Generation] WebSocket fermé');
  };

  return ws;
};
