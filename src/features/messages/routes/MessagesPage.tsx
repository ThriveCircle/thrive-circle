import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  NotificationsOff as MuteIcon,
  Archive as ArchiveIcon,
  Download as DownloadIcon,
  Report as ReportIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface MessageThread {
  id: string;
  participants: string[];
  subject: string;
  lastMessage: any;
  unreadCount: number;
  isMuted: boolean;
  isArchived: boolean;
  retentionPolicy: string;
  createdAt: string;
  updatedAt: string;
}

export const MessagesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedThreadForMenu, setSelectedThreadForMenu] = useState<MessageThread | null>(null);

  const queryClient = useQueryClient();

  // Fetch message threads
  const { data: threadsData, isLoading: threadsLoading } = useQuery({
    queryKey: ['message-threads'],
    queryFn: async () => {
      const response = await fetch('/api/message-threads');
      return response.json();
    },
  });

  // Fetch moderation reports
  const { data: reportsData } = useQuery({
    queryKey: ['moderation-reports'],
    queryFn: async () => {
      const response = await fetch('/api/moderation/reports');
      return response.json();
    },
  });

  // Fetch audit logs
  const { data: auditData } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const response = await fetch('/api/audit-logs');
      return response.json();
    },
  });

  // Mutations
  const muteThreadMutation = useMutation({
    mutationFn: async ({ threadId, muted }: { threadId: string; muted: boolean }) => {
      const response = await fetch(`/api/message-threads/${threadId}/mute`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ muted }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
      setSnackbar({ open: true, message: 'Thread muted successfully', severity: 'success' });
    },
  });

  const archiveThreadMutation = useMutation({
    mutationFn: async ({ threadId, archived }: { threadId: string; archived: boolean }) => {
      const response = await fetch(`/api/message-threads/${threadId}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
      setSnackbar({ open: true, message: 'Thread archived successfully', severity: 'success' });
    },
  });

  const exportThreadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      const response = await fetch('/api/messages/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSnackbar({ open: true, message: 'Export started successfully', severity: 'success' });
      setShowExportDialog(false);
    },
  });



  const handleThreadAction = (action: string, thread: MessageThread) => {
    switch (action) {
      case 'mute':
        muteThreadMutation.mutate({ threadId: thread.id, muted: !thread.isMuted });
        break;
      case 'archive':
        archiveThreadMutation.mutate({ threadId: thread.id, archived: !thread.isArchived });
        break;
      case 'export':
        setSelectedThread(thread);
        setShowExportDialog(true);
        break;
    }
    setAnchorEl(null);
  };

  const handleExport = () => {
    if (selectedThread) {
      exportThreadMutation.mutate(selectedThread.id);
    }
  };

  const filteredThreads = threadsData?.data?.filter((thread: MessageThread) => {
    if (searchQuery) {
      return thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
             thread.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  }) || [];

  const pendingReports = reportsData?.data?.filter((report: any) => report.status === 'pending') || [];
  const recentAuditLogs = auditData?.data?.slice(0, 5) || [];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Messages</Typography>
      
      <Grid container spacing={3}>
        {/* Message Threads */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Conversations</Typography>
                <TextField
                  size="small"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 300 }}
                />
              </Box>
              
              {threadsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {filteredThreads.map((thread: MessageThread) => (
                    <ListItem
                      key={thread.id}
                      sx={{
                        border: '1px solid #E7E0EC',
                        borderRadius: 2,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#F7F2FF' },
                      }}
                      onClick={() => setSelectedThread(thread)}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={thread.unreadCount}
                          color="primary"
                          invisible={thread.unreadCount === 0}
                        >
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {thread.subject.charAt(0)}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {thread.subject}
                            </Typography>
                            {thread.isMuted && <MuteIcon color="action" fontSize="small" />}
                            {thread.isArchived && <ArchiveIcon color="action" fontSize="small" />}
                            <Chip
                              label={thread.retentionPolicy}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {thread.lastMessage.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(thread.updatedAt).fromNow()}
                            </Typography>
                          </Box>
                        }
                      />
                      
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedThreadForMenu(thread);
                          setAnchorEl(e.currentTarget);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar - Moderation & Analytics */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {/* Moderation Reports */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Moderation</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Pending Reports: {pendingReports.length}
                    </Typography>
                    {pendingReports.length > 0 && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setShowModerationDialog(true)}
                        sx={{ mt: 1 }}
                      >
                        Review Reports
                      </Button>
                    )}
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary">
                    Recent Actions: {recentAuditLogs.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => setShowExportDialog(true)}
                    sx={{ mb: 1 }}
                  >
                    Export Conversations
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ReportIcon />}
                    onClick={() => setShowModerationDialog(true)}
                  >
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Thread Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleThreadAction('mute', selectedThreadForMenu!)}>
          {selectedThreadForMenu?.isMuted ? 'Unmute' : 'Mute'} Thread
        </MenuItem>
        <MenuItem onClick={() => handleThreadAction('archive', selectedThreadForMenu!)}>
          {selectedThreadForMenu?.isArchived ? 'Unarchive' : 'Archive'} Thread
        </MenuItem>
        <MenuItem onClick={() => handleThreadAction('export', selectedThreadForMenu!)}>
          Export to PDF
        </MenuItem>
      </Menu>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
        <DialogTitle>Export Conversation</DialogTitle>
        <DialogContent>
          <Typography>
            Export "{selectedThread?.subject}" conversation to PDF?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">
            Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Moderation Dialog */}
      <Dialog 
        open={showModerationDialog} 
        onClose={() => setShowModerationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Moderation Dashboard</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Pending Reports</Typography>
              {pendingReports.map((report: any) => (
                <Paper key={report.id} sx={{ p: 2, mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {report.reason}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {report.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                      Review
                    </Button>
                    <Button size="small" variant="outlined" color="error">
                      Dismiss
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Audit Logs</Typography>
              {recentAuditLogs.map((log: any) => (
                <Paper key={log.id} sx={{ p: 2, mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {log.action.replace('_', ' ')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(log.createdAt).fromNow()}
                  </Typography>
                </Paper>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModerationDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
