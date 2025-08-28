import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    tailwindcss('./tailwind.config.js'), // Ensure this path is correct
    autoprefixer,
  ],
}
