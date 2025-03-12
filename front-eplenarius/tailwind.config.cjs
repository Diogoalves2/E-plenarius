/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'raleway': ['Raleway', 'sans-serif'],
        'rubik': ['Rubik', 'sans-serif'],
        'title': ['Raleway', 'sans-serif'],
        'body': ['Rubik', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#FFF2E5',
          100: '#FFE5CC',
          200: '#FFCB99',
          300: '#FFB166',
          400: '#FF9733',
          500: '#FF6500', // Cor principal
          600: '#CC5200',
          700: '#993D00',
          800: '#662900',
          900: '#331400',
        },
        secondary: {
          50: '#E6EDF5',
          100: '#CCDAEB',
          200: '#99B6D7',
          300: '#6691C3',
          400: '#336DAF',
          500: '#1E3E62', // Cor principal
          600: '#18324F',
          700: '#12253B',
          800: '#0C1928',
          900: '#060C14',
        },
        dark: {
          50: '#E6E8EB',
          100: '#CCD1D6',
          200: '#99A3AE',
          300: '#667585',
          400: '#33475D',
          500: '#0B192C', // Cor principal
          600: '#091423',
          700: '#070F1B',
          800: '#040A12',
          900: '#020509',
        },
        success: {
          50: '#E6F7EC',
          100: '#CCEFDA',
          200: '#99DFB5',
          300: '#66CF90',
          400: '#33BF6A',
          500: '#00AF45', // Cor principal
          600: '#008C37',
          700: '#006929',
          800: '#00461C',
          900: '#00230E',
        },
        error: {
          50: '#FDEAEA',
          100: '#FBD5D5',
          200: '#F7ABAB',
          300: '#F38181',
          400: '#EF5757',
          500: '#EB2D2D', // Cor principal
          600: '#BC2424',
          700: '#8D1B1B',
          800: '#5E1212',
          900: '#2F0909',
        },
        warning: {
          50: '#FFF8E6',
          100: '#FFF1CC',
          200: '#FFE399',
          300: '#FFD566',
          400: '#FFC733',
          500: '#FFB900', // Cor principal
          600: '#CC9400',
          700: '#996F00',
          800: '#664A00',
          900: '#332500',
        },
        black: '#000000',
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
} 