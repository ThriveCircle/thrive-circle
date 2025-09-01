import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Check as CheckIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Local interfaces for type safety
interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  clientId: string;
  coachId?: string;
  targetDate: string;
  successCriteria: string[];
  status: "active" | "completed" | "paused" | "cancelled";
  progress: number;
  milestones: GoalMilestone[];
  metrics: GoalMetric[];
  createdAt: string;
  updatedAt?: string;
}

interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  targetDate: string;
  status: "pending" | "in-progress" | "completed";
  completedAt?: string;
  order: number;
  createdAt: string;
}

interface GoalMetric {
  id: string;
  goalId: string;
  name: string;
  unit: string;
  frequency: "daily" | "weekly" | "monthly";
  target: number;
  currentValue: number;
  history: MetricHistory[];
  createdAt: string;
}

interface MetricHistory {
  id: string;
  metricId: string;
  value: number;
  date: string;
  notes?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  company?: string;
}

interface Coach {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const TasksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<GoalMilestone | null>(null);
  const [newMetricValue, setNewMetricValue] = useState('');
  const [newMetricNotes, setNewMetricNotes] = useState('');

  const queryClient = useQueryClient();

  // Fetch data
  const { data: goalsData } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await fetch('/api/goals');
      return response.json();
    },
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      return response.json();
    },
  });

  const { data: coachesData } = useQuery({
    queryKey: ['coaches'],
    queryFn: async () => {
      const response = await fetch('/api/coaches');
      return response.json();
    },
  });

  const goals = goalsData?.data || [];
  const clients = clientsData?.data || [];
  const coaches = coachesData?.data || [];

  // Mutations
  const updateGoalMutation = useMutation({
    mutationFn: async (goal: Goal) => {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowGoalDialog(false);
      setEditingGoal(null);
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: async (milestone: Omit<GoalMilestone, 'id' | 'createdAt'>) => {
      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestone),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowMilestoneDialog(false);
      setEditingMilestone(null);
    },
  });

  const updateMetricMutation = useMutation({
    mutationFn: async ({ metricId, value, notes }: { metricId: string; value: number; notes?: string }) => {
      const response = await fetch(`/api/metrics/${metricId}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, notes }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setNewMetricValue('');
      setNewMetricNotes('');
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal({ ...goal });
    setShowGoalDialog(true);
  };

  const handleSaveGoal = () => {
    if (editingGoal) {
      updateGoalMutation.mutate(editingGoal);
    }
  };

  const handleCreateMilestone = () => {
    if (editingMilestone && selectedGoal) {
      createMilestoneMutation.mutate({
        ...editingMilestone,
        goalId: selectedGoal.id,
        order: selectedGoal.milestones.length + 1,
      });
    }
  };

  const handleUpdateMetric = (metricId: string) => {
    const value = parseFloat(newMetricValue);
    if (!isNaN(value)) {
      updateMetricMutation.mutate({ metricId, value, notes: newMetricNotes });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'paused': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c: Client) => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getCoachName = (coachId: string) => {
    const coach = coaches.find((c: Coach) => c.id === coachId);
    return coach?.name || 'Unknown Coach';
  };

  const getClientAvatar = (clientId: string) => {
    const client = clients.find((c: Client) => c.id === clientId);
    return client?.avatar;
  };

  const getCoachAvatar = (coachId: string) => {
    const coach = coaches.find((c: Coach) => c.id === coachId);
    return coach?.avatar;
  };

  const renderWorkflowChart = (goal: Goal) => {
    const completedMilestones = goal.milestones.filter(m => m.status === 'completed').length;
    const inProgressMilestones = goal.milestones.filter(m => m.status === 'in-progress').length;
    const pendingMilestones = goal.milestones.filter(m => m.status === 'pending').length;

    const chartData = [
      { name: 'Completed', value: completedMilestones, color: '#4CAF50' },
      { name: 'In Progress', value: inProgressMilestones, color: '#FF9800' },
      { name: 'Pending', value: pendingMilestones, color: '#9E9E9E' },
    ].filter(item => item.value > 0);

    return (
      <Box sx={{ height: 200, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
          {chartData.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: '50%' }} />
              <Typography variant="caption">{item.name}: {item.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderMetricsChart = (metric: GoalMetric) => {
    const chartData = metric.history.map(h => ({
      date: dayjs(h.date).format('MMM DD'),
      value: h.value,
      target: metric.target,
    }));

    return (
      <Box sx={{ height: 200, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Line type="monotone" dataKey="value" stroke="#6750A4" strokeWidth={2} />
            <Line type="monotone" dataKey="target" stroke="#B69DF8" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Goals & Tasks Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingGoal({
              id: '',
              title: '',
              description: '',
              category: '',
              clientId: '',
              coachId: '',
              targetDate: dayjs().add(1, 'month').toISOString(),
              successCriteria: [],
              status: 'active',
              progress: 0,
              milestones: [],
              metrics: [],
              createdAt: new Date().toISOString(),
            });
            setShowGoalDialog(true);
          }}
        >
          Create New Goal
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Goals Overview" />
        <Tab label="Workflow Charts" />
        <Tab label="Metrics & Progress" />
        <Tab label="Task Management" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {goals.map((goal: Goal) => (
            <Grid item xs={12} md={6} lg={4} key={goal.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                    transition: 'all 0.2s ease-in-out',
                  }
                }}
                onClick={() => setSelectedGoal(goal)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Chip 
                      label={goal.status} 
                      color={getStatusColor(goal.status) as any}
                      size="small"
                    />
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditGoal(goal); }}>
                      <EditIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {goal.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {goal.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BusinessIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {getClientName(goal.clientId)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Target: {dayjs(goal.targetDate).format('MMM DD, YYYY')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Progress</Typography>
                      <Typography variant="caption">{goal.progress}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={goal.progress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #6750A4 0%, #B69DF8 100%)',
                        }
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={goal.category} size="small" variant="outlined" />
                    <Chip 
                      label={`${goal.milestones.length} milestones`} 
                      size="small" 
                      variant="outlined"
                      icon={<TimelineIcon />}
                    />
                    <Chip 
                      label={`${goal.metrics.length} metrics`} 
                      size="small" 
                      variant="outlined"
                      icon={<TrendingUpIcon />}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && selectedGoal && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Workflow: {selectedGoal.title}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingMilestone({
                  id: '',
                  goalId: selectedGoal.id,
                  title: '',
                  description: '',
                  targetDate: dayjs().add(1, 'week').toISOString(),
                  status: 'pending',
                  order: selectedGoal.milestones.length + 1,
                  createdAt: new Date().toISOString(),
                });
                setShowMilestoneDialog(true);
              }}
            >
              Add Milestone
            </Button>
          </Box>
          
          {renderWorkflowChart(selectedGoal)}
          
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {selectedGoal.milestones.map((milestone) => (
              <Grid item xs={12} md={6} lg={4} key={milestone.id}>
                <Card sx={{ 
                  background: milestone.status === 'completed' 
                    ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
                    : milestone.status === 'in-progress'
                    ? 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)'
                    : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip 
                        label={milestone.status} 
                        color={milestone.status === 'completed' ? 'success' : milestone.status === 'in-progress' ? 'warning' : 'default'}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        #{milestone.order}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" component="h4" sx={{ mb: 1 }}>
                      {milestone.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {milestone.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(milestone.targetDate).format('MMM DD, YYYY')}
                      </Typography>
                    </Box>
                    
                    {milestone.completedAt && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <CheckIcon fontSize="small" color="success" />
                        <Typography variant="caption" color="success.main">
                          Completed {dayjs(milestone.completedAt).fromNow()}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 2 && selectedGoal && (
        <Box>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Metrics & Progress: {selectedGoal.title}
          </Typography>
          
          <Grid container spacing={3}>
            {selectedGoal.metrics.map((metric) => (
              <Grid item xs={12} md={6} key={metric.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="h4">
                        {metric.name}
                      </Typography>
                      <Chip 
                        label={metric.frequency} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                      <Typography variant="h4" color="primary">
                        {metric.currentValue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        / {metric.target} {metric.unit}
                      </Typography>
                    </Box>
                    
                    {renderMetricsChart(metric)}
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Update Progress
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          size="small"
                          placeholder="New value"
                          value={newMetricValue}
                          onChange={(e) => setNewMetricValue(e.target.value)}
                          type="number"
                          sx={{ flex: 1 }}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleUpdateMetric(metric.id)}
                        >
                          Update
                        </Button>
                      </Box>
                      <TextField
                        size="small"
                        placeholder="Notes (optional)"
                        value={newMetricNotes}
                        onChange={(e) => setNewMetricNotes(e.target.value)}
                        fullWidth
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Task Management
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Tasks are automatically created from goals and milestones. You can manage them here or through the goal workflow.
          </Alert>
          
          {/* Task management content would go here */}
          <Typography variant="body1" color="text.secondary">
            Task management features coming soon...
          </Typography>
        </Box>
      )}

      {/* Goal Edit Dialog */}
      <Dialog open={showGoalDialog} onClose={() => setShowGoalDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingGoal?.id ? 'Edit Goal' : 'Create New Goal'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goal Title"
                value={editingGoal?.title || ''}
                onChange={(e) => setEditingGoal(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={editingGoal?.description || ''}
                onChange={(e) => setEditingGoal(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                value={editingGoal?.category || ''}
                onChange={(e) => setEditingGoal(prev => prev ? { ...prev, category: e.target.value } : null)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Target Date"
                value={editingGoal?.targetDate ? dayjs(editingGoal.targetDate).format('YYYY-MM-DD') : ''}
                onChange={(e) => setEditingGoal(prev => prev ? { ...prev, targetDate: dayjs(e.target.value).toISOString() } : null)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Client</InputLabel>
                <Select
                  value={editingGoal?.clientId || ''}
                  onChange={(e) => setEditingGoal(prev => prev ? { ...prev, clientId: e.target.value } : null)}
                  label="Client"
                >
                  {clients.map((client: Client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Coach</InputLabel>
                <Select
                  value={editingGoal?.coachId || ''}
                  onChange={(e) => setEditingGoal(prev => prev ? { ...prev, coachId: e.target.value } : null)}
                  label="Coach"
                >
                  <MenuItem value="">None</MenuItem>
                  {coaches.map((coach: Coach) => (
                    <MenuItem key={coach.id} value={coach.id}>
                      {coach.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingGoal?.status || 'active'}
                  onChange={(e) => setEditingGoal(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Progress (%)"
                value={editingGoal?.progress || 0}
                onChange={(e) => setEditingGoal(prev => prev ? { ...prev, progress: parseInt(e.target.value) || 0 } : null)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGoalDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveGoal} variant="contained" startIcon={<SaveIcon />}>
            Save Goal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Milestone Dialog */}
      <Dialog open={showMilestoneDialog} onClose={() => setShowMilestoneDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Milestone</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Milestone Title"
                value={editingMilestone?.title || ''}
                onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={editingMilestone?.description || ''}
                onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Target Date"
                value={editingMilestone?.targetDate ? dayjs(editingMilestone.targetDate).format('YYYY-MM-DD') : ''}
                onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, targetDate: dayjs(e.target.value).toISOString() } : null)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMilestoneDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateMilestone} variant="contained">
            Create Milestone
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
