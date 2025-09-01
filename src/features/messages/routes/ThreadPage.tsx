import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  Paper,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Visibility as ReadIcon,
  Keyboard as TypingIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  PlayArrow as VideoIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  attachments: any[];
  isRead: boolean;
  readBy: string[];
  readAt?: string;
  isTyping: boolean;
  createdAt: string;
  editedAt?: string;
  isDeleted: boolean;
  moderationStatus: string;
  reportCount: number;
}



export const ThreadPage: React.FC = () => {
  const { id } = useParams();

  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Fetch thread details
  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ['message-thread', id],
    queryFn: async () => {
      const response = await fetch(`/api/message-threads/${id}`);
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch messages for this thread
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const response = await fetch(`/api/messages?threadId=${id}`);
      return response.json();
    },
    enabled: !!id,
    refetchInterval: 3000, // Real-time updates every 3 seconds
  });

  // Fetch typing indicators
  const { data: typingData } = useQuery({
    queryKey: ['typing', id],
    queryFn: async () => {
      const response = await fetch(`/api/typing/${id}`);
      return response.json();
    },
    enabled: !!id,
    refetchInterval: 1000, // Check typing every second
  });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      setNewMessage('');
      setSelectedFiles([]);
      setIsTyping(false);
      // Stop typing indicator
      fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-1', threadId: id, isTyping: false }),
      });
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/attachments/upload', {
        method: 'POST',
        body: JSON.stringify({
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 
                file.type === 'application/pdf' ? 'pdf' : 
                file.type.startsWith('video/') ? 'video' : 'document',
          size: file.size,
          mimeType: file.type,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-1' }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
    },
  });

  const reportMessageMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await fetch('/api/moderation/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      return response.json();
    },
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Report submitted successfully', severity: 'success' });
      setShowReportDialog(false);
      setReportReason('');
      setReportDescription('');
    },
  });

  // Handle typing indicator
  useEffect(() => {
    if (newMessage.length > 0 && !isTyping) {
      setIsTyping(true);
      fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-1', threadId: id, isTyping: true }),
      });
    } else if (newMessage.length === 0 && isTyping) {
      setIsTyping(false);
      fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-1', threadId: id, isTyping: false }),
      });
    }
  }, [newMessage, isTyping, id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    const messageData = {
      threadId: id,
      senderId: 'user-1',
      content: newMessage.trim(),
      attachments: [] as string[],
    };

    // Handle file uploads
    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        try {
          const attachment = await uploadAttachmentMutation.mutateAsync(file);
          messageData.attachments.push(attachment.id);
        } catch (error) {
          console.error('Failed to upload attachment:', error);
        }
      }
    }

    sendMessageMutation.mutate(messageData);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleReportMessage = () => {
    if (selectedMessage && reportReason) {
      reportMessageMutation.mutate({
        messageId: selectedMessage.id,
        threadId: id,
        reporterId: 'user-1',
        reason: reportReason,
        description: reportDescription,
      });
    }
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon />;
      case 'pdf': return <PdfIcon />;
      case 'video': return <VideoIcon />;
      default: return <DocumentIcon />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (threadLoading || messagesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const messages = messagesData?.data || [];
  const typingUsers = typingData?.filter((t: any) => t.isTyping && t.userId !== 'user-1') || [];

  return (
    <Box>
      {/* Thread Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" sx={{ mb: 1 }}>
                {thread?.subject}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label={thread?.retentionPolicy} size="small" color="secondary" />
                {thread?.isMuted && <Chip label="Muted" size="small" color="warning" />}
                {thread?.isArchived && <Chip label="Archived" size="small" color="default" />}
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                fetch('/api/messages/export', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ threadId: id }),
                });
                setSnackbar({ open: true, message: 'Export started successfully', severity: 'success' });
              }}
            >
              Export to PDF
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card sx={{ mb: 3, height: '60vh', overflow: 'auto' }}>
        <CardContent>
          <List>
            {messages.map((message: Message) => (
              <ListItem
                key={message.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: message.senderId === 'user-1' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                    {message.senderId === 'user-1' ? 'U' : 'C'}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(message.createdAt).format('MMM D, h:mm A')}
                  </Typography>
                  {message.isRead && (
                    <Tooltip title="Read">
                      <ReadIcon fontSize="small" color="success" sx={{ ml: 1 }} />
                    </Tooltip>
                  )}
                  {message.editedAt && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      (edited)
                    </Typography>
                  )}
                </Box>

                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: message.senderId === 'user-1' ? 'primary.main' : 'grey.100',
                    color: message.senderId === 'user-1' ? 'white' : 'text.primary',
                    position: 'relative',
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                  
                  {/* Attachments */}
                  {message.attachments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {message.attachments.map((attachment: any) => (
                        <Paper
                          key={attachment.id}
                          sx={{
                            p: 1,
                            mt: 1,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {getAttachmentIcon(attachment.type)}
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {attachment.name}
                          </Typography>
                          <Typography variant="caption">
                            {formatFileSize(attachment.size)}
                          </Typography>
                          {attachment.virusScanStatus === 'pending' && (
                            <CircularProgress size={16} />
                          )}
                          {attachment.virusScanStatus === 'clean' && (
                            <Chip label="Safe" size="small" color="success" />
                          )}
                          {attachment.virusScanStatus === 'infected' && (
                            <Chip label="Infected" size="small" color="error" />
                          )}
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {/* Message Actions */}
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setSelectedMessage(message);
                        setAnchorEl(e.currentTarget);
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              </ListItem>
            ))}
            
            {/* Typing Indicators */}
            {typingUsers.map((typing: any) => (
              <ListItem key={typing.userId} sx={{ justifyContent: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24 }}>C</Avatar>
                  <Paper sx={{ p: 1, backgroundColor: 'grey.100' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TypingIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Coach is typing...
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </ListItem>
            ))}
            
            <div ref={messagesEndRef} />
          </List>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
        <CardContent>
          {/* File Attachments Preview */}
          {selectedFiles.length > 0 && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Selected Files:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={`${file.name} (${formatFileSize(file.size)})`}
                    onDelete={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <input
              type="file"
              multiple
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt,.mp4,.mov"
            />
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              color="primary"
              sx={{ mb: 1 }}
            >
              <AttachFileIcon />
            </IconButton>
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && selectedFiles.length === 0}
              sx={{ mb: 1 }}
            >
              <SendIcon />
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Message Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          if (selectedMessage) {
            markAsReadMutation.mutate(selectedMessage.id);
          }
          setAnchorEl(null);
        }}>
          Mark as Read
        </MenuItem>
        <MenuItem onClick={() => {
          setShowReportDialog(true);
          setAnchorEl(null);
        }}>
          Report Message
        </MenuItem>
      </Menu>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onClose={() => setShowReportDialog(false)}>
        <DialogTitle>Report Message</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Reason</InputLabel>
            <Select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              label="Reason"
            >
              <MenuItem value="spam">Spam</MenuItem>
              <MenuItem value="inappropriate">Inappropriate Content</MenuItem>
              <MenuItem value="harassment">Harassment</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Description (optional)"
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReportMessage}
            variant="contained"
            disabled={!reportReason}
          >
            Submit Report
          </Button>
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
