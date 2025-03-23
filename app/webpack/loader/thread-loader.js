const os = require('os')

/**
 * 获取一个已配置好的 thread-loader
 * @param {*} name 
 * @param {*} options 
 * @returns 
 */
const getThreaLoader = (name, options = {}) => {
  if(!name) {
    return 'thread-loader'
  }

  return {
    loader: require.resolve('thread-loader'),
    options: {
      name,

      // worker 的数量，默认是 cpu 核心数
      workers: os.cpus().length,
      // 一个 worker 并行的 job 数量，默认为 20
      workerParallelJobs: 50,
      // 添加额外的 node js 参数
      workerNodeArgs: ['--max-old-space-size=1024'],
      // 允许重新生成一个 dead work pool
      // 这个过程会降低整体编译速度
      // 开发环境应该设置为false
      poolRespawn: false,
      //空闲多少秒后，干掉 work 进程
      // 默认是 500 ms
      // 当处于监听模式下，可以设置为无限大，让worker一直存在
      poolTimeout: 3000,
      // pool 分配给 workder 的 job 数量
      // 默认是 200
      // 设置的越低效率会更低，但是 job 分布会更均匀
      poolParallelJobs: 50,
      ...options,
    },
  }
}

module.exports = getThreaLoader;