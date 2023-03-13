const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  content: ['./src/**/*.[j|t]s[x]'],
  theme: {
    extend: {
      colors: {
        primary: '#DE7136',
        'primary-dark': '#D36B33',
        secondary: '#503C33',
        tertiary: '#805C4C',
        'tertiary-dark': '#604539',
        light: '#F9F1E1',
        white: '#FAFAFA',
        disabled: '#C4C4C4',
        success: '#4B9B4F',
        'success-dark': '#47934B',
        error: '#BB4040',
        'error-dark': '#B23D3D'
      },
      fontWeight: ['hover', 'focus'],
      fontFamily: {
        sans: ['Mitr', ...defaultTheme.fontFamily.sans]
      }
    }
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
    require('tailwindcss-debug-screens')
  ]
}
