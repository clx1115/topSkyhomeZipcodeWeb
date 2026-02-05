<template>
	<div class="trend-chart-container" v-loading="loading" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
		<div ref="chartRef" class="chart-instance"></div>
		<div v-if="!loading && (!chartData || chartData.length === 0)" class="no-data-overlay">
			No trend data available
		</div>
		
		<!-- Custom Tooltip -->
		<div v-if="tooltip.visible && tooltip.data" class="custom-trend-tooltip" :style="{ top: tooltip.top + 'px', left: tooltip.left + 'px' }">
			<div class="tooltip-header">
				<span class="label">Metro</span>
				<span class="value">{{ tooltip.data.metro }}</span>
			</div>
			<div class="tooltip-row">
				<span class="label">City</span>
				<span class="value">{{ tooltip.data.city }}</span>
			</div>
			<div class="tooltip-row">
				<span class="label">Zipcode</span>
				<span class="value">{{ tooltip.data.zipcode }}</span>
			</div>
			<div class="tooltip-row">
				<span class="label">Year</span>
				<span class="value">{{ tooltip.data.year }}</span>
			</div>
			<div class="tooltip-footer">
				<span class="label">% Difference</span>
				<span class="value" :class="{ 'positive': tooltip.data.val >= 0, 'negative': tooltip.data.val < 0 }">
					{{ tooltip.data.val }}%
				</span>
			</div>
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

// Tooltip State
const tooltip = ref({
	visible: false,
	top: 0,
	left: 0,
	data: null as any
})

let hideTooltipTimer: any = null

const handleMouseMove = (event: MouseEvent) => {
	if (!chartRef.value) return
	
	const rect = chartRef.value.getBoundingClientRect()
	const x = event.clientX - rect.left
	const y = event.clientY - rect.top
	
	// Offset logic
	let left = x + 20
	let top = y + 20
	
	// Boundary check (simple)
	if (left + 280 > rect.width) {
		left = x - 300 // flip to left
	}
	if (top + 200 > rect.height) {
		top = y - 220 // flip to top
	}
	
	tooltip.value.left = left
	tooltip.value.top = top
}

const handleMouseLeave = () => {
	tooltip.value.visible = false
}

// Initialize chart
onMounted(() => {
	if (chartRef.value) {
		chartInstance.value = echarts.init(chartRef.value)
		window.addEventListener('resize', handleResize)
		
		// Event listeners for custom tooltip
		chartInstance.value.on('mouseover', (params: any) => {
			if (params.componentType === 'series') {
				if (hideTooltipTimer) {
					clearTimeout(hideTooltipTimer)
					hideTooltipTimer = null
				}
				
				const seriesIndex = params.seriesIndex
				const dataIndex = params.dataIndex
				
				if (chartData.value && chartData.value[seriesIndex]) {
					const itemData = chartData.value[seriesIndex]
					
					// Try to get specific point data
					let year = params.name
					let val = params.value
					
					// If hovering line (triggerLineEvent), params.name/value might be generic or missing
					// Attempt to resolve from data array if available
					if ((!year || val === undefined) && itemData.data && itemData.data[dataIndex]) {
						const pointData = itemData.data[dataIndex]
						year = pointData.period
						val = (pointData.growth_rate * 100).toFixed(2)
					}
					
					tooltip.value.data = {
						metro: itemData.metro || '-',
						city: itemData.city || '-',
						zipcode: itemData.zipcode || '-',
						year: year || '-',
						val: val !== undefined ? val : '-'
					}
					tooltip.value.visible = true
				}
			}
		})

		chartInstance.value.on('mouseout', (params: any) => {
			if (params.componentType === 'series') {
				hideTooltipTimer = setTimeout(() => {
					tooltip.value.visible = false
				}, 100)
			}
		})
		
		// Fetch data immediately upon mount
		fetchData()
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
			// Limit to top 15 items to prevent overcrowding
			chartData.value = result.data.slice(0, 15)
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
			showSymbol: false, // Default hidden
			symbol: 'circle', // Ensure it has a shape
			symbolSize: 10, // Larger hit area
			triggerLineEvent: true, // Enable hover on the line itself
			itemStyle: {
				opacity: 0 // Invisible normally
			},
			emphasis: {
				focus: 'series',
				itemStyle: {
					opacity: 1, // Visible on hover
					borderColor: '#fff',
					borderWidth: 2
				}
			},
			lineStyle: {
				width: 2
			}
		})
	})

	const option: echarts.EChartsOption = {
		tooltip: {
			show: false, // Disable native tooltip
			trigger: 'item'
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
	min-height: 550px; /* Increased height */
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

/* Custom Tooltip Styles */
.custom-trend-tooltip {
	position: absolute;
	z-index: 100;
	background: rgba(255, 255, 255, 0.95);
	border: 1px solid #ebeef5;
	box-shadow: 0 4px 12px rgba(0,0,0,0.15);
	border-radius: 8px;
	padding: 12px;
	min-width: 280px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	pointer-events: none; /* Important: allow mouse events to pass through to chart */
	transition: top 0.1s ease, left 0.1s ease;
}

.tooltip-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
	padding-bottom: 8px;
	border-bottom: 1px solid #ebeef5;
}

.tooltip-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 6px;
}

.tooltip-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 8px;
	padding-top: 8px;
	border-top: 1px solid #ebeef5;
}

.label {
	color: #909399;
	font-size: 12px;
}

.value {
	font-weight: 500;
	color: #606266;
	margin-left: 15px;
	text-align: right;
	flex: 1;
	font-size: 13px;
}

.tooltip-header .value {
	font-weight: 600;
	color: #303133;
}

.value.positive {
	color: #f56c6c;
	font-weight: 700;
}

.value.negative {
	color: #67c23a;
	font-weight: 700;
}
</style>
