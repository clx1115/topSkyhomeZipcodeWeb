export default async () => {
  // const baseUrl = "https://www.topskyhome.com";
  // const baseUrl = "http://localhost:8190";
  const baseUrl = "https://www.dev.topskyhome.com";

  let [ propertyList, communityList, webinarList] = await Promise.all([

    $fetch(baseUrl + "/api/property/getPropertyIds", {
      method: "get",
      params: {
        // approval_status: 'APPROVED'
      },
    }),
    $fetch(baseUrl + "/api/community/getCommunityIds", {
      method: "get",
      params: {
        status: 'APPROVED'
      },
    }),
    $fetch(baseUrl + "/api/webinar/getWebinarIds", {
      method: "get",
      params: {},
    }),
  ]);


  const propertyRoutes = propertyList.data.map((item: any) => {
    return {
      url: `/property/${item.id}`,
      changefred: "daily",
      lastmod: new Date().toISOString(),
      priority: 1,
    };
  })


  const communityRoutes = communityList.data.map((item: any) => {
    return {
      url: `/community/${item.id}`,
      changefred: "daily",
      lastmod: new Date().toISOString(),
      priority: 1,
    };
  })

  const webinarRoutes = webinarList.data.map((item: any) => {
    return {
      url: `/webinar/${item.id}`,
      changefred: "daily",
      lastmod: new Date().toISOString(),
      priority: 1,
    };
  })

  return [...propertyRoutes, ...communityRoutes,...webinarRoutes]
  // return [...webinarRoutes]
}