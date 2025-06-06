import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";
/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    API_KEY: "fe56c0cf0d804e83ddbbce365e1c2353",
    API_SECRET_KEY: "2d0ba24b5141f43dca919eca02878a2a",
    HOST: "da2b-2409-40c4-1176-86b5-d99e-4843-95eb-73d2.ngrok-free.app",
    SCOPES: "read_products,write_products,read_themes",
  },
};
async function setup() {
  if (process.env.NODE_ENV === "development") {
    await setupDevPlatform();
  }
}

setup();

export default nextConfig;
