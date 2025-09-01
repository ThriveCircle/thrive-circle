import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6750A4',
      light: '#B69DF8',
      dark: '#4F378B',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#B69DF8',
      light: '#D0BCFF',
      dark: '#938F99',
      contrastText: '#1C1B1F',
    },
    background: {
      default: 'linear-gradient(135deg, #F7F2FF 0%, #E7E0EC 100%)',
      paper: '#FFFBFE',
    },
    text: {
      primary: '#1C1B1F',
      secondary: '#49454F',
    },

  },
  typography: {
    fontFamily: 'Avenir, "Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'linear-gradient(135deg, #FFFBFE 0%, #F7F2FF 100%)',
          boxShadow: '0 4px 6px -1px rgba(103, 80, 164, 0.1), 0 2px 4px -1px rgba(103, 80, 164, 0.06)',
          border: '1px solid #E7E0EC',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #6750A4 0%, #8B5CF6 50%, #A855F7 100%)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #2D1B69 0%, #4C1D95 50%, #7C3AED 100%)',
          borderRight: '1px solid #8B5CF6',
          width: 280,
          boxShadow: '4px 0 20px rgba(124, 58, 237, 0.3)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(139, 92, 246, 0.2) 100%)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(139, 92, 246, 0.4) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(139, 92, 246, 0.5) 100%)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 600,
        },
      },
    },
  },
});
