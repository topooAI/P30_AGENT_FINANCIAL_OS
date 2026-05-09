/**
 * 自动化版本管理
 * 该版本号由 next.config.mjs 在构建时根据 Git Commit 计数自动注入。
 * 手动修改此文件无效。
 */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0.unknown";
export const getFullVersionDisplay = () => `v${APP_VERSION}`;
