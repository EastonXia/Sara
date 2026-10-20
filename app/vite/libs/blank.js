// 业务扩展文件不存在时的空模块。
// 必须是 ESM：Vite/Rollup 处理应用源码时不做 CJS 互操作，
// 业务侧 `import X from '$businessXxx'` 需要 default 导出。
export default {};
