import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Grid,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Event as EventIcon,
  Task as TaskIcon,
  Message as MessageIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUserContext } from '../../../app/providers/UserContext';
import { useRightDrawer } from '../../../app/providers/RightDrawerProvider';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
  status: "active" | "inactive" | "archived";
  coachId?: string;
  programId?: string;
  goals?: string[];
  assessmentCount?: number;
  sessionCount?: number;
  lastSession?: string;
  nextSession?: string | null;
  totalSpent?: number;
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'warning';
    case 'archived':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircleIcon fontSize="small" />;
    case 'inactive':
      return <WarningIcon fontSize="small" />;
    case 'archived':
      return <InfoIcon fontSize="small" />;
    default:
      return <InfoIcon fontSize="small" />;
  }
};

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role, currentCoachId } = useUserContext();
  const { openDrawer, closeDrawer } = useRightDrawer();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeTab, setActiveTab] = useState(0);

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients', page, pageSize, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { q: search }),
        ...(statusFilter && { status: statusFilter }),
        ...(role === 'coach' && currentCoachId ? { coachId: currentCoachId } : {}),
      });
      const response = await fetch(`/api/clients?${params}`);
      return response.json();
    },
  });

  const inviteClientMutation = useMutation({
    mutationFn: async (payload: { email: string; name?: string }) => {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId: currentCoachId, ...payload }),
      });
      return response.json();
    },
    onSuccess: () => {
      closeDrawer();
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const showInviteDrawer = () => {
    const InviteForm = () => {
      const [email, setEmail] = useState('');
      const [name, setName] = useState('');
      const isDisabled = !email || inviteClientMutation.isPending;
      return (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Invite Client</Typography>
          <TextField
            fullWidth
            label="Client Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Client Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={closeDrawer}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => inviteClientMutation.mutate({ email, name: name || undefined })}
              disabled={isDisabled}
            >
              Send Invite
            </Button>
          </Box>
        </Box>
      );
    };
    openDrawer(<InviteForm />, { title: 'Invite Client', width: 420 });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewClient = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const getUpcomingSessions = () => {
    return clientsData?.data?.filter((client: Client) => 
      client.nextSession && dayjs(client.nextSession).isAfter(dayjs())
    ) || [];
  };

  const getRecentActivity = () => {
    return clientsData?.data?.filter((client: Client) => 
      client.lastSession && dayjs(client.lastSession).isAfter(dayjs().subtract(7, 'days'))
    ) || [];
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>Clients</Typography>
        <Card>
          <CardContent>
            <Typography>Loading clients...</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const clients = clientsData?.data || [];
  const hasNoClients = role === 'coach' && ((clientsData?.data?.length || 0) === 0);
  const upcomingSessions = getUpcomingSessions();
  const recentActivity = getRecentActivity();

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        gap: { xs: 2, sm: 0 },
        mb: 3 
      }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}>Clients</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/clients/new')}
          sx={{ 
            minWidth: { xs: '100%', sm: 'auto' },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Add Client
        </Button>
      </Box>

      {/* Empty state for coaches without clients */}
      {hasNoClients && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>No clients attached</Typography>
                <Typography variant="body2" color="text.secondary">Invite your first client by email to get started.</Typography>
              </Box>
              <Button variant="contained" onClick={showInviteDrawer}>Invite Client</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {clients.filter((c: Client) => c.status === 'active').length}
                  </Typography>
                  <Typography variant="body2">Active Clients</Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {upcomingSessions.length}
                  </Typography>
                  <Typography variant="body2">Upcoming Sessions</Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {clients.reduce((sum: number, c: Client) => sum + (c.assessmentCount || 0), 0)}
                  </Typography>
                  <Typography variant="body2">Total Assessments</Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ${clients.reduce((sum: number, c: Client) => sum + (c.totalSpent || 0), 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">Total Revenue</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="All Clients" />
            <Tab label="Upcoming Sessions" />
            <Tab label="Recent Activity" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search clients..."
              value={search}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 0 && (
        /* All Clients Table */
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Coach</TableCell>
                    <TableCell>Program</TableCell>
                    <TableCell>Assessments</TableCell>
                    <TableCell>Sessions</TableCell>
                    <TableCell>Next Session</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client: Client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={client.avatar} alt={client.name}>
                            {client.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{client.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {client.email}
                            </Typography>
                            {client.phone && (
                              <Typography variant="caption" color="text.secondary">
                                {client.phone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {client.company && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon fontSize="small" color="action" />
                            <Typography variant="body2">{client.company}</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={client.status}
                          color={getStatusColor(client.status) as any}
                          size="small"
                          icon={getStatusIcon(client.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {client.coachId ? `Coach ${client.coachId.split('-')[1]}` : 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        {client.programId ? `Program ${client.programId.split('-')[1]}` : 'None'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AssessmentIcon fontSize="small" color="primary" />
                          <Typography variant="body2">{client.assessmentCount || 0}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EventIcon fontSize="small" color="secondary" />
                          <Typography variant="body2">{client.sessionCount || 0}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {client.nextSession ? (
                          <Chip
                            label={dayjs(client.nextSession).format('MMM DD')}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">None</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Client">
                            <IconButton
                              size="small"
                              onClick={() => handleViewClient(client.id)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Client">
                            <IconButton size="small" color="secondary">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Message">
                            <IconButton size="small" color="info">
                              <MessageIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {clientsData?.pagination && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={clientsData.pagination.totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        /* Upcoming Sessions */
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Upcoming Sessions</Typography>
            {upcomingSessions.length === 0 ? (
              <Alert severity="info">No upcoming sessions scheduled.</Alert>
            ) : (
              <List>
                {upcomingSessions.map((client: Client) => (
                  <ListItem key={client.id} divider>
                    <ListItemAvatar>
                      <Avatar src={client.avatar} alt={client.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={client.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {client.company}
                          </Typography>
                          <Typography variant="caption" color="primary">
                            Next session: {dayjs(client.nextSession).format('MMM DD, YYYY [at] h:mm A')}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" startIcon={<EventIcon />}>
                          Reschedule
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<MessageIcon />}>
                          Message
                        </Button>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        /* Recent Activity */
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
            {recentActivity.length === 0 ? (
              <Alert severity="info">No recent activity.</Alert>
            ) : (
              <List>
                {recentActivity.map((client: Client) => (
                  <ListItem key={client.id} divider>
                    <ListItemAvatar>
                      <Avatar src={client.avatar} alt={client.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={client.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Last session: {dayjs(client.lastSession).fromNow()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {client.notes?.[client.notes.length - 1] || 'No recent notes'}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" startIcon={<ViewIcon />}>
                          View Details
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<TaskIcon />}>
                          Assign Task
                        </Button>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
