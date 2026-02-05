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
			trigger: 'axis',
			formatter: function (params: any) {
				let result = params[0].axisValue + '<br/>'
				params.forEach((item: any) => {
					result += `${item.marker} ${item.seriesName}: <b>${item.value}%</b><br/>`
				})
				return result
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
			bottom: '10%',
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
	min-height: 300px;
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
