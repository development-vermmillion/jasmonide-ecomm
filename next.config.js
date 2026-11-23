/** @type {import('next').NextConfig} */
module.exports = {
  experimental: { serverComponentsExternalPackages: ["@libsql/client", "libsql", "bcryptjs"] },
};
