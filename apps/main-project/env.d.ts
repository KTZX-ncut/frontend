/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@wangeditor/editor-for-vue';

declare module '*/request.js' {
  import { AxiosRequestConfig } from 'axios';

  // 自定义 Axios 实例类型，覆盖默认的返回类型
  // 让 get/post 等方法直接返回 Promise<T> 而不是 Promise<AxiosResponse<T>>
  export interface CustomAxiosInstance {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    options<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    defaults: AxiosRequestConfig;
    interceptors: {
      request: any;
      response: any;
    };
  }

  export interface RequestType {
    admin: CustomAxiosInstance;
    course: CustomAxiosInstance;
    evaluation: CustomAxiosInstance;
    page: CustomAxiosInstance;
    fork: CustomAxiosInstance;
    common: CustomAxiosInstance;
    term: CustomAxiosInstance;
    ai: CustomAxiosInstance;
    bff: CustomAxiosInstance;
  }
  
  export const host: string;
  const request: RequestType;
  export default request;
}