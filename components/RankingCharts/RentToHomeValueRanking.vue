<template>
	<div class="chart-item">
		<div class="chart-header">
			<h3>Rent to Home Value Ranking</h3>
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
					@mouseenter="$emit('showTooltip', $event, item, 'rent_to_value')"
					@mousemove="$emit('moveTooltip', $event)"
					@mouseleave="$emit('hideTooltip')"
				>
					<span class="col-zip">{{ item.zipcode }}</span>
					<span class="col-city">{{ item.city }}</span>
					<span class="col-metro">{{ item.metro }}</span>
					<div class="col-growth">
						<div class="growth-bar-container">
							<div 
								class="growth-bar" 
								:style="{ width: ((item.value || 0) / maxVal * 100) + '%', backgroundColor: getBarColor(index) }"
							></div>
							<span class="growth-text">{{ ((item.value || 0) * 100).toFixed(1) }}%</span>
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
import { computed, type PropType } from 'vue'

const props = defineProps({
	data: {
		type: Array as PropType<any[]>,
		default: () => []
	}
})

const emit = defineEmits(['showTooltip', 'moveTooltip', 'hideTooltip'])

const maxVal = computed(() => {
	if (!props.data.length) return 1
	return Math.max(...props.data.map((item: any) => Number(item.value) || 0)) || 1
})

const barColors = [
	'#8884d8', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658',
	'#ff7300', '#ff0000', '#0088fe', '#00c49f', '#ffbb28', '#ff8042',
	'#413ea0', '#f50057', '#7c4dff', '#00b0ff'
]

const getBarColor = (index: number) => {
	return barColors[index % barColors.length]
}
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

.growth-bar-container {
	display: flex;
	align-items: center;
	width: 100%;
	
	.growth-bar {
		height: 12px;
		border-radius: 6px;
		min-width: 1px;
	}
	
	.growth-text {
		font-size: 12px;
		margin-left: 8px;
		color: #666;
		white-space: nowrap;
	}
}

.no-data {
	padding: 40px;
	text-align: center;
	color: #999;
	font-size: 14px;
}
</style>
