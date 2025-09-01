import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';

export const ProgramDetailPage: React.FC = () => {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Program Details</Typography>
      <Card>
        <CardContent>
          <Typography>Program ID: {id}</Typography>
          <Typography>This is a placeholder for the program detail page.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
