import type { Config } from 'tailwindcss';

// Este ficheiro é essencial para configurar o Tailwind CSS.
// O array 'content' diz ao compilador onde procurar classes do Tailwind.
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Adicione aqui qualquer tema personalizado, se necessário (cores, fontes, etc.)
      colors: {
        'indigo-600': '#4f46e5',
        'indigo-700': '#4338ca',
      }
    },
  },
  plugins: [],
};

export default config;