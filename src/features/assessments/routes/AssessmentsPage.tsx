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
import { useRightDrawer } from '../../../app/providers/RightDrawerProvider';

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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const queryClient = useQueryClient();
  const { openDrawer, closeDrawer } = useRightDrawer();

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
      closeDrawer();
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
      closeDrawer();
    },
  });

  const handleCreateTemplate = (templateData: any) => {
    createTemplateMutation.mutate({
      ...templateData,
      createdBy: 'coach-1', // Mock coach ID
    });
  };

  // Drawer Forms as React Components (to satisfy hooks rules)
  const AssignmentForm: React.FC = () => {
    const templates = templatesData?.data || [];
    const clients = clientsData?.data || [];
    const [templateId, setTemplateId] = useState('');
    const [clientId, setClientId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const isDisabled = !templateId || !clientId || assignAssessmentMutation.isPending;
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Assign Assessment</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Assessment Template</InputLabel>
              <Select label="Assessment Template" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                {templates.map((template: AssessmentTemplate) => (
                  <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Client</InputLabel>
              <Select label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                {clients.map((client: Client) => (
                  <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
          <Button onClick={closeDrawer}>Cancel</Button>
          <Button
            variant="contained"
            disabled={isDisabled}
            onClick={() => handleAssignAssessment({ assessmentId: templateId, clientId, coachId: 'coach-1', dueDate })}
          >
            Assign Assessment
          </Button>
        </Box>
      </Box>
    );
  };

  const SettingsForm: React.FC = () => {
    const [allowPaging, setAllowPaging] = useState(true);
    const [showProgressBar, setShowProgressBar] = useState(true);
    const [allowReview, setAllowReview] = useState(false);
    const [allowComments, setAllowComments] = useState(true);
    const [enableTimeLimit, setEnableTimeLimit] = useState(false);
    const [timeLimit, setTimeLimit] = useState<number | ''>('');
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Assessment Settings</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Display Options</Typography>
            <FormControlLabel control={<Switch checked={allowPaging} onChange={(_, v) => setAllowPaging(v)} />} label="Allow Paging" />
            <FormControlLabel control={<Switch checked={showProgressBar} onChange={(_, v) => setShowProgressBar(v)} />} label="Show Progress Bar" />
            <FormControlLabel control={<Switch checked={allowReview} onChange={(_, v) => setAllowReview(v)} />} label="Allow Review" />
            <FormControlLabel control={<Switch checked={allowComments} onChange={(_, v) => setAllowComments(v)} />} label="Allow Comments" />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Timing & Navigation</Typography>
            <FormControlLabel control={<Switch checked={enableTimeLimit} onChange={(_, v) => setEnableTimeLimit(v)} />} label="Enable Time Limit" />
            <TextField fullWidth label="Time Limit (minutes)" type="number" value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value) || '')} sx={{ mt: 2 }} />
            <FormControlLabel control={<Switch defaultChecked />} label="Allow Resume" />
            <FormControlLabel control={<Switch />} label="Randomize Questions" />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
          <Button onClick={closeDrawer}>Cancel</Button>
          <Button variant="contained" onClick={closeDrawer}>Save Settings</Button>
        </Box>
      </Box>
    );
  };

  const BrandingForm: React.FC = () => {
    const [primaryColor, setPrimaryColor] = useState('#6750A4');
    const [secondaryColor, setSecondaryColor] = useState('#B69DF8');
    const [showCoachBranding, setShowCoachBranding] = useState(true);
    const [coachName, setCoachName] = useState('Sarah Johnson');
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Assessment Branding</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Colors</Typography>
            <TextField fullWidth label="Primary Color" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Secondary Color" type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Branding Options</Typography>
            <FormControlLabel control={<Switch checked={showCoachBranding} onChange={(_, v) => setShowCoachBranding(v)} />} label="Show Coach Branding" />
            <TextField fullWidth label="Coach Name" value={coachName} onChange={(e) => setCoachName(e.target.value)} sx={{ mt: 2 }} />
            <Button variant="outlined" startIcon={<UploadIcon />} sx={{ mt: 2 }}>Upload Logo</Button>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
          <Button onClick={closeDrawer}>Cancel</Button>
          <Button variant="contained" onClick={closeDrawer}>Save Branding</Button>
        </Box>
      </Box>
    );
  };

  const openCreateAssessmentDrawer = () => {
    const CreateForm = () => {
      const [name, setName] = useState('');
      const [description, setDescription] = useState('');
      const [category, setCategory] = useState('Life Coaching');
      const [estimatedTime, setEstimatedTime] = useState<number>(20);
      const [tags, setTags] = useState('');
      const isDisabled = !name || createTemplateMutation.isPending;
      return (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Create New Assessment</Typography>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Assessment Name" value={name} onChange={(e) => setName(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value as string)}>
                  <MenuItem value="Life Coaching">Life Coaching</MenuItem>
                  <MenuItem value="Career Development">Career Development</MenuItem>
                  <MenuItem value="Wellness">Wellness</MenuItem>
                  <MenuItem value="Leadership">Leadership</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Estimated Time (minutes)" type="number" value={estimatedTime} onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)} InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Tags" placeholder="comma,separated,tags" value={tags} onChange={(e) => setTags(e.target.value)} />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button onClick={closeDrawer}>Cancel</Button>
            <Button
              variant="contained"
              disabled={isDisabled}
              onClick={() => handleCreateTemplate({
                name,
                description,
                category,
                estimatedTime,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                isActive: true,
                questions: [],
                settings: { allowPaging: true, questionsPerPage: 1, allowTiming: false, allowResume: true, allowRandomization: false, showProgressBar: true, allowReview: true, allowComments: true, requireCompletion: true },
                branding: { primaryColor: '#6750A4', secondaryColor: '#B69DF8', showCoachBranding: true, coachName: 'Sarah Johnson' },
              })}
            >
              Create Assessment
            </Button>
          </Box>
        </Box>
      );
    };
    openDrawer(<CreateForm />, { title: 'Create New Assessment', width: 560 });
  };

  const handleAssignAssessment = (assignmentData: any) => {
    assignAssessmentMutation.mutate(assignmentData);
  };

  const openAssignmentDrawer = () => {
    openDrawer(<AssignmentForm />, { title: 'Assign Assessment', width: 480 });
  };

  const openSettingsDrawer = () => {
    openDrawer(<SettingsForm />, { title: 'Assessment Settings', width: 560 });
  };

  const openBrandingDrawer = () => {
    openDrawer(<BrandingForm />, { title: 'Assessment Branding', width: 560 });
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
          onClick={openCreateAssessmentDrawer}
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
                        <IconButton size="small" onClick={openSettingsDrawer}>
                          <SettingsIcon />
                        </IconButton>
                        <IconButton size="small" onClick={openBrandingDrawer}>
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
                        onClick={openAssignmentDrawer}
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
                onClick={() => { /* TODO: open assignment drawer next */ }}
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
