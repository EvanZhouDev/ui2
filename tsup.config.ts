import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: {
    index: 'src/index.ts',
    'react/index': 'src/react/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  minify: !options.watch,
  external: ['react', 'react-dom'], // Mark React as external
  // For ESM, ensure .js extension for imports if needed by consumers
  // esbuildOptions(options) {
  //   options.outExtension = { '.js': '.js' }; 
  // },
}));
