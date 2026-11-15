import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // «standalone» genera un servidor mínimo con solo las dependencias necesarias (imagen de Docker liviana)
  output: "standalone",
};

export default nextConfig;
