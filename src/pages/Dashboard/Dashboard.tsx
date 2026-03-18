import { useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, Button, Select,
  MenuItem, FormControl, Tabs, Tab, Backdrop, CircularProgress, alpha, useTheme,
  Snackbar, Alert
} from '@mui/material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import {
  recentConversations, sessionMetrics,
  knowledgeSources, actionLog, unansweredGaps,
} from '../../services/mockData';
import {
  useGetOverviewStatsQuery,
  useGetConversationStatsQuery,
  useGetLanguageStatsQuery,
  useGetTopQueriesQuery,
  useLazyGetAdoptionFunnelQuery,
  useLazyGetAdoptionSegmentsQuery,
  useLazyGetStandTypeAdoptionQuery,
  useLazyGetUserRetentionQuery,
  useLazyGetFeedbackSentimentQuery,
  useLazyGetEscalationsQuery,
  useLazyGetIntentOutcomeQuery,
  useLazyGetCoverageTopicsQuery,
  useLazyGetOpsImpactQuery,
} from '../../store/dashboardApiSlice';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6'];

const kpiIcons: Record<string, React.ReactNode> = {
  chat: <ChatOutlinedIcon />,
  event: <EventNoteOutlinedIcon />,
  accuracy: <VerifiedOutlinedIcon />,
  speed: <SpeedOutlinedIcon />,
};

export default function Dashboard() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const tickColor = isDarkMode ? '#ffffff' : '#64748b';
  const gridColor = isDarkMode ? alpha('#fff', 0.1) : '#e2e8f0';
  const cursorColor = isDarkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05);

  const [tab, setTab] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Tab 0 — KPI cards (auto-fetch on page load)
  const { data: overviewStats, isFetching: overviewFetching, refetch: refetchOverview } = useGetOverviewStatsQuery();

  const kpiCards = overviewStats
    ? [
        { label: 'Total Conversations', value: (overviewStats.totalConversations || 0).toLocaleString(), change: overviewStats.totalConversationsGrowth, changeLabel: 'vs last month', icon: 'chat' },
        { label: 'Active Events',        value: overviewStats.activeEvents,                        change: overviewStats.activeEventsGrowth,        changeLabel: 'new this month', icon: 'event' },
        { label: 'Response Accuracy',    value: `${overviewStats.responseAccuracy}%`,              change: overviewStats.responseAccuracyGrowth,    changeLabel: 'vs last month', icon: 'accuracy' },
        { label: 'Avg Response Time',    value: `${overviewStats.avgResponseTime}s`,               change: overviewStats.avgResponseTimeGrowth,     changeLabel: 'vs last month', icon: 'speed' },
      ]
    : [];

  // Tab 0 — auto-fetch on page load
  const { data: conversationStats = [], isFetching: convFetching, refetch: refetchConv }       = useGetConversationStatsQuery();
  const { data: languageStats = [],     isFetching: langFetching, refetch: refetchLang }       = useGetLanguageStatsQuery();
  const { data: topQueries = [],        isFetching: queriesFetching, refetch: refetchQueries } = useGetTopQueriesQuery();

  // Tabs 1, 3, 4, 5 — lazy, triggered on tab switch
  const [triggerFunnel,      { data: adoptionFunnel = [],     isFetching: funnelFetching    }] = useLazyGetAdoptionFunnelQuery();
  const [triggerSegments,    { data: adoptionSegments = [],   isFetching: segsFetching      }] = useLazyGetAdoptionSegmentsQuery();
  const [triggerStandType,   { data: standTypeAdoption = [],  isFetching: standFetching     }] = useLazyGetStandTypeAdoptionQuery();
  const [triggerRetention,   { data: userRetention = [],      isFetching: retentionFetching }] = useLazyGetUserRetentionQuery();
  const [triggerSentiment,   { data: feedbackSentiment = [],  isFetching: sentimentFetching }] = useLazyGetFeedbackSentimentQuery();
  const [triggerEscalations, { data: escalations = [],        isFetching: escalFetching     }] = useLazyGetEscalationsQuery();
  const [triggerIntent,      { data: intentOutcome = [],      isFetching: intentFetching    }] = useLazyGetIntentOutcomeQuery();
  const [triggerCoverage,    { data: coverageTopics = [],     isFetching: coverageFetching  }] = useLazyGetCoverageTopicsQuery();
  const [triggerOpsImpact,   { data: opsImpact = [],          isFetching: opsFetching       }] = useLazyGetOpsImpactQuery();

  // Derive loading indicator for the visible tab
  const tabLoading =
    tab === 0 ? overviewFetching || convFetching || langFetching || queriesFetching :
    tab === 1 ? funnelFetching || segsFetching || standFetching || retentionFetching :
    tab === 3 ? sentimentFetching || escalFetching || intentFetching :
    tab === 4 ? coverageFetching :
    tab === 5 ? opsFetching :
    false;

  const handleTabChange = useCallback((_e: React.SyntheticEvent, newTab: number) => {
    setTab(newTab);
    // true = use cache if available, skip re-fetch on revisit
    switch (newTab) {
      case 1:
        triggerFunnel(undefined, true);
        triggerSegments(undefined, true);
        triggerStandType(undefined, true);
        triggerRetention(undefined, true);
        break;
      case 3:
        triggerSentiment(undefined, true);
        triggerEscalations(undefined, true);
        triggerIntent(undefined, true);
        break;
      case 4:
        triggerCoverage(undefined, true);
        break;
      case 5:
        triggerOpsImpact(undefined, true);
        break;
    }
  }, [
    triggerFunnel, triggerSegments, triggerStandType, triggerRetention,
    triggerSentiment, triggerEscalations, triggerIntent,
    triggerCoverage, triggerOpsImpact,
  ]);

  const handleRefresh = useCallback(() => {
    // false = force refetch, bypass cache
    switch (tab) {
      case 0:
        refetchOverview();
        refetchConv();
        refetchLang();
        refetchQueries();
        break;
      case 1:
        triggerFunnel(undefined, false);
        triggerSegments(undefined, false);
        triggerStandType(undefined, false);
        triggerRetention(undefined, false);
        break;
      case 3:
        triggerSentiment(undefined, false);
        triggerEscalations(undefined, false);
        triggerIntent(undefined, false);
        break;
      case 4:
        triggerCoverage(undefined, false);
        break;
      case 5:
        triggerOpsImpact(undefined, false);
        break;
    }
    setSnackbar({ open: true, message: 'Dashboard data refreshed!', severity: 'success' });
  }, [
    tab, refetchOverview, refetchConv, refetchLang, refetchQueries,
    triggerFunnel, triggerSegments, triggerStandType, triggerRetention,
    triggerSentiment, triggerEscalations, triggerIntent,
    triggerCoverage, triggerOpsImpact,
  ]);

  const handleExport = useCallback(() => {
    setExporting(true);
    
    setTimeout(() => {
      try {
        // 1. Prepare Data for Excel
        const kpiSheetData = kpiCards.map(item => ({
          'Metric': item.label,
          'Value': item.value,
          'Change %': item.change,
          'Comparison': item.changeLabel
        }));

        const trendSheetData = conversationStats.map(item => ({
          'Date': item.date,
          'Conversations': item.conversations,
          'Messages': item.messages,
          'Unique Users': item.uniqueUsers
        }));

        const knowledgeSheetData = coverageTopics.map(item => ({
          'Topic': item.topic,
          'Knowledge Coverage %': item.coverage,
          'Response Accuracy %': item.accuracy
        }));

        // 2. Create Workbook and Sheets
        const wb = XLSX.utils.book_new();
        const wsKPI = XLSX.utils.json_to_sheet(kpiSheetData);
        const wsTrend = XLSX.utils.json_to_sheet(trendSheetData);
        const wsKnowledge = XLSX.utils.json_to_sheet(knowledgeSheetData);

        // 3. Append Sheets
        XLSX.utils.book_append_sheet(wb, wsKPI, "KPI Overview");
        XLSX.utils.book_append_sheet(wb, wsTrend, "Conversation Trends");
        XLSX.utils.book_append_sheet(wb, wsKnowledge, "Knowledge Base");

        // 4. Trigger Download
        XLSX.writeFile(wb, "Xporience_Chatbot_Dashboard_Summary.xlsx");

        setExporting(false);
        setSnackbar({ open: true, message: 'Excel summary exported successfully!', severity: 'success' });
      } catch (error) {
        console.error('Export failed:', error);
        setExporting(false);
        setSnackbar({ open: true, message: 'Export failed. Please try again.', severity: 'error' });
      }
    }, 1500);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'relative' }}>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, position: 'absolute', borderRadius: 3 }}
        open={exporting || tabLoading}
      >
        <CircularProgress color="inherit" size={32} />
        {exporting && (
          <Typography variant="body2" sx={{ ml: 2, fontWeight: 600 }}>Preparing Export...</Typography>
        )}
      </Backdrop>
      {/* Topbar Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.75 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', fontSize: '1.1rem' }}>
          AI Chatbot Reporting Dashboard
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small">
            <Select 
              defaultValue="30days" 
              sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 1, 
                minWidth: 120, 
                fontSize: '0.75rem',
                '& .MuiSelect-select': { py: 0.75, px: 1.5 }
              }}
            >
              <MenuItem value="7days" sx={{ fontSize: '0.75rem' }}>Last 7 Days</MenuItem>
              <MenuItem value="30days" sx={{ fontSize: '0.75rem' }}>Last 30 Days</MenuItem>
              <MenuItem value="90days" sx={{ fontSize: '0.75rem' }}>Last 90 Days</MenuItem>
              <MenuItem value="event" sx={{ fontSize: '0.75rem' }}>Event Cycle</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <Select 
              defaultValue="global" 
              sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 1, 
                minWidth: 180, 
                fontSize: '0.75rem',
                '& .MuiSelect-select': { py: 0.75, px: 1.5 }
              }}
            >
              <MenuItem value="global" sx={{ fontSize: '0.75rem' }}>Global Food Trade Expo 2026</MenuItem>
              <MenuItem value="mobility" sx={{ fontSize: '0.75rem' }}>Future Mobility Show 2026</MenuItem>
              <MenuItem value="energy" sx={{ fontSize: '0.75rem' }}>Energy & Utilities Expo 2026</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadOutlinedIcon sx={{ fontSize: '18px !important' }} />}
            onClick={handleExport}
            sx={{
              borderRadius: 1,
              px: 2,
              py: 0.75,
              textTransform: 'none',
              fontSize: '0.75rem',
              color: 'text.primary',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.05) : '#f8fafc',
                borderColor: 'text.disabled'
              }
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<RefreshOutlinedIcon sx={{ fontSize: '18px !important' }} />}
            onClick={handleRefresh}
            sx={{ 
              borderRadius: 1, 
              px: 2,
              py: 0.75,
              textTransform: 'none', 
              fontSize: '0.75rem',
              bgcolor: 'primary.main', 
              boxShadow: (t) => `0 4px 6px -1px ${alpha(t.palette.primary.main, 0.4)}` 
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Tabs Menu */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto"
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', color: 'text.secondary', minWidth: 120 }, '& .Mui-selected': { color: '#6366f1' }, '& .MuiTabs-indicator': { backgroundColor: '#6366f1', height: 3, borderRadius: '3px 3px 0 0' } }}
        >
          <Tab label="Overview" />
          <Tab label="Adoption" />
          <Tab label="Conversations" />
          <Tab label="Response Quality" />
          <Tab label="Knowledge Base" />
          <Tab label="Operational Insights" />
        </Tabs>
      </Box>

      {/* Tab: Overview */}
      {tab === 0 && (
        <>
          {/* KPI Cards */}
          <Grid container spacing={3}>
            {kpiCards.map((kpi, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i} sx={{ display: 'flex' }}>
                <Card sx={{ 
                  borderRadius: 1, 
                  height: '100%', 
                  width: '100%',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
                }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: 1.5,
                        background: `linear-gradient(135deg, ${alpha(COLORS[i], 0.15)} 0%, ${alpha(COLORS[i], 0.05)} 100%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: COLORS[i],
                      }}>
                        {kpiIcons[kpi.icon]}
                      </Box>
                      <Chip
                        icon={kpi.change > 0 ? <TrendingUpOutlinedIcon sx={{ fontSize: '14px !important' }} /> : <TrendingDownOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                        label={`${kpi.change > 0 ? '+' : ''}${kpi.change}%`}
                        size="small"
                        sx={{
                          fontWeight: 700, fontSize: '0.65rem', height: 22,
                          backgroundColor: kpi.change > 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                          color: kpi.change > 0 ? '#059669' : '#dc2626',
                          '& .MuiChip-icon': { color: 'inherit' },
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                    <Typography variant="h5" sx={{ mb: 0.25, fontWeight: 700, color: 'text.primary', fontSize: '1.25rem' }}>{kpi.value}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em', fontSize: '0.65rem' }}>{kpi.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={3}>
            {/* Line Chart */}
            <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex' }}>
              <Card sx={{ borderRadius: 1, width: '100%', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 0.25, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Conversation Trend</Typography>
                  <Typography variant="caption" sx={{ mb: 1.5, display: 'block', color: 'text.secondary', fontSize: '0.75rem' }}>Daily chatbot conversations over the selected period</Typography>
                  <ResponsiveContainer width="100%" height={280} minWidth={1} minHeight={1}>
                    <LineChart data={conversationStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="conversations" name="Conversations" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2, fill: theme.palette.background.paper }} activeDot={{ r: 5, strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="uniqueUsers" name="Unique Users" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Pie Chart */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 0.25, fontWeight: 700, color: 'text.primary' }}>Language Usage</Typography>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>Conversations by language</Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, minHeight: 250, display: 'flex', alignItems: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={languageStats}
                          cx="50%" cy="50%"
                          innerRadius={65} outerRadius={90}
                          paddingAngle={3} dataKey="percentage"
                          nameKey="language"
                          stroke="none"
                        >
                          {languageStats.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any, name: any) => [`${value}%`, name]} 
                          contentStyle={{ 
                            borderRadius: 12, 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, justifyContent: 'center' }}>
                    {languageStats.map((lang, i) => (
                      <Box key={lang.code} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: 1.5, bgcolor: alpha(COLORS[i % COLORS.length], 0.08) }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                        <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.75rem' }}>
                          {lang.language} {lang.percentage}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Bar Chart + Recent Conversations */}
          <Grid container spacing={3}>
            {/* Top Queries */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex' }}>
              <Card sx={{ borderRadius: 1, width: '100%', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 0.25, fontWeight: 700, color: 'text.primary' }}>Top Query Categories</Typography>
                  <Typography variant="caption" sx={{ mb: 1.5, display: 'block', color: 'text.secondary' }}>What exhibitors ask most often</Typography>
                  <ResponsiveContainer width="100%" height={300} minWidth={1} minHeight={1}>
                    <BarChart data={topQueries.slice(0, 6)} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tickColor }} />
                      <YAxis dataKey="query" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tickColor, fontWeight: 500 }} width={160} />
                      <Tooltip cursor={{ fill: cursorColor }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" name="Queries" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Conversations */}
            <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex' }}>
              <Card sx={{ borderRadius: 1, width: '100%', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 0.25, fontWeight: 700, color: 'text.primary' }}>Recent Conversations</Typography>
                  <Typography variant="caption" sx={{ mb: 1.5, display: 'block', color: 'text.secondary' }}>Latest interactions with the chatbot</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ '& th': { borderBottom: '1px solid', borderColor: 'divider', color: 'text.secondary', fontWeight: 600, px: 1, py: 1.5 } }}>
                          <TableCell>User</TableCell>
                          <TableCell>Query</TableCell>
                          <TableCell>Language</TableCell>
                          <TableCell align="center">Rating</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentConversations.map((conv) => (
                          <TableRow key={conv.id} hover sx={{ '& td': { borderBottom: '1px solid', borderColor: alpha('#fff', 0.05), px: 1, py: 1.5 } }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontSize: '0.75rem', fontWeight: 600 }}>
                                  {conv.user.split('#')[1]?.slice(-2) || 'U'}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.primary', fontWeight: 500 }}>{conv.user}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {conv.query}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={conv.language} size="small" sx={{ fontSize: '0.7rem', height: 20, bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.1) : '#f1f5f9', color: 'text.secondary', fontWeight: 500, borderRadius: 1 }} />
                            </TableCell>
                            <TableCell align="center">
                              {conv.satisfied === true && <ThumbUpOutlinedIcon sx={{ fontSize: 16, color: '#10b981' }} />}
                              {conv.satisfied === false && <ThumbDownOutlinedIcon sx={{ fontSize: 16, color: '#ef4444' }} />}
                              {conv.satisfied === null && <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>—</Typography>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Executive Summary Row */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 0.25, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Executive Summary</Typography>
                  <Typography variant="caption" sx={{ mb: 1.5, display: 'block', color: 'text.secondary', fontSize: '0.75rem' }}>Organizer-level interpretation</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {[
                      { title: "Strong Adoption", text: "70.6% of eligible exhibitors used the bot, with high engagement from premium tiers." },
                      { title: "Standard Load Deflection", text: "67.5% deflection shows the bot successfully handles routine forms/deadlines." },
                    ].map((item, i) => (
                      <Box key={i} sx={{ borderLeft: '3px solid #6366f1', pl: 1.5, py: 0.25 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.75rem' }}>{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.4 }}>{item.text}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 0.25, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Priority Actions</Typography>
                  <Typography variant="caption" sx={{ mb: 1.5, display: 'block', color: 'text.secondary', fontSize: '0.75rem' }}>Steps for operations team</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {[
                      { title: "Exception Handling", text: "Create content for late approvals and sector-specific logistics." },
                      { title: "Logistics Richness", text: "Enrich move-in/out answers with step-by-step contractor rules." },
                    ].map((item, i) => (
                      <Box key={i} sx={{ borderLeft: '3px solid #fbbf24', pl: 1.5, py: 0.25 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.75rem' }}>{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.4 }}>{item.text}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Tab: Adoption */}
      {tab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={2}>
            {/* Adoption Funnel */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Exhibitor Adoption Funnel</Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontSize: '0.75rem' }}>From eligible exhibitors to repeat chatbot users</Typography>
                  <ResponsiveContainer width="100%" height={260} minWidth={1} minHeight={1}>
                    <BarChart data={adoptionFunnel} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                      <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor, fontWeight: 500 }} width={120} />
                      <Tooltip cursor={{ fill: cursorColor }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]} barSize={24}>
                        {
                          // Using punchy colors: purple, indigo, blue, cyan, green, amber
                          ['#8b5cf6', '#6366f1', '#60a5fa', '#22d3ee', '#22c55e', '#fbbf24'].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Adoption by Tier */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Adoption by Exhibitor Tier</Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontSize: '0.75rem' }}>Small, medium, premium and pavilion exhibitors</Typography>
                  <ResponsiveContainer width="100%" height={260} minWidth={1} minHeight={1}>
                    <BarChart data={adoptionSegments} margin={{ left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis dataKey="segment" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                      <Tooltip cursor={{ fill: cursorColor }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="adoption" name="Adoption Rate %" fill="#22c55e" radius={[2, 2, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            {/* New vs Repeat */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>New vs Repeat Users</Typography>
                    <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary', fontSize: '0.75rem' }}>How many exhibitors came back for multiple sessions</Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, minHeight: 220 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={userRetention}
                          cx="50%" cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="count"
                          stroke="none"
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {
                            ['#6366f1', '#22c55e'].map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))
                          }
                        </Pie>
                        <Tooltip formatter={(value: any) => value} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: '0.75rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Stand Type Adoption */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Adoption by Stand Type</Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontSize: '0.75rem' }}>Shell scheme, raw space, co-exhibitor, startup zone, etc.</Typography>
                  <ResponsiveContainer width="100%" height={240} minWidth={1} minHeight={1}>
                    <BarChart data={standTypeAdoption} margin={{ left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} angle={-25} textAnchor="end" height={50} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                      <Tooltip cursor={{ fill: cursorColor }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="users" name="Users" fill="#8b5cf6" radius={[2, 2, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Adoption Table */}
          <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, pb: 1.5 }}>
                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Adoption Detail by Exhibitor Group</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Sample organizer table view</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.05) : '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5, fontSize: '0.7rem' }}>Segment</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5, fontSize: '0.7rem' }}>Eligible</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5, fontSize: '0.7rem' }}>Users</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5, fontSize: '0.7rem' }}>Adoption</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5, fontSize: '0.7rem' }}>Avg. Convs / User</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5, fontSize: '0.7rem' }}>Repeat Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { segment: "Small Stands", eligible: 420, users: 262, adoption: 62.4, avgConv: 3.8, repeat: 41.2 },
                      { segment: "Medium Stands", eligible: 398, users: 292, adoption: 73.4, avgConv: 4.7, repeat: 54.8 },
                      { segment: "Premium Exhibitors", eligible: 214, users: 176, adoption: 82.2, avgConv: 6.1, repeat: 66.4 },
                      { segment: "Country Pavilions", eligible: 98, users: 83, adoption: 84.7, avgConv: 5.3, repeat: 61.4 },
                      { segment: "Co-exhibitors", eligible: 110, users: 63, adoption: 57.3, avgConv: 2.9, repeat: 34.9 }
                    ].map((row) => (
                      <TableRow key={row.segment} hover sx={{ '& td': { borderColor: 'divider', py: 1 } }}>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.75rem' }}>{row.segment}</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontSize: '0.75rem' }}>{row.eligible}</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontSize: '0.75rem' }}>{row.users}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: '100%', maxWidth: 60, height: 5, borderRadius: 2.5, bgcolor: alpha('#22c55e', 0.1) }}>
                              <Box sx={{ width: `${row.adoption}%`, height: '100%', borderRadius: 2.5, bgcolor: '#22c55e' }} />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.75rem' }}>{row.adoption}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: 'text.primary', fontSize: '0.75rem' }}>{row.avgConv}</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontSize: '0.75rem' }}>{row.repeat}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tab: Conversations */}
      {tab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Session Metrics */}
          <Grid container spacing={2}>
            {sessionMetrics.map((item, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
                <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, fontSize: '0.75rem', minHeight: 40 }}>{item.label}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.25rem' }}>{item.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            {/* Conversations by Hour */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600, color: 'text.primary' }}>Conversations by Hour</Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>When exhibitors interact with the chatbot</Typography>
                  <ResponsiveContainer width="100%" height={280} minWidth={1} minHeight={1}>
                    <BarChart data={[
                      { time: "00-03", count: 84 }, { time: "03-06", count: 56 }, { time: "06-09", count: 298 },
                      { time: "09-12", count: 1012 }, { time: "12-15", count: 1144 }, { time: "15-18", count: 980 },
                      { time: "18-21", count: 468 }, { time: "21-24", count: 244 }
                    ]} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tickColor }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tickColor }} />
                      <Tooltip cursor={{ fill: cursorColor }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" name="Conversations" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Source Usage */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600, color: 'text.primary' }}>Source Entry Points</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>Where exhibitors start conversations</Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, minHeight: 250 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={[
                            { source: "Dashboard Widget", users: 1462 },
                            { source: "Order Forms Page", users: 1038 },
                            { source: "Profile Wizard", users: 676 },
                            { source: "Deadline Calendar", users: 481 },
                            { source: "FAQ / Help Center", users: 402 },
                            { source: "Badging Module", users: 227 }
                          ]}
                          cx="50%" cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={2}
                          dataKey="users"
                          stroke="none"
                          label={({ payload }) => payload.source}
                        >
                          {['#6366f1', '#22c55e', '#fbbf24', '#60a5fa', '#ec4899', '#f97316'].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} type="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tab: Response Quality */}
      {tab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Grid container spacing={2}>
            {/* Sentiment */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>User Sentiment</Typography>
                    <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary', fontSize: '0.75rem' }}>Post-conversation feedback</Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, minHeight: 220 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={feedbackSentiment}
                          cx="50%" cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="count"
                          stroke="none"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {['#22c55e', '#fbbf24', '#ef4444'].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => value} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: '0.75rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Escalations */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Escalation Drivers</Typography>
                  <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary', fontSize: '0.75rem' }}>Why users asked for a human</Typography>
                  <ResponsiveContainer width="100%" height={240} minWidth={1} minHeight={1}>
                    <BarChart data={escalations} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                      <YAxis dataKey="reason" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor, fontWeight: 500 }} width={180} />
                      <Tooltip cursor={{ fill: cursorColor }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" name="Escalations" fill="#ef4444" radius={[0, 2, 2, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Unanswered Gaps & Intent Outcomes */}
          <Grid container spacing={2}>
            {/* Intent Outcomes */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 2, pb: 1.5 }}>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Intent Outcomes</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Resolution rates by topic</Typography>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.05) : '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Intent</TableCell>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Convs</TableCell>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Success Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {intentOutcome.map(row => (
                          <TableRow key={row.intent} hover sx={{ '& td': { borderColor: 'divider', py: 1 } }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{row.intent}</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{row.conversations}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: (row.success / row.conversations) > 0.8 ? '#10b981' : '#f59e0b' }}>
                                {((row.success / row.conversations) * 100).toFixed(1)}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Unanswered Gaps */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 2, pb: 1.5 }}>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Top Knowledge Gaps</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Questions the bot couldn't answer</Typography>
                  </Box>
                  <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {unansweredGaps.slice(0, 3).map((gap, i) => (
                      <Box key={i} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: (t) => t.palette.mode === 'dark' ? alpha(t.palette.error.main, 0.1) : alpha('#ef4444', 0.05), border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5, fontSize: '0.75rem' }}>"{gap.q}"</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700, fontSize: '0.65rem' }}>Gap: {gap.gap}</Typography>
                          <Chip label={`${gap.count} times`} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'error.main', color: '#fff', fontWeight: 700, borderRadius: 1 }} />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tab: Knowledge Base */}
      {tab === 4 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Grid container spacing={2}>
            {/* Coverage Topics */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Topic-wise Knowledge Readiness</Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500, fontSize: '0.75rem' }}>
                    Comparing <strong>Knowledge Coverage</strong> vs <strong>Response Accuracy</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ mb: 2, display: 'block', color: 'text.disabled', fontStyle: 'italic', fontSize: '0.65rem' }}>
                    * Higher coverage means more questions answered; higher accuracy means fewer mistakes.
                  </Typography>
                  <ResponsiveContainer width="100%" height={300} minWidth={1} minHeight={1}>
                    <BarChart data={coverageTopics} layout="vertical" margin={{ left: 10, right: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
                      <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                      <YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor, fontWeight: 600 }} width={120} />
                      <Tooltip
                        cursor={{ fill: cursorColor }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                          backgroundColor: theme.palette.background.paper,
                          color: theme.palette.text.primary,
                          fontSize: '0.75rem'
                        }}
                      />
                      <Legend verticalAlign="top" align="right" height={30} iconType="circle" wrapperStyle={{ fontSize: '0.7rem' }} />
                      <Bar dataKey="coverage" name="Knowledge Coverage %" fill="#6366f1" radius={[0, 2, 2, 0]} barSize={10} />
                      <Bar dataKey="accuracy" name="Response Accuracy %" fill="#10b981" radius={[0, 2, 2, 0]} barSize={10} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Knowledge Sources Table */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 2, pb: 1.5 }}>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Knowledge Sources</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Documents driving the chatbot's answers</Typography>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.05) : '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Source Document</TableCell>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Answers</TableCell>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Coverage</TableCell>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Updated</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {knowledgeSources.map((row) => (
                          <TableRow key={row.source} hover sx={{ '& td': { borderColor: 'divider', py: 1 } }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.75rem' }}>
                                {row.source}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{row.answered}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: '100%', maxWidth: 50, height: 5, borderRadius: 2.5, bgcolor: alpha('#3b82f6', 0.15) }}>
                                  <Box sx={{ width: `${row.coverage}%`, height: '100%', borderRadius: 2.5, bgcolor: '#3b82f6' }} />
                                </Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.65rem' }}>{row.coverage}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{row.updated}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Action Log */}
          <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, pb: 1.5 }}>
                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Knowledge Action Log</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Recent team actions to improve the bot</Typography>
              </Box>
              <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {actionLog.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 1.5, bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.03) : '#f8fafc', border: '1px solid', borderColor: 'divider' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.75rem' }}>{item.title}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.25, display: 'block', fontSize: '0.65rem' }}>{item.meta}</Typography>
                    </Box>
                    <Chip label="Actioned" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700, borderRadius: 1 }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tab: Operational Insights */}
      {tab === 5 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Grid container spacing={2}>
            {/* Dept Impact */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Workload Impact by Department</Typography>
                  <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary', fontSize: '0.75rem' }}>Estimated support hours saved by team</Typography>
                  <ResponsiveContainer width="100%" height={260} minWidth={1} minHeight={1}>
                    <PieChart>
                      <Pie
                        data={opsImpact}
                        cx="50%" cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="impact"
                        nameKey="dept"
                        stroke="none"
                        label={({ payload }) => `${payload.dept}: ${payload.impact}%`}
                      >
                        {['#22d3ee', '#6366f1', '#fbbf24', '#f97316', '#ec4899', '#8b5cf6'].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `${value}%`} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: '0.75rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

