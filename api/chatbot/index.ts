/**
   * 
   * 获取最新活动
   */
export function getList(data?: any) {
  return useClientRequest.post("/chat/topsky/list", data)
}

/**
   * 
   * 检查认证
   */
export function checkAuth(data?: any) {
  return useClientRequest.get("https://ai.dev.topskyhome.com/auth/status", data)
}
/**
   * 
   * 创建新会话
   */
export function getNewSession(data?: any) {
  return useClientRequest.post("/chat/topsky/session/new", data)
}
/**
   * 
   * 获取最新活动
   */
export function getChat(data?: any) {
  return useClientRequest.post("/chat/topsky/chat", data)
}