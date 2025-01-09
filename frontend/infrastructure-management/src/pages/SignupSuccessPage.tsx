import { Typography, Box, CircularProgress } from '@mui/material';

const SignupSuccessPage = () => {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h1" gutterBottom>
        You Signed Up Successfully!
      </Typography>
      <Typography variant="body1" gutterBottom>
        We're configuring everything for you. You'll receive an email when everything is ready.
      </Typography>
      <CircularProgress sx={{ mt: 4 }} />
    </Box>
  );
};

export default SignupSuccessPage;
