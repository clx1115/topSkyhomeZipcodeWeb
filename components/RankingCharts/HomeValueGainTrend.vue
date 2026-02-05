<template>
	<div class="trend-chart-container" v-loading="loading">
		<div ref="chartRef" class="chart-instance"></div>
		<div v-if="!loading && (!chartData || chartData.length === 0)" class="no-data-overlay">
			No trend data available
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, type PropType, shallowRef } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
	baseYear: {
		type: Number,
		default: 2024
	},
	currentYear: {
		type: Number,
		default: 2025
	},
	selectedMetros: {
		type: Array as PropType<string[]>,
		default: () => []
	},
	selectedZipcodes: {
		type: Array as PropType<string[]>,
		default: () => []
	}
})

const chartRef = ref<HTMLElement | null>(null)
const chartInstance = shallowRef<echarts.ECharts | null>(null)
const loading = ref(false)
const chartData = ref<any[]>([])

// Initialize chart
onMounted(() => {
	if (chartRef.value) {
		chartInstance.value = echarts.init(chartRef.value)
		window.addEventListener('resize', handleResize)
	}
})

onUnmounted(() => {
	if (chartInstance.value) {
		chartInstance.value.dispose()
	}
	window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
	chartInstance.value?.resize()
}

// Watch for prop changes to re-fetch data
watch([() => props.baseYear, () => props.currentYear, () => props.selectedMetros, () => props.selectedZipcodes], () => {
	fetchData()
}, { deep: true })

const fetchData = async () => {
	loading.value = true
	try {
		// Construct payload
		const payload = {
			base_year: props.baseYear,
			current_year: props.currentYear,
			date_type: 'quarter',
			type: 'home_value',
			metro: props.selectedMetros.join(','),
			zipcode: props.selectedZipcodes.join(',')
		}

		const response = await fetch('/charts/zipcode/trend', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		})
		const result = await response.json()
		
		if (result.status === 200 && result.data) {
			chartData.value = result.data
			renderChart()
		} else {
			chartData.value = []
			chartInstance.value?.clear()
		}
	} catch (error) {
		console.error('Failed to fetch trend data:', error)
		chartData.value = []
	} finally {
		loading.value = false
	}
}

const renderChart = () => {
	if (!chartInstance.value || !chartData.value.length) return

	const series: any[] = []
	const legends: string[] = []
	let periods: string[] = []

	// Process data
	chartData.value.forEach((item: any) => {
		const name = `${item.zipcode} ${item.city}` // Legend name
		legends.push(name)
		
		// Extract periods from the first item if not set
		if (periods.length === 0 && item.data && item.data.length > 0) {
			periods = item.data.map((d: any) => d.period)
		}

		// Extract growth rates
		const data = item.data.map((d: any) => (d.growth_rate * 100).toFixed(2)) // Convert to percentage

		series.push({
			name: name,
			type: 'line',
			data: data,
			smooth: true,
			showSymbol: false,
			emphasis: {
				focus: 'series'
			},
			lineStyle: {
				width: 2
			}
		})
	})

	const option: echarts.EChartsOption = {
		tooltip: {
			trigger: 'item',
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#eee',
			borderWidth: 1,
			textStyle: {
				color: '#333'
			},
			extraCssText: 'box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 10px;',
			formatter: function (params: any) {
				const data = params.data || params; 
				const seriesIndex = params.seriesIndex;
				const itemData = chartData.value[seriesIndex];
				
				if (!itemData) return '';
				
				const year = params.name; 
				const val = params.value;
				
				return `
					<div style="font-size: 13px; color: #333; min-width: 280px; line-height: 1.6;">
						<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
							<span style="color: #666; white-space: nowrap; margin-right: 20px;">Metro:</span>
							<span style="font-weight: 500; text-align: right; flex: 1;">${itemData.metro}</span>
						</div>
						<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
							<span style="color: #666; white-space: nowrap; margin-right: 20px;">City:</span>
							<span style="font-weight: 500; text-align: right; flex: 1;">${itemData.city}</span>
						</div>
						<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
							<span style="color: #666; white-space: nowrap; margin-right: 20px;">Zipcode:</span>
							<span style="font-weight: 500; text-align: right; flex: 1;">${itemData.zipcode}</span>
						</div>
						<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
							<span style="color: #666; white-space: nowrap; margin-right: 20px;">Year:</span>
							<span style="font-weight: 500; text-align: right; flex: 1;">${year}</span>
						</div>
						<div style="display: flex; justify-content: space-between; align-items: flex-start;">
							<span style="color: #666; white-space: nowrap; margin-right: 20px;">% Difference in Home Value:</span>
							<span style="font-weight: 500; text-align: right; flex: 1;">${val}%</span>
						</div>
					</div>
				`;
			}
		},
		legend: {
			data: legends,
			bottom: 0,
			type: 'scroll'
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '10%',
			top: '3%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: periods.map(p => p.replace('-', ' ')), // Format "2024-Q1" to "2024 Q1"
			axisLabel: {
				color: '#666'
			},
			axisLine: {
				lineStyle: {
					color: '#ddd'
				}
			}
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				formatter: '{value}%',
				color: '#666'
			},
			splitLine: {
				lineStyle: {
					color: '#f1f1f1'
				}
			}
		},
		series: series
	}

	chartInstance.value.setOption(option, true)
}
</script>

<style scoped>
.trend-chart-container {
	width: 100%;
	height: 100%;
	min-height: 450px;
	position: relative;
	background: #fff;
	border-radius: 8px;
}

.chart-instance {
	width: 100%;
	height: 100%;
}

.no-data-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background: rgba(255, 255, 255, 0.8);
	color: #999;
	font-size: 14px;
	z-index: 10;
}
</style>
