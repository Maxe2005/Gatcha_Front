import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Typography,
  Stack,
  LinearProgress,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Header from '../components/Header';
import { generateMonster, generateMonsterBatch } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import './GenerateMonsters.css';

const GenerateMonsters = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const {
    success,
    error: showError,
    addNotification,
    removeNotification,
  } = useNotification();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [batchCount, setBatchCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMonsters, setGeneratedMonsters] = useState([]);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pendingBatch, setPendingBatch] = useState(null); // { prompt, batchCount, startedAt, batchId }
  const wsRef = useRef(null);

  const isMountedRef = useRef(true);
  const pageRef = useRef(null);

  // Déclencher l'animation de transition lors du changement de thème
  useEffect(() => {
    if (pageRef.current) {
      pageRef.current.classList.add('theme-switching');
      const timer = setTimeout(() => {
        if (pageRef.current) {
          pageRef.current.classList.remove('theme-switching');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [theme]);

  // Gestion du flag "génération en cours" dans le localStorage
  useEffect(() => {
    // Nettoyage du ref
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Au chargement, vérifier s'il y a une génération en cours (persistée)
  useEffect(() => {
    const pending = localStorage.getItem('monsterBatchPending');
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        setPendingBatch(parsed);
        setPrompt(parsed.prompt);
        setBatchCount(parsed.batchCount);
        setIsLoading(true);
        setStartTime(parsed.startedAt);
      } catch (e) {
        localStorage.removeItem('monsterBatchPending');
      }
    }
  }, []);

  // Timer pour le temps écoulé
  useEffect(() => {
    if (!isLoading || !startTime) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading, startTime]);

  // Suivi WebSocket (sera branché après POST)
  useEffect(() => {
    if (!pendingBatch || !pendingBatch.batchId) return;
    let ws;
    let isClosed = false;
    let monsters = [];
    ws = new window.WebSocket(
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://localhost:8000/api/v1/monsters/ws/${pendingBatch.batchId}`
    );
    wsRef.current = ws;
    ws.onmessage = (event) => {
      if (event.data === 'Génération terminée') {
        setIsLoading(false);
        setPendingBatch(null);
        localStorage.removeItem('monsterBatchPending');
        success(`✅ ${monsters.length} monstre(s) généré(s) avec succès !`);
        ws.close();
        isClosed = true;
      } else {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            const errorMessage = parseErrorMessage(data.error);
            setError(errorMessage);
            showError(`❌ Erreur: ${errorMessage}`);
            setIsLoading(false);
            setPendingBatch(null);
            localStorage.removeItem('monsterBatchPending');
            if (!isClosed) ws.close();
          }
          else if (data.info) {
            addNotification(`ℹ️ ${data.info}`, 'info', 20000);
          } else if (data.monster) {
            const monster = data.monster;
            monsters.push(monster);
            setGeneratedMonsters((prev) => [...prev, monster]);

            addNotification(
              `✅ Monstre généré : ${monster.nom || 'Inconnu'}`,
              'success',
              20000
            );
          }
        } catch (e) {
          // ignore parse error
        }
      }
    };
    ws.onerror = () => {
      setError('Erreur WebSocket lors du suivi de la génération.');
      setIsLoading(false);
      setPendingBatch(null);
      localStorage.removeItem('monsterBatchPending');
      if (!isClosed) ws.close();
    };
    return () => {
      if (ws && ws.readyState === 1) ws.close();
    };
  }, [pendingBatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const parseErrorMessage = (errorMsg) => {
    if (!errorMsg) return 'Une erreur inconnue est survenue';

    // If it's a simple string, return it
    if (typeof errorMsg === 'string') {
      return errorMsg;
    }

    // Try to extract meaningful error message
    const str = String(errorMsg);
    const lines = str.split('\n');
    return lines[0] || str;
  };

  const startBackgroundNotification = (label) =>
    addNotification(`⏳ ${label} en cours...`, 'info', 0);

  const finishBackgroundNotification = (notificationId) => {
    if (notificationId) removeNotification(notificationId);
  };

  const handleGenerateSingle = async () => {
    if (!prompt.trim()) {
      showError('Veuillez entrer un prompt');
      return;
    }
    if (localStorage.getItem('monsterBatchPending')) {
      showError('Une génération de monstres est déjà en cours.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedMonsters([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    const notificationId = startBackgroundNotification('Generation du monstre');
    try {
      const result = await generateMonster(prompt);
      if (result && result.batch_id) {
        const pending = {
          prompt,
          batchCount: 1,
          startedAt: Date.now(),
          batchId: result.batch_id,
        };
        localStorage.setItem('monsterBatchPending', JSON.stringify(pending));
        setPendingBatch(pending);
      } else {
        throw new Error('Réponse inattendue du serveur (pas de batch_id)');
      }
    } catch (err) {
      const errorMessage = parseErrorMessage(err);
      setError(errorMessage);
      showError(`❌ Erreur: ${errorMessage}`);
      setIsLoading(false);
      setPendingBatch(null);
      localStorage.removeItem('monsterBatchPending');
    } finally {
      finishBackgroundNotification(notificationId);
    }
  };

  const handleGenerateBatch = async () => {
    if (!prompt.trim()) {
      showError('Veuillez entrer un prompt');
      return;
    }
    if (batchCount < 1 || batchCount > 10) {
      showError('Le nombre de monstres doit être entre 1 et 10');
      return;
    }
    if (localStorage.getItem('monsterBatchPending')) {
      showError('Une génération de monstres est déjà en cours.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedMonsters([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    const notificationId = startBackgroundNotification(
      `Generation de ${batchCount} monstre(s)`
    );
    try {
      const result = await generateMonsterBatch(batchCount, prompt);
      if (result && result.batch_id) {
        const pending = {
          prompt,
          batchCount,
          startedAt: Date.now(),
          batchId: result.batch_id,
        };
        localStorage.setItem('monsterBatchPending', JSON.stringify(pending));
        setPendingBatch(pending);
      } else {
        throw new Error('Réponse inattendue du serveur (pas de batch_id)');
      }
    } catch (err) {
      const errorMessage = parseErrorMessage(err);
      setError(errorMessage);
      showError(`❌ Erreur: ${errorMessage}`);
      setIsLoading(false);
      setPendingBatch(null);
      localStorage.removeItem('monsterBatchPending');
    } finally {
      finishBackgroundNotification(notificationId);
    }
  };

  const getRankColor = (rank) => {
    const colors = {
      COMMON: '#808080',
      RARE: '#4169E1',
      EPIC: '#9932CC',
      LEGENDARY: '#FFD700',
    };
    return colors[rank] || '#808080';
  };

  const getElementColor = (element) => {
    const colors = {
      FIRE: '#FF6B6B',
      WATER: '#4ECDC4',
      EARTH: '#8B7355',
      AIR: '#B4D7FF',
      ELECTRIC: '#FFD700',
      ICE: '#B0E0E6',
      LIGHT: '#FFEB99',
      DARK: '#4B0082',
    };
    return colors[element.toUpperCase()] || '#808080';
  };

  return (
    <div className={`generate-page theme-${theme}`} ref={pageRef}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Bouton retour dashboard */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/admin')}
            sx={{ textTransform: 'none' }}
          >
            ← Retour au Dashboard
          </Button>
        </Box>
        {/* Form Section */}
        <Paper
          elevation={isDark ? 2 : 1}
          sx={{
            p: 4,
            mb: 4,
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
            border: '2px solid #6366f1',
          }}
        >
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            ✨ Générateur de Monstres
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'textSecondary' }}>
            Utilisez votre créativité pour créer de nouveaux monstres ! Entrez
            un prompt décrivant le monstre que vous souhaitez générer. La
            génération peut prendre plusieurs minutes.
          </Typography>

          <Stack spacing={3}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description du monstre (prompt)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Un bébé dragon d'élément eau avec des écailles bleus et des petites ailes..."
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                },
              }}
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Nombre de monstres à générer (lot)
              </Typography>
              <TextField
                type="number"
                value={batchCount}
                onChange={(e) =>
                  setBatchCount(
                    Math.min(10, Math.max(1, parseInt(e.target.value)))
                  )
                }
                disabled={isLoading}
                inputProps={{ min: 1, max: 10 }}
                sx={{
                  width: 120,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                  },
                }}
              />
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  backgroundColor: isDark ? '#3a2020' : '#ffebee',
                  borderLeft: '4px solid #f44336',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ❌ Erreur de génération
                </Typography>
                {error.includes('429') ||
                error.includes('RESOURCE_EXHAUSTED') ? (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Le service d&apos;IA est actuellement surchargé. Veuillez
                      réessayer dans quelques instants.
                    </Typography>
                    <Accordion
                      size="small"
                      sx={{
                        backgroundColor: 'transparent',
                        mt: 1,
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="caption">
                          Détails techniques
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography
                          variant="caption"
                          component="div"
                          sx={{ wordBreak: 'break-word' }}
                        >
                          {error}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </>
                ) : (
                  <Typography variant="body2">{error}</Typography>
                )}
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateSingle}
                disabled={isLoading || !prompt.trim() || !!pendingBatch}
                sx={{
                  flex: 1,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                ) : (
                  '🎮'
                )}
                Générer 1 Monstre
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleGenerateBatch}
                disabled={isLoading || !prompt.trim() || !!pendingBatch}
                sx={{
                  flex: 1,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                ) : (
                  '🎲'
                )}
                Générer {batchCount} Monstres
              </Button>
            </Stack>

            {isLoading && (
              <Box>
                <LinearProgress sx={{ mb: 2 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'textSecondary' }}>
                    ⏳ Génération en cours... {formatTime(elapsedTime)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'textSecondary', display: 'block', mt: 1 }}
                  >
                    Cela peut prendre plusieurs minutes. Vous pouvez naviguer
                    ailleurs, une notification vous avertira quand ce sera
                    terminé.
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Results Section */}
        {generatedMonsters.length > 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              🎉 Monstres Générés ({generatedMonsters.length})
            </Typography>

            <Grid container spacing={3}>
              {generatedMonsters.map((monster, idx) => (
                <Grid item xs={12} sm={6} lg={4} key={idx}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
                      border: `3px solid ${getRankColor(monster.rang)}`,
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 24px rgba(0,0,0,0.3)`,
                      },
                    }}
                  >
                    {/* Image */}
                    {monster.ImageUrl && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={monster.ImageUrl}
                        alt={monster.nom}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}

                    <CardContent sx={{ flex: 1 }}>
                      {/* Name & Rank */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {monster.nom}
                        </Typography>
                        <Chip
                          label={monster.rang}
                          size="small"
                          sx={{
                            backgroundColor: getRankColor(monster.rang),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>

                      {/* Element Badge */}
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={monster.element}
                          size="small"
                          sx={{
                            backgroundColor: getElementColor(monster.element),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>

                      {/* Description */}
                      <Typography variant="body2" sx={{ mb: 2, minHeight: 60 }}>
                        {monster.description_carte || monster.description}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      {/* Stats */}
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        {monster.stats && (
                          <>
                            <Grid item xs={6}>
                              <Box
                                sx={{
                                  backgroundColor: isDark
                                    ? '#3a3a3a'
                                    : '#f5f5f5',
                                  p: 1,
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'textSecondary' }}
                                >
                                  HP
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 'bold' }}
                                >
                                  {monster.stats.hp}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box
                                sx={{
                                  backgroundColor: isDark
                                    ? '#3a3a3a'
                                    : '#f5f5f5',
                                  p: 1,
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'textSecondary' }}
                                >
                                  ATK
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 'bold' }}
                                >
                                  {monster.stats.atk}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box
                                sx={{
                                  backgroundColor: isDark
                                    ? '#3a3a3a'
                                    : '#f5f5f5',
                                  p: 1,
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'textSecondary' }}
                                >
                                  DEF
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 'bold' }}
                                >
                                  {monster.stats.def}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box
                                sx={{
                                  backgroundColor: isDark
                                    ? '#3a3a3a'
                                    : '#f5f5f5',
                                  p: 1,
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'textSecondary' }}
                                >
                                  VIT
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 'bold' }}
                                >
                                  {monster.stats.vit}
                                </Typography>
                              </Box>
                            </Grid>
                          </>
                        )}
                      </Grid>

                      {/* Skills */}
                      {monster.skills && monster.skills.length > 0 && (
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 'bold', mb: 1 }}
                          >
                            Compétences ({monster.skills.length})
                          </Typography>
                          <Stack spacing={1}>
                            {monster.skills
                              .slice(0, 3)
                              .map((skill, skillIdx) => (
                                <Box
                                  key={skillIdx}
                                  sx={{
                                    backgroundColor: isDark
                                      ? '#3a3a3a'
                                      : '#f5f5f5',
                                    p: 1,
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 'bold' }}
                                  >
                                    {skill.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: 'block',
                                      color: 'textSecondary',
                                    }}
                                  >
                                    {skill.description}
                                  </Typography>
                                </Box>
                              ))}
                            {monster.skills.length > 3 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'primary.main',
                                  fontWeight: 'bold',
                                }}
                              >
                                +{monster.skills.length - 3} compétences
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/admin/monsters')}
                sx={{ textTransform: 'none', fontSize: '1rem' }}
              >
                ➕ Ajouter à la Galerie
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </div>
  );
};

export default GenerateMonsters;
