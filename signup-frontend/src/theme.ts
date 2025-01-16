import { createTheme } from '@mui/material/styles';

const swissTheme = createTheme({
  typography: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    h1: { fontSize: '3rem', fontWeight: 700, textTransform: 'uppercase' },
    h2: { fontSize: '2rem', fontWeight: 600, textTransform: 'uppercase' },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
  },
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          backgroundColor: '#555555',
          '&:hover': {
            backgroundColor: '#555555',
          },
        },
      },
    },
  },
  spacing: 8,
});

export default swissTheme;
