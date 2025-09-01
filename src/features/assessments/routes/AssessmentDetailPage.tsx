import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';

export const AssessmentDetailPage: React.FC = () => {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Assessment Details</Typography>
      <Card>
        <CardContent>
          <Typography>Assessment ID: {id}</Typography>
          <Typography>This is a placeholder for the assessment detail page.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
