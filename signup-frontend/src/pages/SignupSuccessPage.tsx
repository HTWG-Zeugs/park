import { Typography, Box } from '@mui/material';

const SignupSuccessPage = () => {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h1" gutterBottom>
        You Signed Up Successfully!
      </Typography>
      <Typography variant="body1" gutterBottom>
        We're configuring everything for you. Your application will be ready to use in a few minutes.
      </Typography>
    </Box>
  );
};

export default SignupSuccessPage;
