/**
   * 
   *  ZipCpde相关： 获取所有城市列表
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



/**
   * 
   * MSA所有相关： 获取所有大都会区记录
   */
export function getMsaMetrosList(data?: any) {
  return useClientRequestDirect.get("/charts/msa/metros", data)
}


/**
   * 
   * MSA 平均房价指数排行
   */
export function getMsaHomeValueRank(data?: any) {
  return useClientRequestDirect.post("/charts/msa/home-value", data)
}

/**
   * 
   * MSA 人口增长率排行
   */
export function getMsaPopulationGrowthRank(data?: any) {
  return useClientRequestDirect.post("/charts/msa/population-growth", data)
}

/**
   * 
   * MSA 售租比排行
   */
export function getMsaRentToValueRank(data?: any) {
  return useClientRequestDirect.post("/charts/msa/rent-to-value", data)
}

/**
   * 
   * MSA 房价增长率排行
   */
export function getMsaHomeValueGrowthRank(data?: any) {
  return useClientRequestDirect.post("/charts/msa/growth-rate", data)
}



/**
   * 
   * MSA 增长趋势数据
   */
export function getRrowthTrend(data?: any) {
  return useClientRequestDirect.post("/charts/msa/growth-trend", data)
}


/**
   * 
   * MSA 迁移净增长趋势数据
   */
export function getNetMigrationTrend(data?: any) {
  return useClientRequestDirect.post("/charts/msa/net-migration-trend", data)
}

/**
   * 
   * MSA 人口密度数据
   */
export function getPopulationDensity(data?: any) {
  return useClientRequestDirect.post("/charts/msa/population-density", data)
}

/**
   * 
   * MSA 种族人口结构数据
   */
export function getRaceDemographics(data?: any) {
  return useClientRequestDirect.post("/charts/msa/race-demographics", data)
}


/**
   * 
   * 获取所有种族分类
   */
export function getRaces(data?: any) {
  return useClientRequestDirect.get("/charts/msa/races", data)
}

/**
   * 
   * 全美种族人口结构数据
   */
export function getNationalRaceDemographics(data?: any) {
  return useClientRequestDirect.post("/charts/msa/national-race-demographics", data)
}

/**
   * 
   * MSA 年龄结构数据
   */
export function getAgeDemographics(data?: any) {
  return useClientRequestDirect.post("/charts/msa/age-demographics", data)
}


/**
   * 
   * 获取所有年龄段分类
   */
export function getAgeGroups(data?: any) {
  return useClientRequestDirect.get("/charts/msa/age-groups", data)
}


/**
   * 
   * 全美年龄结构汇总数据
   */
export function getNationalAgeDemographics(data?: any) {
  return useClientRequestDirect.post("/charts/msa/national-age-demographics", data)
}



