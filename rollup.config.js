import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import del from 'rollup-plugin-delete'
import json from "@rollup/plugin-json"


const config = {
  input: ["src/index.js"],
  output: {
    esModule: true,
    dir: "dist",
    format: "es",
    sourcemap: true
  },
  plugins: [json(), commonjs(), nodeResolve({ preferBuiltins: true }), del({ targets: 'dist' })],
};

export default config;
