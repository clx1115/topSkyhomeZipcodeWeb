<template>
	<div class="chart-item">
		<div class="chart-header">
			<h3>Home Value Gain Ranking</h3>
			<div class="chart-filters" v-if="showFilters">
				<div class="year-filter">
					<span>Base Year</span>
					<el-select v-model="localBaseYear" size="small" style="width: 75px" @change="updateYears">
						<el-option v-for="year in yearList" :key="year" :label="year" :value="year" />
					</el-select>
				</div>
				<div class="year-filter">
					<span>Current Year</span>
					<el-select v-model="localCurrentYear" size="small" style="width: 75px" @change="updateYears">
						<el-option v-for="year in yearList" :key="year" :label="year" :value="year" />
					</el-select>
				</div>
			</div>
		</div>
		<div class="chart-content">
			<div class="ranking-table-header">
				<span class="col-zip">Zipcode</span>
				<span class="col-city">City</span>
				<span class="col-metro">Metro</span>
				<span class="col-growth"></span>
			</div>
			<div class="ranking-table-body">
				<div 
					v-for="(item, index) in data" 
					:key="index" 
					class="ranking-row"
					@mouseenter="$emit('showTooltip', $event, item, 'growth')"
					@mousemove="$emit('moveTooltip', $event)"
					@mouseleave="$emit('hideTooltip')"
				>
					<span class="col-zip">{{ item.zipcode }}</span>
					<span class="col-city">{{ item.city }}</span>
					<span class="col-metro">{{ item.metro }}</span>
					<div class="col-growth">
						<div class="diverging-bar-container">
							<div class="bar-side left">
								<template v-if="(item.growth_rate || 0) < 0">
									<span class="growth-text negative">{{ (item.growth_rate || 0).toFixed(1) }}%</span>
									<div 
										class="growth-bar negative" 
										:style="{ width: (Math.abs(item.growth_rate || 0) / maxGrowthVal * 100) + '%' }"
									></div>
								</template>
							</div>
							<div class="axis-line"></div>
							<div class="bar-side right">
								<template v-if="(item.growth_rate || 0) >= 0">
									<div 
										class="growth-bar positive" 
										:style="{ width: (Math.abs(item.growth_rate || 0) / maxGrowthVal * 100) + '%' }"
									></div>
									<span class="growth-text positive">{{ (item.growth_rate || 0).toFixed(1) }}%</span>
								</template>
							</div>
						</div>
					</div>
				</div>
				<div v-if="data.length === 0" class="no-data">
					No data available
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type PropType } from 'vue'

const props = defineProps({
	data: {
		type: Array as PropType<any[]>,
		default: () => []
	},
	baseYear: {
		type: Number,
		default: 2024
	},
	currentYear: {
		type: Number,
		default: 2025
	},
	yearList: {
		type: Array as PropType<number[]>,
		default: () => []
	},
	showFilters: {
		type: Boolean,
		default: true
	}
})

const emit = defineEmits(['update:baseYear', 'update:currentYear', 'showTooltip', 'moveTooltip', 'hideTooltip'])

const localBaseYear = ref(props.baseYear)
const localCurrentYear = ref(props.currentYear)

watch(() => props.baseYear, (val) => localBaseYear.value = val)
watch(() => props.currentYear, (val) => localCurrentYear.value = val)

const updateYears = () => {
	emit('update:baseYear', localBaseYear.value)
	emit('update:currentYear', localCurrentYear.value)
}

const maxGrowthVal = computed(() => {
	if (!props.data.length) return 1
	return Math.max(...props.data.map((item: any) => Math.abs(item.growth_rate || 0))) || 1
})
</script>

<style scoped lang="scss">
.chart-item {
	background: #fff;
	border-radius: 8px;
	min-height: 400px;
}

.chart-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 15px;
	flex-wrap: wrap;
	gap: 10px;
	
	h3 {
		font-size: 16px;
		font-weight: 600;
		color: #333;
		margin: 0;
		line-height: 24px;
	}
}

.chart-filters {
	display: flex;
	gap: 15px;
	
	.year-filter {
		display: flex;
		align-items: center;
		gap: 8px;
		
		span {
			font-size: 12px;
			color: #666;
		}
	}
}

.ranking-table-header {
	display: flex;
	padding: 8px 10px;
	border-bottom: 1px solid #eee;
	color: #999;
	font-size: 12px;
	font-weight: 500;

	.col-zip { width: 70px; }
	.col-city { width: 100px; }
	.col-metro { flex: 1; min-width: 120px; }
	.col-growth { width: 180px; text-align: center; }
}

.ranking-table-body {
	max-height: 480px;
	overflow-y: auto;
	
	/* Custom scrollbar */
	&::-webkit-scrollbar {
		width: 4px;
	}
	&::-webkit-scrollbar-track {
		background: #f1f1f1; 
	}
	&::-webkit-scrollbar-thumb {
		background: #ddd; 
		border-radius: 2px;
	}
}

.ranking-row {
	display: flex;
	align-items: center;
	padding: 5px 10px;
	border-bottom: 1px solid #f9f9f9;
	font-size: 13px;
	color: #333;
	transition: background-color 0.2s;
	
	&:hover {
		background-color: #f5f7fa;
	}
	
	.col-zip { width: 70px; color: #666; }
	.col-city { width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 10px; }
	.col-metro { flex: 1; min-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 10px; color: #666; font-size: 12px; }
	.col-growth { width: 180px; }
}

.diverging-bar-container {
	display: flex;
	align-items: center;
	height: 20px;
	width: 100%;
	position: relative;
	
	.axis-line {
		width: 1px;
		height: 100%;
		background-color: #ddd;
		position: absolute;
		left: 50%;
		top: 0;
	}
	
	.bar-side {
		flex: 1;
		display: flex;
		align-items: center;
		height: 100%;
		
		&.left {
			justify-content: flex-end;
			padding-right: 2px;
			
			.growth-bar {
				border-radius: 2px 0 0 2px;
				background-color: #ff8080;
			}
		}
		
		&.right {
			justify-content: flex-start;
			padding-left: 2px;
			
			.growth-bar {
				border-radius: 0 2px 2px 0;
				background-color: #82ca9d;
			}
		}
	}
	
	.growth-bar {
		height: 8px;
		min-width: 1px;
	}
	
	.growth-text {
		font-size: 11px;
		margin: 0 4px;
		white-space: nowrap;
		
		&.positive { color: #333; }
		&.negative { color: #333; }
	}
}

.no-data {
	padding: 40px;
	text-align: center;
	color: #999;
	font-size: 14px;
}
</style>
