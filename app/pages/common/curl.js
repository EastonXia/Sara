import md5 from "md5";
import { ElMessage } from "element-plus";

/**
 * 前段封装的 curl 方法
 * @param {*} options 请求参数
 */
const curl = ({
  url, // 请求地址
  method = 'post', // 请求方法
  headers = {}, // 请求头
  query = {}, // url query
  data = {}, // post body
  reposeType = 'json', // response data type 
  timeout = 60 * 1000, // timeout
  errorMessages = '网络异常'
}) => {
  // 接口签名处理（让接口变动态）
  const signKey = 'fjoq23uj90JW0J039JFWJ3J3J032JFVXER';
  const st = Date.now();

  const dtoHeaders = {
    ...headers,
    s_sign: md5(`${signKey}_${st}`),
    s_t: st,
  }

  if(url.indexOf('/api/proj/') > -1 && window.projKey) {
    dtoHeaders.proj_key = window.projKey
  }

  // 构造请求参数 (把参数转换为 axios 参数)
  const ajaxSetting = {
    url,
    method,
    params: query, 
    data, 
    reposeType, 
    timeout: 60 * 1000, 
    headers: dtoHeaders
  }

  return axios.request(ajaxSetting).then((response) => {
    const resData = response.data || {};

    // 后端 api 返回格式
    const { success } = resData;

    // 失败
    if(!success) {
      const { code, message } = resData;

      if(code === 442) {
        ElMessage.error('请求参数异常')
      } else if(code === 445) {
        ElMessage.error('请求不合法') // 不要暴露 ‘签名’ 之类的敏感信息
      } else if(code === 446) {
        ElMessage.error('请求缺少必要参数')
      } else if(code === 50000) {
        ElMessage.error(message)
      } else {
        ElMessage.error(errorMessage)
      }

      console.error(message);
      return Promise.resolve({ success, code, message })
    }

    // 成功
    const { data, metadata } = resData;
    return Promise.resolve({ success, data, metadata })

  }).catch((error) => {
    const { message } = error;

    if(message.match(/timeout/)) {
      return Promise.resolve({
        message: 'Request Timeout',
        code: 504
      })
    } 

    return Promise.resolve(error);
  })
}

export default curl;