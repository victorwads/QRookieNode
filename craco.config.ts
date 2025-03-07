import { resolve } from 'path';

export default {
  webpack: {
    alias: {
      '@react': resolve(__dirname, 'src/react'),
      '@pages': resolve(__dirname, 'src/react/pages'),
      '@bridge': resolve(__dirname, 'src/react/bridge'),
      '@components': resolve(__dirname, 'src/react/components'),
      '@server': resolve(__dirname, 'src/server'),
      '@comands': resolve(__dirname, 'src/server/comands'),
      '@main': resolve(__dirname, 'src/server/main'),
    },
  },
};