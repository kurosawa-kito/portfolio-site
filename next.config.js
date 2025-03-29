/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*", // 同じパスにデフォルトで戻します
      },
    ];
  },
  typescript: {
    // TypeScriptエラーを無視してビルドを続行
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLintエラーを無視してビルドを続行
    ignoreDuringBuilds: true,
  },
  swcMinify: false, // ビルドの問題が発生する場合はSWCの最適化を無効化
};

module.exports = nextConfig;
