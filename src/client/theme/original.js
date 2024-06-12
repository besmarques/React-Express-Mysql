import { createTheme, ThemeProvider } from '@mui/material/styles';
import CustomButton from '../components/Button';    

// Create a custom theme
const Original = createTheme({
    palette: {
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: '#red',
        },
        background: {
            default: '#fff',
        },
        red: {
            main: '#f00',
        },
    },
    typography: {
        fontFamily: 'Arial',
        h1: {
            fontSize: '2.5rem',
        },
        h2: {
            fontSize: '2rem',
        },
    },
    spacing: 8,
    overrides: {
        MuiButton: {
            root: {
                fontSize: '1rem',
            },
        },
    },
});

export default Original