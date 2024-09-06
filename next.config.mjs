/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    publicRuntimeConfig: {
      PLAID_ENV: process.env.PLAID_ENV,
    },
  }
  
  module.exports = nextConfig