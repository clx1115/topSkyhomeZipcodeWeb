/** 格式化金额**/
export function toThousands(num: number): string {
  let result: string = '',
    counter: number = 0;
  const dotIndex: number = String(num).indexOf('.');

  if (dotIndex !== -1) {
    const dotCnt: string = String(num).substring(dotIndex + 1);
    const integerPart: string = String(num).split('.')[0];

    for (let i = integerPart.length - 1; i >= 0; i--) {
      counter++;
      result = integerPart.charAt(i) + result;
      if (!(counter % 3) && i !== 0) {
        result = ',' + result;
      }
    }
    result = result + '.' + dotCnt;
  } else {
    result = (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
  }

  return result;
}




/** 截取内容描述**/
export function subContentToDescription(content: any) {
  const text = content.replace(/<[^>]*>?/gm, '');
  return text.substring(0, 150)
}

/** 格式化小数点**/
export function formatFixed(value: any) {
  let formatValue = Math.abs(Number(value)).toFixed(2).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
  if (value < 0) {
    formatValue = "(" + formatValue.replace('-', '') + ")";
  }
  return formatValue;
}

/** 格式化百分比**/
export function formatFixedRate(value: any) {
  let formatValue = Number(value).toFixed(2).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
  return formatValue;
}

/** 格式化小数点**/
export function globalFormatFixed(value: any) {
  let formatValue = Math.abs(Number(value)).toFixed(2);
  return Number(formatValue);
}

/** 国家列表合并去重 **/
export function extractAllStates(states: any) {
  const uniqueIds = [...new Set(states.map((item:any) => item.state_id))];
  const sortedIds = uniqueIds.sort((a:any, b:any) => a - b);
  return sortedIds.map(id => states.find((item: any) => item.state_id === id));
}

/** 城市分组**/
export function cityByState(states: any) {
  return states.reduce((group:any, city:any) => {
    const groupKey = city.state_id;
    if (!group[groupKey]) {
      group[groupKey] = [];
    }
    group[groupKey].push(city);
    return group;
  }, []);
}

/** 类型格式化**/
export function formatType(type:any) {
  if (typeof type == 'string') {
    const types = type.split('_').map((t) => {
      const arr = t.split('');
      arr[0] = arr[0].toString().toUpperCase();
      return arr.join('');
    });
    return types.join(' ');
  }
}


/** 获取字符串第一个字母大写**/
export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase();
}


/** 格式化金额为单位**/
export function numberFormatter(value: any){
  const units = ['K', 'M', 'B', 'T'];
  let num = Number(value);
  if (num === 0) {
    return '0'; // 或者 '0.0'，根据你的需求
  }
  let unitIndex = -1;
  while (num >= 1000 && unitIndex < units.length - 1) {
    num /= 1000;
    unitIndex++;
  }
  let decimalPlaces = unitIndex === 0 ? 0 : 1;
  return `${num.toFixed(decimalPlaces)}${units[unitIndex]}`;
};

/** 判断是否移动端**/
export function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone|Opera Mini|IEMobile/i.test(navigator.userAgent)
}

/** 判断是否完整url**/
export function isHttpUrl(urlString:string) {
  try {
    const url = new URL(urlString);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (err) {
    return false;
  }
}