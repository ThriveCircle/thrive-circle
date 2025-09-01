import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Client Details</Typography>
      <Card>
        <CardContent>
          <Typography>Client ID: {id}</Typography>
          <Typography>This is a placeholder for the client detail page.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
