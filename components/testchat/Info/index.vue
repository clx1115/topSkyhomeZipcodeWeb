<template>
  <el-row class="mt20">
    <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="attr-list">
      <div class="attr-item">
        <div class="label">Type :</div>
        <div class="value">{{ formatType(detail.PropertyType || '-') }}</div>
      </div>
      <div class="attr-item">
        <div class="label">Status :</div>
        <div class="value">{{ detail.StandardStatus || '-' }}</div>
      </div>
      <div class="attr-item">
        <div class="label">Price :</div>
        <div class="value">{{ detail.ListPrice !=0 ? '$' + toThousands(detail.ListPrice) : (detail.range_price ? detail.range_price : '$0') }}</div>
      </div>
      <div class="attr-item">
        <div class="label">Incentive :</div>
        <div class="value">{{ detail.incentive || '-' }}</div>
      </div>
      <div class="attr-item">
        <div class="label">Tax Rate :</div>
        <div class="value">{{ detail.tax_rate }}%</div>
      </div>
      <div class="attr-item">
        <div class="label">Estimated Rent :</div>
        <div class="value">${{ detail.estimated_rent }} / m</div>
      </div>
      <div class="attr-item">
        <div class="label">HOA :</div>
        <div class="value">${{ detail.hoa || 0 }} / m</div>
      </div>
      <div class="attr-item">
        <div class="label">CDD :</div>
        <div class="value">${{ detail.cdd }} / m</div>
      </div>
    </el-col>
    <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="attr-list">
      <div class="attr-item">
        <div class="label">Area Size :</div>
        <div class="value">{{ detail.LivingArea || 0 }}</div>
      </div>
      <div class="attr-item">
        <div class="label">Bedrooms :</div>
        <div class="value">{{ detail.BedroomsTotal || 0 }}</div>
      </div>
      <div class="attr-item">
        <div class="label">Bathrooms :</div>
        <div class="value">{{ detail.BathroomsFull || 0 }}</div>
      </div>
      <div class="attr-item">
        <div class="label">Garages :</div>
        <div class="value">{{ detail.garage || 0 }}</div>
      </div>
      <div class="attr-item">
        <div class="label">Year Built :</div>
        <div class="value">{{ detail.YearBuilt || '-' }}</div>
      </div>
      <div class="attr-item">
        <div class="label">Stories :</div>
        <div class="value">{{ detail.stories || '-' }}</div>
      </div>
      <div class="attr-item">
        <div class="label">Sold price :</div>
        <div class="value">${{ detail.sold_price || '-' }}</div>
      </div>
      <div class="attr-item">
        <div class="label">County :</div>
        <div class="value">{{ detail.county || '-' }}</div>
      </div>
    </el-col>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" v-if="detail.isShowFlooring === '1'" class="label-list">
      <div class="label">Flooring</div>
      <ul class="value">
        <li v-if="detail.flooring_tile === '1'">
          <span class="iconfont icon-correct" />Title
        </li>
        <li v-if="detail.flooring_hardwood === '1'">
          <span class="iconfont icon-correct" />Hardwood
        </li>
        <li v-if="detail.flooring_vinyl === '1'">
          <span class="iconfont icon-correct" />Vinyl
        </li>
        <li v-if="detail.flooring_carpet === '1'">
          <span class="iconfont icon-correct" />Carpet
        </li>
      </ul>
    </el-col>
    <el-col v-if="detail.isShowKitchen === '1'" :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="label-list">
      <div class="label">Kitchen Countertop material</div>
      <ul class="value">
        <li v-if="detail.kitchen_granite === '1'">
          <span class="iconfont icon-correct" />Granite
        </li>
        <li v-if="detail.kitchen_granite === '1'">
          <span class="iconfont icon-correct" />Marble
        </li>
        <li v-if="detail.kitchen_quartz === '1'">
          <span class="iconfont icon-correct" />Quartz
        </li>
        <li v-if="detail.kitchen_laminate === '1'">
          <span class="iconfont icon-correct" />Laminate
        </li>
      </ul>
    </el-col>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" v-if="detail.isShowAppliances === '1'" class="label-list">
      <div class="label">Appliances</div>
      <ul class="value">
        <li v-if="detail.appliances_refrigerator === '1'">
          <span class="iconfont icon-correct" />Refrigerator
        </li>
        <li v-if="detail.appliances_electric_stove === '1'">
          <span class="iconfont icon-correct" />Electric Stove
        </li>
        <li v-if="detail.appliances_gas_stove === '1'">
          <span class="iconfont icon-correct" />Gas Stove
        </li>
        <li v-if="detail.appliances_microwave === '1'">
          <span class="iconfont icon-correct" />Microwave
        </li>
      </ul>
    </el-col>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" v-if="detail.isShowAppliancesOther === '1'" class="label-list">
      <div class="label">Other Appliances</div>
      <ul class="value">
        <li v-if="detail.other_washer === '1'">
          <span class="iconfont icon-correct" />Washer
        </li>
        <li v-if="detail.other_dryer === '1'">
          <span class="iconfont icon-correct" />Dryer
        </li>
      </ul>
    </el-col>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" v-if="detail.isShowHeating === '1'" class="label-list">
      <div class="label">Heating</div>
      <ul class="value">
        <li v-if="detail.heat_furnace === '1'">
          <span class="iconfont icon-correct" />Furnace
        </li>
        <li v-if="detail.heat_heat_pump === '1'">
          <span class="iconfont icon-correct" />Heat Pump
        </li>
      </ul>
    </el-col>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" v-if="detail.isShowCooling === '1'" class="label-list">
      <div class="label">Cooling</div>
      <ul class="value">
        <li v-if="detail.heat_heat_pump === '1'">
          <span class="iconfont icon-correct" />Air Condition
        </li>
        <li v-if="detail.ac_central_ac === '1'">
          <span class="iconfont icon-correct" />Central
        </li>
      </ul>
    </el-col>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" v-if="detail.isShowExteriorMaterial === '1'"
      class="label-list">
      <div class="label">Exterior Material</div>
      <ul class="value">
        <li v-if="detail.exterior_brick === '1'">
          <span class="iconfont icon-correct" />Brick
        </li>
        <li v-if="detail.exterior_stone === '1'">
          <span class="iconfont icon-correct" />Stone
        </li>
        <li v-if="detail.exterior_stucco === '1'">
          <span class="iconfont icon-correct" />Stucco
        </li>
        <li v-if="detail.exterior_vinyl === '1'">
          <span class="iconfont icon-correct" />Vinyl
        </li>
        <li v-if="detail.exterior_wood === '1'">
          <span class="iconfont icon-correct" />Wood
        </li>
        <li v-if="detail.exterior_composite === '1'">
          <span class="iconfont icon-correct" />Composite
        </li>
        <li v-if="detail.exterior_fiber_cement === '1'">
          <span class="iconfont icon-correct" />Fiber Cement
        </li>
      </ul>
    </el-col>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" v-if="detail.isShowHighCeiling === '1'" class="label-list">
      <div class="label">High Ceiling</div>
      <ul class="value">
        <li v-if="detail.high_ceiling === '1'">
          <span class="iconfont icon-correct" />High Ceiling
        </li>
      </ul>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import {  formatType } from '@/utils/filters'
const props = defineProps({
  detail: {
    type: Object,
    default: () => ({}),
  }
})
</script>

<style lang="scss" scoped>
.attr-list {
  .attr-item {
    display: flex;

    .label {
      width: 120px;
      font-size: 16px;
      color: #484848;
      line-height: 2.857;
    }

    .value {
      font-size: 16px;
      color: #484848;
      font-weight: bold;
      line-height: 2.857;
    }
  }
}

.label-list {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  line-height: 2;
  font-size: 1.6rem;

  .label {
    font-weight: 700;
  }

  .value {
    font-weight: 700;
    display: flex;

    li {
      margin-right: 2rem;

      span {
        margin-right: 1rem;
        color: red;
        font-weight: 400;
      }
    }
  }

  @media only screen and (max-width: 991px) {
    .value {
      flex-direction: column;
    }
  }
}
</style>
