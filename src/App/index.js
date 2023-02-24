import ReactDOM from 'react-dom';

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

import App from './App';
import { getCategoryGroup, getCategoryPalette } from '../Common/Constants';

const theme = createMuiTheme({
    getCategoryPalette: (category) => getCategoryPalette(getCategoryGroup(category)),

    getRiskPalette: (risk) => {
        switch (risk) {
            case 'probable': return {
                main: '#e00020',
                text: '#FFFFFF',
            }

            case 'possible': return {
                main: '#FFA847',
                text: '#FFFFFF',
            }

            default: return {
                main: '#17AF9B',
                text: '#FFFFFF',
            }
        }
    },

    getItemWidths(wide=false) {
        return (wide
            ? { xs: 12 }
            : { xs: 12, sm: 6, md: 6, lg: 4, xl: 3 });
    },

    mixins: {
        toolbar: {
            minHeight: 64,
           '@media (min-width:0px) and (orientation: landscape)': {
               minHeight: 54,
           },
            '@media (min-width:600px)': {
                minHeight: 64,
            },
        },
    },

    overrides: {
        MuiButton: {
            root: {
                fontSize: '1.6rem',
            },
        },
        MuiFormHelperText: {
            root: {
                fontSize: '1.4rem',
            },
        },
        MuiFormLabel: {
            root: {
                color: '#000000',
                fontSize: '1.9rem',
            }
        },
        MuiInputBase: {
            root: {
                fontSize: '1.9rem',
            }
        },
    },

    palette: {
        background: {
            paper: '#FFFFFF',
            default: '#414141',
        },
        // Blue
        primary: {
            light: '#EAF0FF',
            dark: '#1D2948',
            main: '#729BFF',
            contrastText: '#FFFFFF',
        },
        // Gray
        secondary: {
            light: '#EEEFF0',
            main: '#808080',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#E00020',
            contrastText: '#FFFFFF',
        },
        success: {
            light: '#E8FAF6',
            main: '#17AF9B',
            contrastText: '#FFFFFF',
        },
        text: {
            contrastText: '#FFFFFF',
            primary: '#000000',
        },
    },

    typography: {
        fontFamily: [
            'Lato',
            '"Helvetica Neue"',
            'sans-serif',
        ].join(','),
        fontSize: 10,
        fontWeight: 300,
        caption: {
            fontSize: '1.4rem',
            fontWeight: 300,
        },
        body1: {
            fontSize: '1.6rem',
            fontWeight: 300,
        },
        body2: {
            fontSize: '1.6rem',
            fontWeight: 300,
        },
        button: {
            fontSize: '2.6rem',
            fontWeight: 300,
        },
        h1: {
            fontSize: '9.0rem',
            fontWeight: 300,
        },
        h2: {
            fontSize: '6.4rem',
            fontWeight: 300,
        },
        h3: {
            fontSize: '4.5rem',
            fontWeight: 300,
        },
        h4: {
            fontSize: '3.2rem',
            fontWeight: 300,
        },
        h5: {
            fontSize: '2.6rem',
            fontWeight: 300,
        },
        h6: {
            color: '#729BFF',
            fontSize: '2.4rem',
            fontWeight: 300,
            fontVariant: 'small-caps',
            textTransform: 'lowercase',
        },
        h7: {
            fontSize: '2rem',
            fontWeight: 300,
        },
        htmlFontSize: 10,
        title: {
            fontSize: '7.2rem',
            fontWeight: 300,
        },
    }
});

ReactDOM.render(
    <ThemeProvider theme={theme}><App /></ThemeProvider>,
    document.getElementById('root'));
