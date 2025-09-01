import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

export const ReportsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Reports</Typography>
      <Card>
        <CardContent>
          <Typography>This is a placeholder for the reports page.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
