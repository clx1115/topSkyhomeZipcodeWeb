
interface WechatShareOptions {
  title: string;
  desc?: string;
  imgUrl?: string;
  link?: string;
}

export async function initWechatShare(options: WechatShareOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (process.client) {
      const script = document.createElement('script');
      script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'; // 或者你的CDN地址
      script.onload = () => {
        fetch('https://www.topskyhome.com/api/wechat/sdk/config?url='+window.location.href, {
          method: 'get',
          headers: { 'Content-Type': 'application/json' },
        })
          .then((res) => res.json())
          .then((config) => {
            if (config.status === 200) {
              const configData = config.data;
              wx.config({
                debug: false, // 开启调试模式
                appId: configData.appId,
                timestamp: configData.timestamp,
                nonceStr: configData.nonceStr,
                signature: configData.signature,
                jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'],
              });

              wx.ready(() => {
                console.log('调用成功')
                // 分享给朋友
                wx.updateAppMessageShareData({
                  title: options.title || 'TopSky Home',
                  desc: options.desc || 'Helping you find your property!',
                  imgUrl: options.imgUrl || 'https://topskyhome.s3.us-west-2.amazonaws.com/webinar/33/webinar_1701829442_387f658b458a230ae504.jpeg',
                  link: options.link || window.location.href,
                  success() {
                    resolve();
                  },
                  fail(err) {
                    reject(err);
                  },
                });

                // 分享到朋友圈
                wx.updateTimelineShareData({
                  title: options.title || 'TopSky Home',
                  link: options.link || window.location.href,
                  imgUrl: options.imgUrl || 'https://topskyhome.s3.us-west-2.amazonaws.com/webinar/33/webinar_1701829442_387f658b458a230ae504.jpeg',
                  success() {
                    resolve();
                  },
                  fail(err) {
                    reject(err);
                  },
                });
              });

              wx.error((error) => {
                reject(error);
              });
            } else {
              reject(new Error(`获取微信config失败：${config.errmsg}`));
            }
          })
          .catch(reject);
      };
      document.head.appendChild(script);
    } else {
      console.warn('initWechatShare should only be called in browser environment.');
      resolve(); // 或者你可以选择抛出错误
    }
  });
}