<template>
    <el-card class="card-item">
        <div class="property-card">
            <div class="property-img">
                <!-- 循环输出所有图片 -->
                <!-- <template v-for="(media, idx) in currentPropertyItem.Media" :key="idx">
                    <img :src="media.MediaURL" alt="property" />
                </template> -->
                <el-row v-if="currentPropertyItem.Media.length" class="mt30" :gutter="30">
                    <el-col :xs="24" :sm="24" :md="currentPropertyItem.Media.length > 1 ? 16 : 24" :lg="currentPropertyItem.Media.length > 1 ? 16 : 24"
                    :xl="currentPropertyItem.Media.length > 1 ? 16 : 24">
                    <div class="property-img">
                        <el-image class="images" :src="currentPropertyItem.Media ? currentPropertyItem.Media[0].MediaURL : ''" :preview-src-list="currentPropertyItem.Media.map((item) => { return item.MediaURL})"
                        :initial-index="0" :alt="currentPropertyItem.title" lazy fit="cover" />
                    </div>
                    </el-col>
                    <el-col v-if="currentPropertyItem.Media.length > 1" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                        <el-scrollbar class="album-wrap">
                            <el-row :gutter="10">
                            <template v-for="(item, index) in currentPropertyItem.Media">
                                <el-col v-if="index > 0" :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="album-item" :key="index">
                                <el-image class="album-img" :preview-src-list="currentPropertyItem.Media.map((item) => {return item.MediaURL})" :initial-index="index + 1" :src="item.MediaURL" lazy
                                    fit="cover" />
                                </el-col>
                            </template>
                            </el-row>
                        </el-scrollbar>
                    </el-col>
                </el-row>
            </div>
            <div class="container mt20 mb20">
                <el-row :gutter="30">
                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                        <div class="section-wrap">
                            <div class="title">Property Details</div>
                            <div class="detail" v-dompurify-html="currentPropertyItem.description"></div>
                            <testchat-info :detail="currentPropertyItem" />
                        </div>
                        <div v-if="currentPropertyItem.Latitude && currentPropertyItem.Longitude" class="section-wrap mt20">
                            <div class="title mb20">
                            Location
                            </div>
                            <div ref="mapRef" style="width: 100%; height: 400px;"></div>
                            
                            <div class="address">
                            <el-icon><MapLocation /></el-icon>
                            {{ currentPropertyItem.UnparsedAddress }} {{ currentPropertyItem.City }} {{ currentPropertyItem.StateOrProvince ? ',' + currentPropertyItem.StateOrProvince : '' }} {{ currentPropertyItem.PostalCode }}
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { Loader } from '@googlemaps/js-api-loader'
const props = defineProps({
  currentPropertyItem: {
    type: Object,
    default: () => ({}),
  }
})

const mapRef = ref<HTMLDivElement | null>(null);
let mapInstance: google.maps.Map | null = null
let marker: google.maps.marker.AdvancedMarkerElement | null = null

async function initMap() {
  const loader = new Loader({
    apiKey: useRuntimeConfig().public.googleMapsApiKey,
    version: 'weekly',
    libraries: ['places'],
  });
  await loader.importLibrary('marker');
  const markerPosition = { lat: parseFloat(props.currentPropertyItem.Latitude), lng: parseFloat(props.currentPropertyItem.Longitude) };
  const mapOptions = {
    center: markerPosition,
    zoom: 12,
    mapId: "711c2561b991099c",
  };
  mapInstance = new google.maps.Map(mapRef.value!, mapOptions);
  marker = new google.maps.marker.AdvancedMarkerElement({ map: mapInstance, position: markerPosition });
}

// 监听经纬度变化，更新 marker 位置
watch(
  () => [props.currentPropertyItem.Latitude, props.currentPropertyItem.Longitude],
  ([newLat, newLng]) => {
    if (newLat && newLng && mapInstance && marker) {
      const newPosition = { lat: parseFloat(newLat), lng: parseFloat(newLng) }
      marker.position = newPosition
      mapInstance.setCenter(newPosition)
    }
  },
  { immediate: false }
)

onMounted(() => {
  if (props.currentPropertyItem.Latitude && props.currentPropertyItem.Longitude) {
    initMap()
  }
});

</script>

<style lang="scss" scoped>
.property-img {
  width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: 8px;
  position: relative;

  .images {
    width: 100%;
    height: 100%;
    border-radius: 8px;
  }

  .exclusive {
    position: absolute;
    left: -36px;
    top: 30px;
    background-color: red;
    color: #fff;
    transform: rotate(-45deg);
    padding: 0 35px;
    width: 168px;
    font-size: 2rem;
  }

  .sold {
    position: absolute;
    right: -32px;
    top: 12px;
    background: red;
    color: #fff;
    transform: rotate(45deg);
    padding: 0 35px;
    width: 120px;
    text-align: center;
    font-size: 2rem;
  }
}

.album-wrap {
  display: flex;
  flex-wrap: wrap;
  height: 500px;

  .album-item {
    margin-bottom: 1rem;

    .album-img {
      cursor: pointer;
      width: 100%;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
    }
  }
}

@media only screen and (max-width: 991px) {
  .property-img {
    width: 100%;
    height: auto;
  }

  .album-wrap {
    margin-top: 2rem;

    .album-item {

      .album-img {
        height: 200px;
      }
    }
  }
}

.section-wrap {
    background-color: #fff;
    border-radius: 8px;
    padding: 2rem;

    .title {
        font-weight: 500;
        font-size: 2rem;
    }

    .detail {
        margin-top: 1rem;
        text-indent: 24px;
        font-size: 1.8rem;
        line-height: 2;
    }

    .user-box {
        margin-top: 2rem;
        display: flex;
        align-items: center;

        .avatar {
        width: 40px;
        border-radius: 50%;
        }

        .user-info {
        margin-left: 1rem;
        display: flex;
        flex-direction: column;

        .name {
            font-size: 14px;
            color: #484848;
            line-height: 1.5;
        }

        .contact {
            font-size: 14px;
            font-weight: bold;
            line-height: 1.2;
            color: #ff5a5f;
            cursor: pointer;
        }
        }

    }

    .user-code {
        margin-top: 2rem;
        text-align: center;

        img {
        width: 300px;
        height: 300px;
        }
    }
    .address {
        margin-top: 2rem;
        font-size: 16px;
        color: #484848;
        line-height: 1.5;
    }
    }


    @media only screen and (max-width: 991px) {
    .property-header {
        padding-left: 1.5rem;
        padding-right: 1.5rem;

        .price {
        margin-top: 2rem;
        }
    }

    .section-wrap {
        margin: 0 1.5rem;
    }
}
</style>