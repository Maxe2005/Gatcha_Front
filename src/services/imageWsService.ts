export type ProgressCb = (payload: any) => void;
export type CompleteCb = (payload: any) => void;
export type ErrorCb = (payload: any) => void;

export const trackImageGeneration = (
  batchId: string,
  onProgress?: ProgressCb,
  onComplete?: CompleteCb,
  onError?: ErrorCb
): WebSocket => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // Passe par le préfixe /admin-service comme tous les appels au service
  // de génération (proxy Vite en dev, nginx en prod — les deux gèrent le WS)
  const ws = new WebSocket(
    `${protocol}//${window.location.host}/admin-service/api/v1/monsters/images/ws/${batchId}`
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
        onProgress?.({ image: JSON.parse(data.monster) });
      }
    } catch (e) {
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
