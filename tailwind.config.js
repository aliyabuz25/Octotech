/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        accent: {
          primary: '#00f2ff',
          secondary: '#7000ff',
        },
      },
    },
  },
};
