import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

export const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Settings</Typography>
      <Card>
        <CardContent>
          <Typography>This is a placeholder for the settings page.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
