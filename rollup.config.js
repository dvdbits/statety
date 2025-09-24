import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.cjs', format: 'cjs', sourcemap: true, exports: 'named' },
    { file: 'dist/index.esm.js', format: 'esm', sourcemap: true, exports: 'named' },
  ],
  external: ['react', 'react-dom'],
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationMap: true,
        },
      },
    }),
  ],
};
