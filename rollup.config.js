import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import del from 'rollup-plugin-delete'

const config = {
  input: ["src/index.js", "src/devbox.js"],
  output: {
    esModule: true,
    dir: "dist",
    format: "es",
    sourcemap: true
  },
  plugins: [commonjs(), nodeResolve({ preferBuiltins: true }), del({ targets: 'dist' })],
};

export default config;
