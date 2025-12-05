/** @type {import('next').NextConfig} */
const nextConfig = {
  // Esta configuração pode ajudar o Vercel a resolver problemas de compilação do Prisma
  // forçando o Webpack a não empacotar o Prisma como um módulo externo.
  webpack: (config) => {
    config.externals.push({
      'prisma': 'commonjs prisma',
      '@prisma/client': 'commonjs @prisma/client',
    });
    return config;
  },
};

module.exports = nextConfig;