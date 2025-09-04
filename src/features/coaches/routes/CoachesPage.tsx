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
  Badge,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Rating,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Psychology as PsychologyIcon,
  MonetizationOn as MoneyIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  Pending as PendingIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRightDrawer } from '../../../app/providers/RightDrawerProvider';
import { useUserContext } from '../../../app/providers/UserContext';

dayjs.extend(relativeTime);

interface Coach {
  id: string;
  name: string;
  email: string;
  bio: string;
  specialties: string[];
  avatar?: string;
  availability: {
    days: string[];
    hours: string;
  };
  clients: string[];
  sessions: string[];
  rating?: number;
  reviewCount?: number;
  hourlyRate?: number;
  totalEarnings?: number;
  status: "active" | "pending" | "suspended" | "inactive";
  isVerified: boolean;
  certifications: string[];
  experience: number; // years
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'suspended':
      return 'error';
    case 'inactive':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircleIcon fontSize="small" />;
    case 'pending':
      return <PendingIcon fontSize="small" />;
    case 'suspended':
      return <BlockIcon fontSize="small" />;
    case 'inactive':
      return <InfoIcon fontSize="small" />;
    default:
      return <InfoIcon fontSize="small" />;
  }
};

export const CoachesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openDrawer, closeDrawer } = useRightDrawer();
  const { role, currentClientId } = useUserContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  const { data: coachesData, isLoading } = useQuery({
    queryKey: ['coaches', page, pageSize, search, statusFilter, specialtyFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { q: search }),
        ...(statusFilter && { status: statusFilter }),
        ...(specialtyFilter && { specialty: specialtyFilter }),
      });
      const response = await fetch(`/api/coaches?${params}`);
      return response.json();
    },
  });

  const approveCoachMutation = useMutation({
    mutationFn: async (coachId: string) => {
      const response = await fetch(`/api/coaches/${coachId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaches'] });
      closeDrawer();
      setSelectedCoach(null);
    },
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleSpecialtyFilterChange = (event: any) => {
    setSpecialtyFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewCoach = (coachId: string) => {
    navigate(`/coaches/${coachId}`);
  };

  const handleApproveCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    openDrawer(
      (
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Approve Coach
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to approve <strong>{coach.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This will activate their account and allow them to start accepting clients.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={closeDrawer}>Cancel</Button>
            <Button
              onClick={() => approveCoachMutation.mutate(coach.id)}
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
            >
              Approve Coach
            </Button>
          </Box>
        </Box>
      ),
      { title: 'Approve Coach', width: 420 }
    );
  };

  const confirmApproval = () => {
    if (selectedCoach) {
      approveCoachMutation.mutate(selectedCoach.id);
    }
  };

  const requestCoachingMutation = useMutation({
    mutationFn: async ({ coachId, message }: { coachId: string; message?: string }) => {
      const response = await fetch('/api/coach-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId, clientId: currentClientId, message }),
      });
      return response.json();
    },
    onSuccess: () => {
      closeDrawer();
    },
  });

  const openRequestDrawer = (coach: Coach) => {
    const RequestForm = () => {
      const [message, setMessage] = useState('');
      return (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Request Coaching</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are requesting coaching from {coach.name}. Add an optional note for context.
          </Typography>
          <TextField
            label="Message (optional)"
            multiline
            minRows={3}
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={closeDrawer}>Cancel</Button>
            <Button variant="contained" onClick={() => requestCoachingMutation.mutate({ coachId: coach.id, message })}>
              Send Request
            </Button>
          </Box>
        </Box>
      );
    };
    openDrawer(<RequestForm />, { title: 'Request Coaching', width: 420 });
  };

  const getPendingCoaches = () => {
    return coachesData?.data?.filter((coach: Coach) => coach.status === 'pending') || [];
  };

  const getTopPerformers = () => {
    return coachesData?.data?.filter((coach: Coach) => 
      coach.rating && coach.rating >= 4.5
    ).sort((a: Coach, b: Coach) => (b.rating || 0) - (a.rating || 0)).slice(0, 5) || [];
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>Coaches</Typography>
        <Card>
          <CardContent>
            <Typography>Loading coaches...</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const coaches = coachesData?.data || [];
  const pendingCoaches = getPendingCoaches();
  const topPerformers = getTopPerformers();

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
        <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}>Coaches</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/coaches/new')}
          sx={{ 
            minWidth: { xs: '100%', sm: 'auto' },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Add Coach
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {coaches.filter((c: Coach) => c.status === 'active').length}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Active Coaches</Typography>
                </Box>
                <PsychologyIcon sx={{ fontSize: { xs: 24, sm: 40 }, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {pendingCoaches.length}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Pending Approval</Typography>
                </Box>
                <PendingIcon sx={{ fontSize: { xs: 24, sm: 40 }, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {coaches.reduce((sum: number, c: Coach) => sum + (c.clients?.length || 0), 0)}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Total Clients</Typography>
                </Box>
                <GroupIcon sx={{ fontSize: { xs: 24, sm: 40 }, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    ${coaches.reduce((sum: number, c: Coach) => sum + (c.totalEarnings || 0), 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Total Earnings</Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: { xs: 24, sm: 40 }, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="All Coaches" />
            <Tab label="Pending Approval" />
            <Tab label="Top Performers" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search coaches..."
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
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Specialty</InputLabel>
              <Select
                value={specialtyFilter}
                label="Specialty"
                onChange={handleSpecialtyFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Life Coaching">Life Coaching</MenuItem>
                <MenuItem value="Career Development">Career Development</MenuItem>
                <MenuItem value="Leadership">Leadership</MenuItem>
                <MenuItem value="Wellness">Wellness</MenuItem>
                <MenuItem value="Executive Coaching">Executive Coaching</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 0 && (
        /* All Coaches Table */
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Coach</TableCell>
                    <TableCell>Specialties</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Clients</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Availability</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {coaches.map((coach: Coach) => (
                    <TableRow key={coach.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Badge
                            badgeContent={coach.isVerified ? <VerifiedIcon fontSize="small" /> : 0}
                            color="primary"
                          >
                            <Avatar src={coach.avatar} alt={coach.name}>
                              {coach.name.charAt(0)}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="subtitle2">{coach.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {coach.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {coach.experience} years experience
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {coach.specialties.slice(0, 2).map((specialty, index) => (
                            <Chip
                              key={index}
                              label={specialty}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          ))}
                          {coach.specialties.length > 2 && (
                            <Chip
                              label={`+${coach.specialties.length - 2}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={coach.status}
                          color={getStatusColor(coach.status) as any}
                          size="small"
                          icon={getStatusIcon(coach.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={coach.rating || 0} readOnly size="small" />
                          <Typography variant="body2">
                            ({coach.reviewCount || 0})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GroupIcon fontSize="small" color="primary" />
                          <Typography variant="body2">{coach.clients?.length || 0}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {coach.hourlyRate ? (
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                            ${coach.hourlyRate}/hr
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not set</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {coach.availability.days.slice(0, 2).join(', ')}
                            {coach.availability.days.length > 2 && '...'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Coach">
                            <IconButton
                              size="small"
                              onClick={() => handleViewCoach(coach.id)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Coach">
                            <IconButton size="small" color="secondary">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {coach.status === 'pending' && (
                            <Tooltip title="Approve Coach">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApproveCoach(coach)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {role === 'client' && (
                            <Tooltip title="Request Coaching">
                              <IconButton size="small" color="primary" onClick={() => openRequestDrawer(coach)}>
                                <MessageIcon />
                              </IconButton>
                            </Tooltip>
                          )}
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
            {coachesData?.pagination && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={coachesData.pagination.totalPages}
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
        /* Pending Approval */
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Pending Approval</Typography>
            {pendingCoaches.length === 0 ? (
              <Alert severity="info">No coaches pending approval.</Alert>
            ) : (
              <List>
                {pendingCoaches.map((coach: Coach) => (
                  <ListItem key={coach.id} divider>
                    <ListItemAvatar>
                      <Avatar src={coach.avatar} alt={coach.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={coach.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {coach.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {coach.specialties.join(', ')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {coach.experience} years experience • {coach.bio.substring(0, 100)}...
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleApproveCoach(coach)}
                        >
                          Approve
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<ViewIcon />}>
                          Review
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<MessageIcon />}>
                          Contact
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
        /* Top Performers */
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Top Performers</Typography>
            {topPerformers.length === 0 ? (
              <Alert severity="info">No top performers found.</Alert>
            ) : (
              <Grid container spacing={2}>
                {topPerformers.map((coach: Coach, index: number) => (
                  <Grid item xs={12} md={6} key={coach.id}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar src={coach.avatar} alt={coach.name} sx={{ width: 60, height: 60 }} />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -5,
                              right: -5,
                              background: '#FFD700',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'white' }}>
                              #{index + 1}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">{coach.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {coach.specialties.join(', ')}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Rating value={coach.rating || 0} readOnly size="small" />
                            <Typography variant="body2">
                              ({coach.reviewCount || 0} reviews)
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                            ${coach.hourlyRate}/hr • {coach.clients?.length || 0} clients
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewCoach(coach.id)}
                        >
                          View
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      {/* Drawer replaces approval dialog */}
    </Box>
  );
};
