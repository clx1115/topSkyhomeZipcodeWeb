/**
 * 数据分页
 * @param data 总数据
 * @param currentPage 当前页
 * @param size 分页数量
 * @returns 返回拼接后的时间字符串
 */
export function dataPage(data: any,currentPage: number,size=10) {
	const list = [] as any
  data.forEach((res: any, index: number) => {
    if (
      index < currentPage * size &&
      index >= (currentPage - 1) * size
    ) {
      list.push(res)
    }
  });
  return list
}
