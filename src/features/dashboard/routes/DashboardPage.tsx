import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';

// Mock data for charts
const revenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
];

const clientStatusData = [
  { name: 'Active', value: 24, color: 'linear-gradient(135deg, #6750A4 0%, #8B5CF6 100%)' },
  { name: 'Inactive', value: 4, color: 'linear-gradient(135deg, #B69DF8 0%, #D0BCFF 100%)' },
  { name: 'Archived', value: 2, color: 'linear-gradient(135deg, #938F99 0%, #A1A1AA 100%)' },
];

const recentActivity = [
  { type: 'session', description: 'New session scheduled with Client 1', time: '1 hour ago', icon: <EventIcon /> },
  { type: 'assessment', description: 'Assessment completed by Client 2', time: '3 hours ago', icon: <AssessmentIcon /> },
  { type: 'task', description: 'Task "Follow-up call" completed', time: '6 hours ago', icon: <CheckIcon /> },
  { type: 'client', description: 'New client registration: John Doe', time: '1 day ago', icon: <PeopleIcon /> },
];

const KPICard: React.FC<{
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, trend, icon, color }) => (
  <Card sx={{ 
    height: '100%',
    background: 'linear-gradient(135deg, #FFFBFE 0%, #F7F2FF 100%)',
    border: '1px solid rgba(103, 80, 164, 0.1)',
    boxShadow: '0 4px 6px -1px rgba(103, 80, 164, 0.1), 0 2px 4px -1px rgba(103, 80, 164, 0.06)',
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        <Avatar sx={{ 
          background: color, 
          width: 56, 
          height: 56,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}>
          {icon}
        </Avatar>
      </Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {value}
      </Typography>
      {trend !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {trend > 0 ? (
            <TrendingUpIcon color="success" fontSize="small" />
          ) : (
            <TrendingDownIcon color="error" fontSize="small" />
          )}
          <Typography
            variant="body2"
            color={trend > 0 ? 'success.main' : 'error.main'}
          >
            {Math.abs(trend)}% from last month
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/summary');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ height: 200 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography>Loading...</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>
      
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Active Clients"
            value={dashboardData?.activeClients || 0}
            trend={12}
            icon={<PeopleIcon />}
            color="linear-gradient(135deg, #6750A4 0%, #8B5CF6 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Completion Rate"
            value={`${dashboardData?.completionRate || 0}%`}
            trend={8}
            icon={<CheckIcon />}
            color="linear-gradient(135deg, #B69DF8 0%, #D0BCFF 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Upcoming Sessions"
            value={dashboardData?.upcomingSessions || 0}
            trend={8}
            icon={<ScheduleIcon />}
            color="linear-gradient(135deg, #10B981 0%, #34D399 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Revenue MTD"
            value={`$${(dashboardData?.revenueMTD || 0).toLocaleString()}`}
            trend={15}
            icon={<MoneyIcon />}
            color="linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Revenue Trend</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="url(#revenueGradient)" 
                  strokeWidth={3} 
                />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6750A4" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Client Status</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={clientStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {clientStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
              <List>
                {recentActivity.map((activity, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ color: 'primary.main' }}>
                      {activity.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={activity.time}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Chip
                  label="Schedule New Session"
                  color="primary"
                  variant="outlined"
                  clickable
                  sx={{ justifyContent: 'flex-start', height: 48 }}
                />
                <Chip
                  label="Add New Client"
                  color="secondary"
                  variant="outlined"
                  clickable
                  sx={{ justifyContent: 'flex-start', height: 48 }}
                />
                <Chip
                  label="Create Assessment"
                  color="primary"
                  variant="outlined"
                  clickable
                  sx={{ justifyContent: 'flex-start', height: 48 }}
                />
                <Chip
                  label="Generate Report"
                  color="secondary"
                  variant="outlined"
                  clickable
                  sx={{ justifyContent: 'flex-start', height: 48 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
