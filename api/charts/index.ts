/**
   * 
   * 获取所有城市列表
   */
export function getZipcodeCitiesList(data?: any) {
  return useClientRequestDirect.get("/charts/zipcode/cities", data)
}
/**
   * 
   * 获取所有Metro列表
   */
export function getZipcodeMetrosList(data?: any) {
  return useClientRequestDirect.get("/charts/zipcode/metros", data)
}

/**
   * 
   * 获取所有Zipcode列表
   */
export function getZipcodeList(data?: any) {
  return useClientRequestDirect.get("/charts/zipcode/zipcode", data)
}
/**
   * 
   * 计算房价增长率排行
   */
export function growthRate(data?: any) {
  return useClientRequestDirect.post("/charts/zipcode/growth-rate", data)
}
/**
   * 
   * 综合排行查询
   */
export function zipcodeRank(data?: any) {
  return useClientRequestDirect.post("/charts/zipcode/rank", data)
}