import {
  Box, Card, CardContent, Typography, Grid, alpha, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, Select, FormControl, InputLabel, useTheme
} from '@mui/material';
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  useGetAnalyticsConversationStatsQuery,
  useGetAnalyticsLanguageStatsQuery,
  useGetAnalyticsExhibitorStatsQuery,
} from '../../store/analyticsApiSlice';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export default function Analytics() {
  const theme = useTheme();
  const tickColor = theme.palette.mode === 'dark' ? '#ffffff' : '#64748b';

  // Auto-fetch on page load; refetch() re-fetches when Apply Filters is clicked
  const { data: conversationStats = [], isFetching: convFetching, refetch: refetchConv }   = useGetAnalyticsConversationStatsQuery();
  const { data: languageStats = [],     isFetching: langFetching, refetch: refetchLang }   = useGetAnalyticsLanguageStatsQuery();
  const { data: exhibitorStats = [],    isFetching: exhibFetching, refetch: refetchExhib } = useGetAnalyticsExhibitorStatsQuery();

  const loading = convFetching || langFetching || exhibFetching;

  const handleApplyFilters = () => {
    refetchConv();
    refetchLang();
    refetchExhib();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 0.5 }}>
        <TextField label="Start Date" type="date" size="small" defaultValue="2026-03-01" InputLabelProps={{ shrink: true }} sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }} />
        <TextField label="End Date" type="date" size="small" defaultValue="2026-03-11" InputLabelProps={{ shrink: true }} sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }} />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Event</InputLabel>
          <Select label="Event" defaultValue="all" sx={{ borderRadius: 1.5 }}>
            <MenuItem value="all">All Events</MenuItem>
            <MenuItem value="evt-001">Gastech 2026</MenuItem>
            <MenuItem value="evt-004">Tech Connect Asia</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          size="small"
          onClick={handleApplyFilters}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ borderRadius: 1.5, px: 2.5 }}
        >
          {loading ? 'Loading...' : 'Apply Filters'}
        </Button>
      </Box>

      {/* KPI Row */}
      <Grid container spacing={2}>
        {[
          { label: 'Total Conversations', value: '12,847', color: '#6366f1' },
          { label: 'Avg Messages/Session', value: '4.2', color: '#10b981' },
          { label: 'Satisfaction Rate', value: '91%', color: '#f59e0b' },
          { label: 'Unanswered Queries', value: '284', color: '#ef4444' },
          { label: 'Avg Response Time', value: '1.2s', color: '#3b82f6' },
          { label: 'Escalation Rate', value: '3.1%', color: '#ec4899' },
        ].map((kpi, i) => (
          <Grid size={{ xs: 6, md: 2 }} key={i}>
            <Card sx={{ borderRadius: 1 }}>
              <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 }, textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ color: kpi.color, fontWeight: 700, lineHeight: 1.1, fontSize: '1rem' }}>{kpi.value}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem' }}>{kpi.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, fontSize: '0.85rem' }}>Conversation Trends</Typography>
              <ResponsiveContainer width="100%" height={240} minWidth={1} minHeight={1}>
                <LineChart data={conversationStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(tickColor, 0.15)} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: tickColor }} tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                  <YAxis tick={{ fontSize: 10, fill: tickColor }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary
                    }}
                  />
                  <Line type="monotone" dataKey="conversations" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: theme.palette.background.paper }} />
                  <Line type="monotone" dataKey="messages" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="uniqueUsers" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, fontSize: '0.85rem' }}>Language Breakdown</Typography>
              {languageStats.map((lang, i) => (
                <Box key={lang.code} sx={{ mb: 1.25 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>{lang.language}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'text.secondary' }}>{lang.percentage}%</Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 4, borderRadius: 2, bgcolor: alpha(COLORS[i % COLORS.length], 0.1) }}>
                    <Box sx={{ width: `${lang.percentage}%`, height: '100%', borderRadius: 2, bgcolor: COLORS[i % COLORS.length], transition: 'width 0.5s' }} />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Exhibitor Engagement */}
      <Card sx={{ borderRadius: 1 }}>
        <CardContent sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, fontSize: '0.85rem' }}>Top Exhibitor Engagement</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.05) : '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', py: 1 }}>#</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', py: 1 }}>Exhibitor</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', py: 1 }}>Searches</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', py: 1 }}>Profile Views</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', py: 1 }}>Queries</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exhibitorStats.map((exh, i) => (
                  <TableRow key={exh.name} hover sx={{ '& td': { borderColor: 'divider', py: 1 } }}>
                    <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{i + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'text.primary' }}>{exh.name}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.7rem', color: 'text.primary' }}>{exh.searches}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.7rem', color: 'text.primary' }}>{exh.profileViews}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.7rem', color: 'text.primary' }}>{exh.queries}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
