import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

export const SessionsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Sessions</Typography>
      <Card>
        <CardContent>
          <Typography>This is a placeholder for the sessions page.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
