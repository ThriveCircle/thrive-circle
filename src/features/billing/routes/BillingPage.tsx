import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

export const BillingPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Billing</Typography>
      <Card>
        <CardContent>
          <Typography>This is a placeholder for the billing page.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
