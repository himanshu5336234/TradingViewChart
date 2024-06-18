import 'https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.4/axios.min.js'
import { getBaseURL } from './baseUrl.js';
const base_url = getBaseURL().densityBaseUrl;

const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

const token  = params.token

const axiosInstance = axios.create({
    baseURL: base_url,
    withCredentials: false,
    headers: {
      token
    }
  });

  
axiosInstance.defaults.headers.common.accept = "*/*";
axiosInstance.defaults.headers.common.rid = "anti-csrf";



const axiosApiWithServer = async({url,method, body=null, headers = null,isMultiPartData = false})=>{
  const requestBody = isMultiPartData === true ? body : JSON.parse(body);;
  return axiosInstance[method](url, requestBody, {headers})

}

export default axiosApiWithServer


