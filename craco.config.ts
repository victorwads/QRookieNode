import { resolve } from "path";

export default {
  eslint: {
    enable: false,
  },
  devServer: {
    client: {
      overlay: false,
    },
  },
  webpack: {
    alias: {
      "@react": resolve(__dirname, "src/react"),
      "@pages": resolve(__dirname, "src/react/pages"),
      "@bridge": resolve(__dirname, "src/react/bridge"),
      "@components": resolve(__dirname, "src/react/components"),
      "@server": resolve(__dirname, "src/server"),
      "@commands": resolve(__dirname, "src/server/commands"),
      "@main": resolve(__dirname, "src/server/main"),
    },
  },
};
