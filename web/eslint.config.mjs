import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      "artifacts/**",
      "legacy-vite/**",
      "node_modules/**",
      "scripts/**",
      ".playwright/**",
      "test-results/**"
    ]
  },
  ...nextVitals,
  {
    rules: {
      "@next/next/no-img-element": "off"
    }
  }
];

export default config;
