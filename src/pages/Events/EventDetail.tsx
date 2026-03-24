import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Button, Chip,
  Grid, TextField, Switch, FormControlLabel, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Snackbar, Alert, Tooltip, CircularProgress
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ChatbotPreview from '../../components/common/ChatbotPreview';
import {
  useGetEventQuery,
  useGetChatbotConfigQuery,
  useCreateChatbotConfigMutation,
  useUpdateChatbotConfigMutation,
  useGetChatbotThemeQuery,
  useCreateChatbotThemeMutation,
  useUpdateChatbotThemeMutation,
  useGetEventLanguagesQuery,
  useSetEventLanguagesMutation,
} from '../../store/eventsApiSlice';

const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' },
  { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
  { code: 'ar', name: 'Arabic' }, { code: 'es', name: 'Spanish' },
  { code: 'ja', name: 'Japanese' }, { code: 'th', name: 'Thai' },
];

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const eventId = Number(id);
  const [tab, setTab] = useState(0);

  const { data: event, isLoading: eventLoading } = useGetEventQuery(eventId);
  const { data: chatbotConfig } = useGetChatbotConfigQuery(eventId);
  const { data: chatbotTheme } = useGetChatbotThemeQuery(eventId);
  const { data: languagesData = [] } = useGetEventLanguagesQuery(eventId);

  const [createChatbotConfig] = useCreateChatbotConfigMutation();
  const [updateChatbotConfig] = useUpdateChatbotConfigMutation();
  const [createChatbotTheme] = useCreateChatbotThemeMutation();
  const [updateChatbotTheme] = useUpdateChatbotThemeMutation();
  const [setEventLanguages] = useSetEventLanguagesMutation();

  // Live config state for preview
  const [botName, setBotName] = useState('XpoAssist');
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [activeLangs, setActiveLangs] = useState<string[]>([]);

  // Sync state from API once loaded
  useEffect(() => {
    if (chatbotConfig) {
      setBotName(chatbotConfig.bot_name || 'XpoAssist');
      setWelcomeMsg(chatbotConfig.welcome_message || '');
    }
  }, [chatbotConfig]);

  useEffect(() => {
    if (chatbotTheme?.background) {
      setPrimaryColor(chatbotTheme.background);
    }
  }, [chatbotTheme]);

  useEffect(() => {
    if (languagesData.length > 0) {
      setActiveLangs(languagesData.filter(l => l.isactive).map(l => l.language ?? '').filter(Boolean));
    }
  }, [languagesData]);

  // Deploy Modal State
  const [deployOpen, setDeployOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<'script' | 'link' | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  if (eventLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">Event not found</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/events')}>Back to Events</Button>
      </Box>
    );
  }

  const handleLangToggle = (code: string) => {
    setActiveLangs(prev => prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]);
  };

  const handleSave = async () => {
    try {
      // Save chatbot config (bot name + welcome message)
      const configPayload = { bot_name: botName, welcome_message: welcomeMsg };
      if (chatbotConfig) {
        await updateChatbotConfig({ eventId, data: configPayload }).unwrap();
      } else {
        await createChatbotConfig({ eventId, data: configPayload }).unwrap();
      }

      // Save theme (primary color → background)
      const themePayload = { background: primaryColor };
      if (chatbotTheme) {
        await updateChatbotTheme({ eventId, data: themePayload }).unwrap();
      } else {
        await createChatbotTheme({ eventId, data: themePayload }).unwrap();
      }

      // Save languages
      await setEventLanguages({
        eventId,
        languages: activeLangs.map(lang => ({ language: lang, isactive: true })),
      }).unwrap();

      setSnackbar({ open: true, message: 'Configuration saved!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to save configuration.', severity: 'error' });
    }
  };

  const generatedToken = `${event.id}-token-xyz123`;
  const embedScript = `<script src="https://bot.wingsbi.com/widget.js" data-event-id="${event.id}" data-token="${generatedToken}"></script>`;
  const previewLink = `https://bot.wingsbi.com/preview/${event.id}?token=${generatedToken}`;

  const handleCopy = (text: string, type: 'script' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setSnackbar({ open: true, message: 'Copied to clipboard!', severity: 'success' });
    setTimeout(() => setCopiedType(null), 2000);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/events')} color="inherit" size="small">
          Back
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>{event.name}</Typography>
          {event.description && <Typography variant="body2" color="text.secondary">{event.description}</Typography>}
        </Box>
        <Chip label="ACTIVE" size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(16,185,129,0.1)', color: '#059669' }} />
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 600 } }}>
        <Tab label="Overview" />
        <Tab label="Configuration" />
        <Tab label="Analytics" />
        <Tab label="Content" />
      </Tabs>

      {/* Overview Tab */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Event Details</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Start Date</Typography>
                    <Typography fontWeight={600} color="text.primary">{formatDate(event.start_date)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">End Date</Typography>
                    <Typography fontWeight={600} color="text.primary">{formatDate(event.end_date)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Event ID</Typography>
                    <Typography fontWeight={600} color="text.primary">#{event.id}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Bot Name</Typography>
                    <Typography fontWeight={600} color="text.primary">{chatbotConfig?.bot_name || '—'}</Typography>
                  </Grid>
                  {event.description && (
                    <Grid size={12}>
                      <Typography variant="body2" color="text.secondary">Description</Typography>
                      <Typography fontWeight={500} color="text.primary">{event.description}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Active Languages</Typography>
                {activeLangs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No languages configured yet.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {activeLangs.map(lang => {
                      const langObj = LANGUAGES.find(l => l.code === lang);
                      return <Chip key={lang} label={langObj?.name || lang} sx={{ fontWeight: 600 }} color="primary" variant="outlined" />;
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Configuration Tab */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Appearance */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Chatbot Appearance</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Bot Name" value={botName} onChange={(e) => setBotName(e.target.value)} fullWidth size="small" />
                    <TextField label="Welcome Message" value={welcomeMsg} onChange={(e) => setWelcomeMsg(e.target.value)} fullWidth multiline rows={2} size="small" />
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Primary Color</Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <input
                          type="color" value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          style={{ width: 48, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                        />
                        <TextField value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} size="small" sx={{ width: 130 }} />
                        {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#8b5cf6'].map((c) => (
                          <Box
                            key={c} onClick={() => setPrimaryColor(c)}
                            sx={{
                              width: 28, height: 28, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                              border: primaryColor === c ? '3px solid' : '2px solid transparent',
                              borderColor: primaryColor === c ? 'text.primary' : 'transparent',
                              transition: 'all 0.2s', '&:hover': { transform: 'scale(1.15)' },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Languages */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Active Languages</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {LANGUAGES.map((lang) => (
                      <FormControlLabel
                        key={lang.code}
                        control={<Switch checked={activeLangs.includes(lang.code)} onChange={() => handleLangToggle(lang.code)} />}
                        label={lang.name}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" color="primary" onClick={handleSave}>Save Configuration</Button>
                <Button variant="contained" color="primary" startIcon={<CodeRoundedIcon />} onClick={() => setDeployOpen(true)}>
                  Deploy Chatbot
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Live Preview */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 700 }}>Live Preview</Typography>
              <ChatbotPreview primaryColor={primaryColor} welcomeMessage={welcomeMsg} botName={botName} />
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', fontSize: '0.75rem', color: 'text.secondary' }}>
                Changes are reflected instantly in the preview
              </Typography>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Analytics Tab */}
      {tab === 2 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Event Analytics</Typography>
            <Typography variant="body2" color="text.secondary">Analytics for {event.name} will be shown here.</Typography>
          </CardContent>
        </Card>
      )}

      {/* Content Tab */}
      {tab === 3 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Manage Content</Typography>
            <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">Upload and manage multilingual content, FAQs, and knowledge base entries.</Typography>
            <Button variant="contained">Upload Content</Button>
          </CardContent>
        </Card>
      )}

      {/* Deploy Modal */}
      <Dialog open={deployOpen} onClose={() => setDeployOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CodeRoundedIcon color="primary" />
          Deploy {botName}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Use the embed code or preview link below to deploy your chatbot.
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>Embed Code (Widget)</Typography>
            <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
              Paste this snippet just before the closing <code>&lt;/body&gt;</code> tag.
            </Typography>
            <Box sx={{ position: 'relative', bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#000', 0.2) : '#f8fafc', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, pr: 6, fontFamily: 'monospace', fontSize: '0.78rem', wordBreak: 'break-all' }}>
              {embedScript}
              <Tooltip title={copiedType === 'script' ? 'Copied!' : 'Copy Code'} placement="top">
                <IconButton size="small" onClick={() => handleCopy(embedScript, 'script')} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper', boxShadow: 1 }}>
                  {copiedType === 'script' ? <CheckRoundedIcon color="success" fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>Direct Preview Link</Typography>
            <Box sx={{ position: 'relative', bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#000', 0.2) : '#f8fafc', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, pr: 6 }}>
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500, wordBreak: 'break-all' }}>{previewLink}</Typography>
              <Tooltip title={copiedType === 'link' ? 'Copied!' : 'Copy Link'} placement="top">
                <IconButton size="small" onClick={() => handleCopy(previewLink, 'link')} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper', boxShadow: 1 }}>
                  {copiedType === 'link' ? <CheckRoundedIcon color="success" fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeployOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
