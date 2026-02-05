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
		const data = item.data.map((d: any) => ({
			value: (d.growth_rate * 100).toFixed(2),
			// Store metadata in data item for tooltip
			metro: item.metro,
			city: item.city,
			zipcode: item.zipcode,
			period: d.period
		}))

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
			trigger: 'item', // Trigger on item hover to show specific series details
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#eee',
			borderWidth: 1,
			padding: [10, 15],
			textStyle: {
				color: '#333',
				fontSize: 13
			},
			formatter: function (params: any) {
				const data = params.data
				if (!data) return ''
				
				return `
					<div style="font-family: sans-serif; min-width: 200px;">
						<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
							<span style="color: #666; margin-right: 15px;">Metro:</span>
							<span style="font-weight: 500; text-align: right;">${data.metro || '-'}</span>
						</div>
						<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
							<span style="color: #666; margin-right: 15px;">City:</span>
							<span style="font-weight: 500; text-align: right;">${data.city || '-'}</span>
						</div>
						<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
							<span style="color: #666; margin-right: 15px;">Zipcode:</span>
							<span style="font-weight: 500; text-align: right;">${data.zipcode || '-'}</span>
						</div>
						<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
							<span style="color: #666; margin-right: 15px;">Year:</span>
							<span style="font-weight: 500; text-align: right;">${data.period || params.name}</span>
						</div>
						<div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
							<span style="color: #666; margin-right: 15px;">% Difference in Home Value:</span>
							<span style="font-weight: 600; text-align: right;">${data.value}%</span>
						</div>
					</div>
				`
			}
		},
		legend: {
			data: legends,
			bottom: 0,
			type: 'scroll' // Handle many legends
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '40px', // Increase bottom margin for legend and x-axis
			top: '3%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: periods,
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
