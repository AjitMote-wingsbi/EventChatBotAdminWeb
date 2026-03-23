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
import ChartWrapper from '../../components/common/ChartWrapper';
import {
  useGetOverviewStatsQuery,
  useGetRecentConversationsQuery,
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
  const [period, setPeriod] = useState<'30d' | '7d' | '90d' | 'all'>('30d');
  const [exporting, setExporting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Tab 0 — KPI cards (auto-fetch on page load, re-fetches when period changes)
  const { data: overviewStats, isFetching: overviewFetching, refetch: refetchOverview } = useGetOverviewStatsQuery({ period });

  const kpiCards = [
    { label: 'Total Conversations', value: overviewStats?.totalConversations != null ? overviewStats.totalConversations.toLocaleString() : 'No Data', change: overviewStats?.totalConversationsGrowth ?? 0, changeLabel: 'vs last month', icon: 'chat' },
    { label: 'Active Events', value: overviewStats?.activeEvents != null ? overviewStats.activeEvents : 'No Data', change: overviewStats?.activeEventsGrowth ?? 0, changeLabel: 'new this month', icon: 'event' },
    { label: 'Response Accuracy', value: overviewStats?.responseAccuracy != null ? `${overviewStats.responseAccuracy}%` : 'No Data', change: overviewStats?.responseAccuracyGrowth ?? 0, changeLabel: 'vs last month', icon: 'accuracy' },
    { label: 'Avg Response Time', value: overviewStats?.avgResponseTime != null ? `${overviewStats.avgResponseTime}s` : 'No Data', change: overviewStats?.avgResponseTimeGrowth ?? 0, changeLabel: 'vs last month', icon: 'speed' },
  ];

  // Tab 0 — auto-fetch on page load, re-fetches when period changes
  const { data: rawRecent, isFetching: recentFetching, refetch: refetchRecent } = useGetRecentConversationsQuery({ period });
  const recentConversations = Array.isArray(rawRecent) ? rawRecent : [];

  const { data: rawConv, isFetching: convFetching, refetch: refetchConv } = useGetConversationStatsQuery({ period });
  const conversationStats = Array.isArray(rawConv) ? rawConv : [];

  const { data: rawLang, isFetching: langFetching, refetch: refetchLang } = useGetLanguageStatsQuery({ period });
  const languageStats = Array.isArray(rawLang) ? rawLang : [];

  const { data: rawQueries, isFetching: queriesFetching, refetch: refetchQueries } = useGetTopQueriesQuery({ period });
  const topQueries = Array.isArray(rawQueries) ? rawQueries : [];

  // Tabs 1, 3, 4, 5 — lazy, triggered on tab switch
  const [triggerFunnel, { data: rawFunnel, isFetching: funnelFetching }] = useLazyGetAdoptionFunnelQuery();
  const adoptionFunnel = Array.isArray(rawFunnel) ? rawFunnel : [];

  const [triggerSegments, { data: rawSegments, isFetching: segsFetching }] = useLazyGetAdoptionSegmentsQuery();
  const adoptionSegments = Array.isArray(rawSegments) ? rawSegments : [];

  const [triggerStandType, { data: rawStandType, isFetching: standFetching }] = useLazyGetStandTypeAdoptionQuery();
  const standTypeAdoption = Array.isArray(rawStandType) ? rawStandType : [];

  const [triggerRetention, { data: rawRetention, isFetching: retentionFetching }] = useLazyGetUserRetentionQuery();
  const userRetention = Array.isArray(rawRetention) ? rawRetention : [];

  const [triggerSentiment, { data: rawSentiment, isFetching: sentimentFetching }] = useLazyGetFeedbackSentimentQuery();
  const feedbackSentiment = Array.isArray(rawSentiment) ? rawSentiment : [];

  const [triggerEscalations, { data: rawEscalations, isFetching: escalFetching }] = useLazyGetEscalationsQuery();
  const escalations = Array.isArray(rawEscalations) ? rawEscalations : [];

  const [triggerIntent, { data: rawIntent, isFetching: intentFetching }] = useLazyGetIntentOutcomeQuery();
  const intentOutcome = Array.isArray(rawIntent) ? rawIntent : [];

  const [triggerCoverage, { data: rawCoverage, isFetching: coverageFetching }] = useLazyGetCoverageTopicsQuery();
  const coverageTopics = Array.isArray(rawCoverage) ? rawCoverage : [];

  const [triggerOpsImpact, { data: rawOpsImpact, isFetching: opsFetching }] = useLazyGetOpsImpactQuery();
  const opsImpact = Array.isArray(rawOpsImpact) ? rawOpsImpact : [];

  // Derive loading indicator for the visible tab
  const tabLoading =
    tab === 0 ? overviewFetching || recentFetching || convFetching || langFetching || queriesFetching :
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
        refetchRecent();
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
    tab, refetchOverview, refetchRecent, refetchConv, refetchLang, refetchQueries,
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative' }}>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, position: 'absolute', borderRadius: 3 }}
        open={exporting || tabLoading}
      >
        <CircularProgress color="inherit" size={32} />
        {exporting && (
          <Typography variant="body2" sx={{ ml: 2, fontWeight: 600 }}>Preparing Export...</Typography>
        )}
      </Backdrop>
      {/* Dashboard Top Navigation & Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto"
          sx={{ mb: '-1px', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', color: 'text.secondary', minWidth: 'auto', px: 2 }, '& .Mui-selected': { color: '#6366f1' }, '& .MuiTabs-indicator': { backgroundColor: '#6366f1', height: 3, borderRadius: '3px 3px 0 0' } }}
        >
          <Tab label="Overview" />
          <Tab label="Adoption" />
          <Tab label="Conversations" />
          <Tab label="Response Quality" />
          <Tab label="Knowledge Base" />
          <Tab label="Operational Insights" />
        </Tabs>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', pb: 1, ml: 'auto' }}>
          <FormControl size="small">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                minWidth: 120,
                fontSize: '0.65rem',
                '& .MuiSelect-select': { py: 0.75, px: 1.5 }
              }}
            >
              <MenuItem value="7d" sx={{ fontSize: '0.65rem' }}>Last 7 Days</MenuItem>
              <MenuItem value="30d" sx={{ fontSize: '0.65rem' }}>Last 30 Days</MenuItem>
              <MenuItem value="90d" sx={{ fontSize: '0.65rem' }}>Last 90 Days</MenuItem>
              <MenuItem value="all" sx={{ fontSize: '0.65rem' }}>Event Cycle</MenuItem>
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
              fontSize: '0.65rem',
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
              fontSize: '0.65rem',
              bgcolor: 'primary.main',
              boxShadow: (t) => `0 4px 6px -1px ${alpha(t.palette.primary.main, 0.4)}`
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Tab: Overview */}
      {tab === 0 && (
        <>
          {/* KPI Cards */}
          <Grid container spacing={1.5}>
            {kpiCards.map((kpi, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i} sx={{ display: 'flex' }}>
                <Card sx={{
                  borderRadius: 1,
                  height: '100%',
                  width: '100%',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Box sx={{
                        width: 32, height: 32, borderRadius: 1,
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

          {/* Conversation Trend + Language Pie */}
          <Grid container spacing={1.5}>
            {/* Conversation Trend Line Chart */}
            <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex' }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper key={`convtrend-${period}`} title="Conversation Trend" subtitle="Daily chatbot conversations over the selected period" data={conversationStats}>
                  <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                    <LineChart data={conversationStats.map((d: any) => ({ ...d, conversations: Number(d.conversations || 0), uniqueUsers: Number(d.uniqueUsers || 0) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }} />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '0.65rem', fontWeight: 500, paddingTop: '2px' }} />
                      <Line type="monotone" name="Conversations" dataKey="conversations" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2, fill: theme.palette.background.paper }} activeDot={{ r: 5, strokeWidth: 0 }} />
                      <Line type="monotone" name="Unique Users" dataKey="uniqueUsers" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              </Box>
            </Grid>

            {/* Language Usage Pie */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper key={`lang-${period}`} title="Language Usage" subtitle="Conversations by language" data={languageStats}>
                  {(isFull) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ flexGrow: 1, minHeight: 180, position: 'relative' }}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={languageStats.map((d: any) => ({ ...d, percentage: Number(d.percentage || 0), legendName: `${d.language}: ${Number(d.percentage || 0)}%` }))}
                                cx="50%" cy={isFull ? '50%' : '40%'}
                                innerRadius={isFull ? 150 : '35%'} outerRadius={isFull ? 250 : '55%'}
                                paddingAngle={1} dataKey="percentage"
                                nameKey="legendName"
                                stroke="none"
                                label={{ fontSize: 10, fontWeight: 500 }}
                              >
                                {languageStats.map((_, i) => (
                                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: any, name: any) => [`${value}%`, name.split(':')[0]]}
                                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
                              />
                              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '0.65rem', fontWeight: 500, paddingTop: '2px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </ChartWrapper>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={1.5}>
            {/* Top Queries */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex' }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper key={`queries-${period}`} title="Top Query Categories" subtitle="What exhibitors ask most often" data={topQueries}>
                  <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                    <BarChart data={topQueries.slice(0, 6).map((d: any) => ({ ...d, count: Number(d.count || 0) }))} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tickColor }} />
                      <YAxis dataKey="query" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tickColor, fontWeight: 500 }} width={160} />
                      <Tooltip cursor={{ fill: cursorColor }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" name="Queries" radius={[0, 4, 4, 0]} barSize={20}>
                        {topQueries.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              </Box>
            </Grid>

            {/* Recent Conversations — right side of Top Queries in Overview */}
            <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex' }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper title="Recent Conversations" subtitle="Latest interactions with the chatbot" data={recentConversations} disableEmptyState={true}>
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
                        {recentConversations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>No Data Found</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          recentConversations.map((conv) => (
                            <TableRow key={conv.id} hover sx={{ '& td': { borderBottom: '1px solid', borderColor: alpha('#fff', 0.05), px: 1, py: 1.5 } }}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontSize: '0.65rem', fontWeight: 600 }}>
                                    {conv.user?.split('#')[1]?.slice(-2) || 'U'}
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
                                {conv.satisfied === null && <Typography variant="body2" sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>—</Typography>}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </ChartWrapper>
              </Box>
            </Grid>
          </Grid>

          {/* Executive Summary + Priority Actions */}
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ mb: 0.25, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Executive Summary</Typography>
                  <Typography variant="caption" sx={{ mb: 1.5, display: 'block', color: 'text.secondary', fontSize: '0.75rem' }}>Organizer-level interpretation</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {[
                      { title: 'Strong Adoption', text: '70.6% of eligible exhibitors used the bot, with high engagement from premium tiers.' },
                      { title: 'Standard Load Deflection', text: '67.5% deflection shows the bot successfully handles routine forms/deadlines.' },
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
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ mb: 0.25, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Priority Actions</Typography>
                  <Typography variant="caption" sx={{ mb: 1.5, display: 'block', color: 'text.secondary', fontSize: '0.75rem' }}>Steps for operations team</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {[
                      { title: 'Exception Handling', text: 'Create content for late approvals and sector-specific logistics.' },
                      { title: 'Logistics Richness', text: 'Enrich move-in/out answers with step-by-step contractor rules.' },
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Grid container spacing={1.5}>
            {/* Adoption Funnel */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper title="Exhibitor Adoption Funnel" subtitle="From eligible exhibitors to repeat chatbot users" data={adoptionFunnel}>
                  <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                    <BarChart data={adoptionFunnel.map((d: any) => ({ ...d, count: Number(d.count || 0) }))} layout="vertical" margin={{ left: 10 }}>
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
                </ChartWrapper>
              </Box>
            </Grid>

            {/* Adoption by Tier */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper title="Adoption by Exhibitor Tier" subtitle="Small, medium, premium and pavilion exhibitors" data={adoptionSegments}>
                  <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                    <BarChart data={adoptionSegments.map((d: any) => ({ ...d, adoption: Number(d.adoption || 0) }))} margin={{ left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis dataKey="segment" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                      <Tooltip cursor={{ fill: cursorColor }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="adoption" name="Adoption Rate %" fill="#22c55e" radius={[2, 2, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={1.5}>
            {/* New vs Repeat */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper title="New vs Repeat Users" subtitle="How many exhibitors came back for multiple sessions" data={userRetention}>
                  {(isFull) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ flexGrow: 1, minHeight: 180, position: 'relative' }}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                            <PieChart>
                              <Pie nameKey="legendName" data={(() => {
                                const total = userRetention.reduce((acc: number, val: any) => acc + Number(val.count || 0), 0);
                                return userRetention.map((d: any) => {
                                  const count = Number(d.count || 0);
                                  const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
                                  return { ...d, count, legendName: `${d.type}: ${pct}%` };
                                });
                              })()}
                                cx="50%" cy={isFull ? "50%" : "40%"}
                                innerRadius={isFull ? 150 : "35%"} outerRadius={isFull ? 250 : "55%"}
                                paddingAngle={1}
                                dataKey="count"
                                stroke="none"
                                label={{ fontSize: 10, fontWeight: 500 }}
                              >
                                {
                                  ['#6366f1', '#22c55e'].map((color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} />
                                  ))
                                }
                              </Pie>
                              <Tooltip formatter={(value: any) => value} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '0.65rem', fontWeight: 500, paddingTop: '2px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </ChartWrapper>
              </Box>
            </Grid>

            {/* Stand Type Adoption */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper title="Adoption by Stand Type" subtitle="Shell scheme, raw space, co-exhibitor, startup zone, etc." data={standTypeAdoption}>
                  <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                    <BarChart data={standTypeAdoption.map((d: any) => ({ ...d, users: Number(d.users || 0) }))} margin={{ left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} angle={-25} textAnchor="end" height={50} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                      <Tooltip cursor={{ fill: cursorColor }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="users" name="Users" fill="#8b5cf6" radius={[2, 2, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tab: Conversations */}
      {tab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Session Metrics mini-KPIs */}
          <Grid container spacing={1.5}>
            {[
              { label: 'Avg. Session Duration', value: '4m 12s' },
              { label: 'Avg. Messages / Session', value: '4.2' },
              { label: 'Bounce Rate (1-msg)', value: '18.4%' },
              { label: 'Escalation Rate', value: '3.1%' },
              { label: 'Unanswered Queries', value: '284' },
            ].map((item, i) => (
              <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={i}>
                <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, fontSize: '0.7rem', minHeight: 32 }}>{item.label}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.1rem' }}>{item.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={1.5}>
            {/* Conversations by Hour */}
            <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex' }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper title="Conversations by Hour" subtitle="When exhibitors interact with the chatbot" data={[{}]}>
                  <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                    <BarChart data={[
                      { time: '00-03', count: 84 }, { time: '03-06', count: 56 }, { time: '06-09', count: 298 },
                      { time: '09-12', count: 1012 }, { time: '12-15', count: 1144 }, { time: '15-18', count: 980 },
                      { time: '18-21', count: 468 }, { time: '21-24', count: 244 },
                    ]} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tickColor }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tickColor }} />
                      <Tooltip cursor={{ fill: cursorColor }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" name="Conversations" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              </Box>
            </Grid>

            {/* Source Entry Points */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex' }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper title="Source Entry Points" subtitle="Where exhibitors start conversations" data={[{}]}>
                  {(isFull) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ flexGrow: 1, minHeight: 180, position: 'relative' }}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { source: 'Dashboard Widget', users: 1462 },
                                  { source: 'Order Forms Page', users: 1038 },
                                  { source: 'Profile Wizard', users: 676 },
                                  { source: 'Deadline Calendar', users: 481 },
                                  { source: 'FAQ / Help Center', users: 402 },
                                  { source: 'Badging Module', users: 227 },
                                ]}
                                cx="50%" cy={isFull ? '50%' : '40%'}
                                innerRadius={isFull ? 150 : '35%'} outerRadius={isFull ? 250 : '55%'}
                                paddingAngle={2} dataKey="users" nameKey="source"
                                stroke="none"
                                label={{ fontSize: 10, fontWeight: 500 }}
                              >
                                {['#6366f1', '#22c55e', '#fbbf24', '#60a5fa', '#ec4899', '#f97316'].map((color, index) => (
                                  <Cell key={`cell-${index}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '0.65rem', fontWeight: 500, paddingTop: '2px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </ChartWrapper>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tab: Response Quality */}
      {tab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Grid container spacing={1.5}>
            {/* Sentiment */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper title="User Sentiment" subtitle="Post-conversation feedback" data={feedbackSentiment}>
                  {(isFull) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ flexGrow: 1, minHeight: 180, position: 'relative' }}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                            <PieChart>
                              <Pie nameKey="legendName" data={(() => {
                                const total = feedbackSentiment.reduce((acc: number, val: any) => acc + Number(val.count || 0), 0);
                                return feedbackSentiment.map((d: any) => {
                                  const count = Number(d.count || 0);
                                  const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
                                  return { ...d, count, legendName: `${d.sentiment}: ${pct}%` };
                                });
                              })()}
                                cx="50%" cy={isFull ? "50%" : "40%"}
                                innerRadius={isFull ? 150 : "35%"} outerRadius={isFull ? 250 : "55%"}
                                paddingAngle={1}
                                dataKey="count"
                                stroke="none"
                                label={{ fontSize: 10, fontWeight: 500 }}
                              >
                                {['#22c55e', '#fbbf24', '#ef4444'].map((color, index) => (
                                  <Cell key={`cell-${index}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: any) => value} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '0.65rem', fontWeight: 500, paddingTop: '2px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </ChartWrapper>
              </Box>
            </Grid>

            {/* Escalations */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper title="Escalation Drivers" subtitle="Why users asked for a human" data={escalations}>
                  <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                    <BarChart data={escalations.map((d: any) => ({ ...d, count: Number(d.count || 0) }))} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                      <YAxis dataKey="reason" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor, fontWeight: 500 }} width={180} />
                      <Tooltip cursor={{ fill: cursorColor }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" name="Escalations" fill="#ef4444" radius={[0, 2, 2, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              </Box>
            </Grid>
          </Grid>

          {/* Intent Outcomes + Knowledge Gaps */}
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper title="Intent Outcomes" subtitle="Resolution rates by topic" data={intentOutcome} disableEmptyState={true}>
                  <TableContainer sx={{ maxHeight: 350, overflow: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.05) : '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Intent</TableCell>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Convs</TableCell>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Success Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {intentOutcome.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>No Data Found</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          intentOutcome.map(row => (
                            <TableRow key={row.intent} hover sx={{ '& td': { borderColor: 'divider', py: 1 } }}>
                              <TableCell sx={{ fontWeight: 600, fontSize: '0.65rem' }}>{row.intent}</TableCell>
                              <TableCell sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>{row.conversations}</TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.65rem', color: (row.success / row.conversations) > 0.8 ? '#10b981' : '#f59e0b' }}>
                                  {((row.success / row.conversations) * 100).toFixed(1)}%
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </ChartWrapper>
              </Box>
            </Grid>

            {/* Top Knowledge Gaps */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 2, pb: 1.5 }}>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Top Knowledge Gaps</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Questions the bot couldn't answer</Typography>
                  </Box>
                  <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {[
                      { q: 'What are the exact electricity socket types available in my stand?', gap: 'Technical specs missing', count: 87 },
                      { q: 'Can I cancel my approved order within 48 hours?', gap: 'Policy gap', count: 64 },
                      { q: 'How do I register multiple team members for exhibitor badges?', gap: 'Registration flow unclear', count: 51 },
                    ].map((gap, i) => (
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Grid container spacing={1.5}>
            {/* Coverage Topics */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper title="Topic-wise Knowledge Readiness" subtitle={
                  <span style={{ display: 'block' }}>
                    Comparing <strong>Knowledge Coverage</strong> vs <strong>Response Accuracy</strong><br />
                    <em style={{ fontSize: '0.8em', color: 'inherit', opacity: 0.8 }}>* Higher coverage means more questions answered; higher accuracy means fewer mistakes.</em>
                  </span> as any
                } data={coverageTopics}>
                  <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                    <BarChart data={coverageTopics.map((d: any) => ({ ...d, coverage: Number(d.coverage || 0), accuracy: Number(d.accuracy || 0) }))} layout="vertical" margin={{ left: 10, right: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
                      <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                      <YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor, fontWeight: 600 }} width={120} />
                      <Tooltip
                        cursor={{ fill: cursorColor }}
                        contentStyle={{
                          borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                          backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, fontSize: '0.65rem'
                        }}
                      />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '0.65rem', fontWeight: 500, paddingTop: '2px' }} />
                      <Bar dataKey="coverage" name="Knowledge Coverage %" fill="#6366f1" radius={[0, 2, 2, 0]} barSize={10} />
                      <Bar dataKey="accuracy" name="Response Accuracy %" fill="#10b981" radius={[0, 2, 2, 0]} barSize={10} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              </Box>
            </Grid>

            {/* Knowledge Sources Table */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 2, pb: 1.5 }}>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Knowledge Sources</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Documents driving the chatbot's answers</Typography>
                  </Box>
                  <TableContainer sx={{ maxHeight: 350, overflow: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.05) : '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Source Document</TableCell>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Answers</TableCell>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Coverage</TableCell>
                          <TableCell sx={{ py: 1, fontWeight: 700, fontSize: '0.7rem' }}>Updated</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { source: 'Exhibitor Services Manual v3.2', answered: 2841, coverage: 87, updated: '2026-03-01' },
                          { source: 'Stand Construction Guidelines', answered: 1204, coverage: 72, updated: '2026-02-18' },
                          { source: 'Move-In / Move-Out Schedule', answered: 984, coverage: 65, updated: '2026-02-22' },
                          { source: 'Badging & Passes FAQ', answered: 761, coverage: 91, updated: '2026-03-05' },
                          { source: 'Catering & Hospitality Rules', answered: 542, coverage: 58, updated: '2026-01-30' },
                        ].map((row) => (
                          <TableRow key={row.source} hover sx={{ '& td': { borderColor: 'divider', py: 1 } }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.75rem' }}>{row.source}</Typography>
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

          {/* Knowledge Action Log */}
          <Card sx={{ borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, pb: 1.5 }}>
                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Knowledge Action Log</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Recent team actions to improve the bot</Typography>
              </Box>
              <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { title: 'Added stand electricity socket specifications', meta: 'Technical Services — 2026-03-10' },
                  { title: 'Updated cancellation policy to include 48-hour window', meta: 'Operations Team — 2026-03-08' },
                  { title: 'Expanded badge registration multi-user flow', meta: 'Badging Module — 2026-03-06' },
                  { title: 'Added Arabic translations for move-in schedule', meta: 'Localization — 2026-03-04' },
                ].map((item, i) => (
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Grid container spacing={1.5}>
            {/* Dept Impact */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <ChartWrapper title="Workload Impact by Department" subtitle="Estimated support hours saved by team" data={opsImpact}>
                  {(isFull) => (
                    <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={opsImpact.map((d: any) => ({ ...d, impact: Number(d.impact || 0), legendName: `${d.dept}: ${Number(d.impact || 0)}%` }))}
                          cx="50%" cy={isFull ? "50%" : "40%"}
                          innerRadius={isFull ? 150 : "35%"} outerRadius={isFull ? 250 : "55%"}
                          paddingAngle={1}
                          dataKey="impact"
                          nameKey="legendName"
                          stroke="none"
                          label={{ fontSize: 10, fontWeight: 500 }}
                        >
                          {['#22d3ee', '#6366f1', '#fbbf24', '#f97316', '#ec4899', '#8b5cf6'].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `${value}%`} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '0.65rem', fontWeight: 500, paddingTop: '2px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </ChartWrapper>
              </Box>
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

