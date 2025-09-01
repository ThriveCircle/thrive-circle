import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Switch,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  BarChart as ResultsIcon,
  Settings as SettingsIcon,
  Palette as BrandingIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Timer as TimerIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  PlayArrow as InProgressIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  questions: any[];
  category: string;
  tags: string[];
  estimatedTime: number;
  version: string;
  isActive: boolean;
  settings: any;
  branding: any;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface AssessmentAssignment {
  id: string;
  assessmentId: string;
  clientId: string;
  coachId: string;
  assignedAt: string;
  dueDate?: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  timeSpent?: number;
  progress: number;
  lastAccessedAt: string;
}

interface AssessmentResult {
  id: string;
  assignmentId: string;
  assessmentId: string;
  clientId: string;
  coachId: string;
  totalScore?: number;
  maxScore?: number;
  percentageScore?: number;
  timeSpent: number;
  completedAt: string;
  status: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
}

export const AssessmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showBrandingDialog, setShowBrandingDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const queryClient = useQueryClient();

  // Fetch assessment templates
  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['assessment-templates'],
    queryFn: async () => {
      const response = await fetch('/api/assessment-templates');
      return response.json();
    },
  });

  // Fetch assessment assignments
  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['assessment-assignments'],
    queryFn: async () => {
      const response = await fetch('/api/assessment-assignments');
      return response.json();
    },
  });

  // Fetch assessment results
  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ['assessment-results'],
    queryFn: async () => {
      const response = await fetch('/api/assessment-results');
      return response.json();
    },
  });

  // Fetch clients for display
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      return response.json();
    },
  });

  // Mutations
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const response = await fetch('/api/assessment-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-templates'] });
      setSnackbar({ open: true, message: 'Assessment template created successfully', severity: 'success' });
      setShowCreateDialog(false);
    },
  });

  const assignAssessmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const response = await fetch('/api/assessment-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-assignments'] });
      setSnackbar({ open: true, message: 'Assessment assigned successfully', severity: 'success' });
      setShowAssignmentDialog(false);
    },
  });

  const handleCreateTemplate = (templateData: any) => {
    createTemplateMutation.mutate({
      ...templateData,
      createdBy: 'coach-1', // Mock coach ID
    });
  };

  const handleAssignAssessment = (assignmentData: any) => {
    assignAssessmentMutation.mutate(assignmentData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'assigned': return 'info';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CompletedIcon />;
      case 'in-progress': return <InProgressIcon />;
      case 'assigned': return <PendingIcon />;
      case 'overdue': return <TimerIcon />;
      default: return <PendingIcon />;
    }
  };

  const templates = templatesData?.data || [];
  const assignments = assignmentsData?.data || [];
  const results = resultsData?.data || [];
  const clients = clientsData?.data || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Assessments</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
        >
          Create Assessment
        </Button>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Templates" icon={<AssessmentIcon />} />
            <Tab label="Assignments" icon={<AssignmentIcon />} />
            <Tab label="Results" icon={<ResultsIcon />} />
          </Tabs>
        </CardContent>
      </Card>

      {/* Templates Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {templatesLoading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : (
            templates.map((template: AssessmentTemplate) => (
              <Grid item xs={12} md={6} lg={4} key={template.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {template.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {template.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip label={template.category} size="small" color="primary" />
                          <Chip label={`v${template.version}`} size="small" variant="outlined" />
                          <Chip 
                            label={template.isActive ? 'Active' : 'Inactive'} 
                            size="small" 
                            color={template.isActive ? 'success' : 'default'} 
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => setShowSettingsDialog(true)}>
                          <SettingsIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => setShowBrandingDialog(true)}>
                          <BrandingIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {template.questions.length} questions • {template.estimatedTime} min
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(template.updatedAt).fromNow()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                      {template.tags.length > 3 && (
                        <Chip label={`+${template.tags.length - 3}`} size="small" />
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AssignmentIcon />}
                        onClick={() => {
                          setShowAssignmentDialog(true);
                        }}
                      >
                        Assign
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<EditIcon />}>
                        Edit
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<DownloadIcon />}>
                        Export
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Assignments Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Assessment Assignments</Typography>
              <Button
                variant="outlined"
                startIcon={<AssignmentIcon />}
                onClick={() => setShowAssignmentDialog(true)}
              >
                Assign Assessment
              </Button>
            </Box>
            
            {assignmentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {assignments.map((assignment: AssessmentAssignment) => (
                  <ListItem key={assignment.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {templates.find((t: AssessmentTemplate) => t.id === assignment.assessmentId)?.name}
                          </Typography>
                          <Chip
                            label={assignment.status}
                            size="small"
                            color={getStatusColor(assignment.status) as any}
                            icon={getStatusIcon(assignment.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Client: {clients.find((c: Client) => c.id === assignment.clientId)?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Assigned: {dayjs(assignment.assignedAt).format('MMM D, YYYY')}
                            {assignment.dueDate && ` • Due: ${dayjs(assignment.dueDate).format('MMM D, YYYY')}`}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {assignment.progress}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Progress
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="secondary">
                            {assignment.timeSpent || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Minutes
                          </Typography>
                        </Box>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {resultsLoading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : (
            results.map((result: AssessmentResult) => (
              <Grid item xs={12} md={6} key={result.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                             <Box>
                         <Typography variant="h6" sx={{ mb: 1 }}>
                           {templates.find((t: AssessmentTemplate) => t.id === result.assessmentId)?.name}
                         </Typography>
                         <Typography variant="body2" color="text.secondary">
                           Client: {clients.find((c: Client) => c.id === result.clientId)?.name}
                         </Typography>
                       </Box>
                      <Chip
                        label={result.status}
                        size="small"
                        color={result.status === 'completed' ? 'success' : 'default'}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {result.percentageScore || 0}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Score
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary">
                          {result.timeSpent}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Minutes
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="info">
                          {dayjs(result.completedAt).format('MMM D')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Completed
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<ViewIcon />}>
                        View Details
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<DownloadIcon />}>
                        Download Report
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<ShareIcon />}>
                        Share
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Create Assessment Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Assessment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assessment Name"
                placeholder="e.g., Life Satisfaction Assessment"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                placeholder="Describe the purpose and scope of this assessment..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select label="Category">
                  <MenuItem value="life-coaching">Life Coaching</MenuItem>
                  <MenuItem value="career-development">Career Development</MenuItem>
                  <MenuItem value="wellness">Wellness</MenuItem>
                  <MenuItem value="leadership">Leadership</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Time (minutes)"
                type="number"
                InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                placeholder="Enter tags separated by commas..."
                helperText="e.g., wellness, personal-development, goal-setting"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => handleCreateTemplate({})}>
            Create Assessment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={showAssignmentDialog} onClose={() => setShowAssignmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Assessment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assessment Template</InputLabel>
                <Select label="Assessment Template">
                  {templates.map((template: AssessmentTemplate) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Client</InputLabel>
                <Select label="Client">
                  {clients.map((client: Client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssignmentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => handleAssignAssessment({})}>
            Assign Assessment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onClose={() => setShowSettingsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Assessment Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Display Options</Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Allow Paging"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Show Progress Bar"
              />
              <FormControlLabel
                control={<Switch />}
                label="Allow Review"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Allow Comments"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Timing & Navigation</Typography>
              <FormControlLabel
                control={<Switch />}
                label="Enable Time Limit"
              />
              <TextField
                fullWidth
                label="Time Limit (minutes)"
                type="number"
                sx={{ mt: 2 }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Allow Resume"
              />
              <FormControlLabel
                control={<Switch />}
                label="Randomize Questions"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
          <Button variant="contained">Save Settings</Button>
        </DialogActions>
      </Dialog>

      {/* Branding Dialog */}
      <Dialog open={showBrandingDialog} onClose={() => setShowBrandingDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Assessment Branding</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Colors</Typography>
              <TextField
                fullWidth
                label="Primary Color"
                type="color"
                defaultValue="#6750A4"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Secondary Color"
                type="color"
                defaultValue="#B69DF8"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Branding Options</Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Show Coach Branding"
              />
              <TextField
                fullWidth
                label="Coach Name"
                defaultValue="Sarah Johnson"
                sx={{ mt: 2 }}
              />
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                sx={{ mt: 2 }}
              >
                Upload Logo
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBrandingDialog(false)}>Cancel</Button>
          <Button variant="contained">Save Branding</Button>
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
