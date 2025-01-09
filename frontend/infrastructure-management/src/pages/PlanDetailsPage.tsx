import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, Button, List, ListItem, ListItemText } from '@mui/material';

const planDetails = {
  free: { name: 'Free', features: ['Basic feature A', 'Basic feature B'] },
  premium: { name: 'Premium', features: ['Advanced feature A', 'Advanced feature B'] },
  enterprise: { name: 'Enterprise', features: ['Custom feature A', 'Custom feature B'] },
};

const PlanDetailsPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const plan = planDetails[planId || 'free'];

  if (!plan) {
    return <Typography variant="h4">Plan not found</Typography>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h1" gutterBottom>
        {plan.name} Plan
      </Typography>
      <List>
        {plan.features.map((feature, index) => (
          <ListItem key={index}>
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`/signup/${planId}`}
      >
        Select {plan.name} Plan
      </Button>
    </Box>
  );
};

export default PlanDetailsPage;
