import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';

export const CoachDetailPage: React.FC = () => {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Coach Details</Typography>
      <Card>
        <CardContent>
          <Typography>Coach ID: {id}</Typography>
          <Typography>This is a placeholder for the coach detail page.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
