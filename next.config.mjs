import { execSync } from 'child_process';

/** @type {import('next').NextConfig} */
// 为了保持版本号连续性 (从 211 开始)，我们设置 an 初始偏置值
const BASE_VERSION_OFFSET = 331; 

let commitCount = 0;
try {
  const countStr = execSync('git rev-list --count HEAD').toString().trim();
  commitCount = parseInt(countStr, 10);
} catch (e) {
  console.warn('Could not fetch git commit count, defaulting to 0');
  commitCount = 0;
}

const finalPatch = BASE_VERSION_OFFSET + commitCount;

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['liveline'],
  env: {
    NEXT_PUBLIC_APP_VERSION: `0.0.0.${finalPatch}`,
  },
};

export default nextConfig;
