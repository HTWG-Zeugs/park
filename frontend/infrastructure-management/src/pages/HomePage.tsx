import React from 'react';
import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const plans = [
  { id: 'free', name: 'Free', description: 'Basic features for personal use.' },
  { id: 'premium', name: 'Premium', description: 'Advanced features for professionals.' },
  { id: 'enterprise', name: 'Enterprise', description: 'Custom solutions for businesses.' },
];

const HomePage = () => {
  return (
    <Box sx={{ p: 4, backgroundColor: 'background.default' }}>
      <Typography variant="h1" align="center" gutterBottom color="text.primary">
        Select Your Plan
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid #000',
                backgroundColor: 'background.paper',
              }}
            >
              <CardContent>
                <Typography variant="h2" gutterBottom color="text.primary">
                  {plan.name}
                </Typography>
                <Typography variant="body1" gutterBottom color="text.primary">
                  {plan.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/plan/${plan.id}`}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HomePage;
