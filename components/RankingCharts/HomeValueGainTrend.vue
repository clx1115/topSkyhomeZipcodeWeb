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

const hoveredSeriesIndex = ref<number>(-1)
const hoveredDataIndex = ref<number>(-1)

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

	// Dynamically resolve data point if hovering a series
	if (hoveredSeriesIndex.value !== -1 && chartInstance.value && chartData.value[hoveredSeriesIndex.value]) {
		const pixelResult = chartInstance.value.convertFromPixel({ xAxisIndex: 0 }, [x, y])
		const xIndex = Array.isArray(pixelResult) ? pixelResult[0] : pixelResult
		const itemData = chartData.value[hoveredSeriesIndex.value]
		
		// Safety check for data existence
		if (itemData && itemData.data && itemData.data.length > 0) {
			// Ensure xIndex is within bounds
			let safeIndex = typeof xIndex === 'number' ? Math.round(xIndex) : 0
			if (safeIndex < 0) safeIndex = 0
			if (safeIndex >= itemData.data.length) safeIndex = itemData.data.length - 1
			
			// Highlight the specific data point and show its symbol
			if (hoveredDataIndex.value !== safeIndex) {
				// Hide previous point's symbol
				if (hoveredDataIndex.value !== -1 && chartInstance.value) {
					chartInstance.value.dispatchAction({
						type: 'downplay',
						seriesIndex: hoveredSeriesIndex.value,
						dataIndex: hoveredDataIndex.value
					})
					
					// Update previous point to hide symbol
					const option = chartInstance.value.getOption() as any
					if (option.series && option.series[hoveredSeriesIndex.value] && 
						option.series[hoveredSeriesIndex.value].data && 
						Array.isArray(option.series[hoveredSeriesIndex.value].data)) {
						const newData = [...option.series[hoveredSeriesIndex.value].data]
						const prevPoint = { ...newData[hoveredDataIndex.value] }
						if (prevPoint && typeof prevPoint === 'object') {
							prevPoint.symbolSize = 0
							prevPoint.itemStyle = { opacity: 0 }
							newData[hoveredDataIndex.value] = prevPoint
							const seriesUpdate: any = {}
							seriesUpdate[`series.${hoveredSeriesIndex.value}.data`] = newData
							chartInstance.value.setOption(seriesUpdate, false)
						}
					}
				}
				
				// Show new point's symbol - use direct update method
				const option = chartInstance.value.getOption() as any
				if (option.series && option.series[hoveredSeriesIndex.value] && 
					option.series[hoveredSeriesIndex.value].data && 
					Array.isArray(option.series[hoveredSeriesIndex.value].data)) {
					// Create a new data array with updated point
					const newData = [...option.series[hoveredSeriesIndex.value].data]
					const currentPoint = { ...newData[safeIndex] }
					currentPoint.symbolSize = 14
					currentPoint.itemStyle = {
						opacity: 1,
						borderColor: '#fff',
						borderWidth: 2
					}
					newData[safeIndex] = currentPoint
					
					// Update only the specific series
					const seriesUpdate: any = {}
					seriesUpdate[`series.${hoveredSeriesIndex.value}.data`] = newData
					chartInstance.value.setOption(seriesUpdate, false)
				}
				
				// Also dispatch highlight action
				chartInstance.value.dispatchAction({
					type: 'highlight',
					seriesIndex: hoveredSeriesIndex.value,
					dataIndex: safeIndex
				})
				
				hoveredDataIndex.value = safeIndex
			}

			const pointData = itemData.data[safeIndex]
			if (pointData) {
				tooltip.value.data.year = pointData.period
				tooltip.value.data.val = (pointData.growth_rate * 100).toFixed(2)
			}
		}
	}
}

const handleMouseLeave = () => {
	tooltip.value.visible = false
	// Clear highlight and hide symbol
	if (hoveredSeriesIndex.value !== -1 && hoveredDataIndex.value !== -1 && chartInstance.value) {
		chartInstance.value.dispatchAction({
			type: 'downplay',
			seriesIndex: hoveredSeriesIndex.value,
			dataIndex: hoveredDataIndex.value
		})
		
		// Hide the point's symbol
		const option = chartInstance.value.getOption() as any
		if (option.series && option.series[hoveredSeriesIndex.value] && 
			option.series[hoveredSeriesIndex.value].data && 
			Array.isArray(option.series[hoveredSeriesIndex.value].data)) {
			const newData = [...option.series[hoveredSeriesIndex.value].data]
			const point = { ...newData[hoveredDataIndex.value] }
			if (point && typeof point === 'object') {
				point.symbolSize = 0
				point.itemStyle = { opacity: 0 }
				newData[hoveredDataIndex.value] = point
				const seriesUpdate: any = {}
				seriesUpdate[`series.${hoveredSeriesIndex.value}.data`] = newData
				chartInstance.value.setOption(seriesUpdate, false)
			}
		}
		
		hoveredDataIndex.value = -1
		hoveredSeriesIndex.value = -1
	}
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
				hoveredSeriesIndex.value = seriesIndex
				
				if (chartData.value && chartData.value[seriesIndex]) {
					const itemData = chartData.value[seriesIndex]
					
					// Default to '-'
					let year = '-'
					let val = '-'
					let targetIndex = -1

					// If we hit a specific point (symbol), use its data
					if (params.dataIndex !== undefined && itemData.data[params.dataIndex]) {
						targetIndex = params.dataIndex
						const pointData = itemData.data[params.dataIndex]
						year = pointData.period
						val = (pointData.growth_rate * 100).toFixed(2)
					} 
					// If we hit the line, try to resolve from mouse position immediately
					else if (params.event && params.event.offsetX && chartInstance.value) {
						const x = params.event.offsetX
						const y = params.event.offsetY
						const pixelResult = chartInstance.value.convertFromPixel({ xAxisIndex: 0 }, [x, y])
						const xIndex = Array.isArray(pixelResult) ? pixelResult[0] : pixelResult
						const safeIndex = typeof xIndex === 'number' ? Math.round(xIndex) : -1
						
						if (safeIndex >= 0 && safeIndex < itemData.data.length && itemData.data[safeIndex]) {
							targetIndex = safeIndex
							const pointData = itemData.data[safeIndex]
							year = pointData.period
							val = (pointData.growth_rate * 100).toFixed(2)
						}
					}

					// Show the point's symbol if we have a valid index
					if (targetIndex >= 0 && chartInstance.value) {
						const option = chartInstance.value.getOption() as any
						if (option.series && option.series[seriesIndex] && 
							option.series[seriesIndex].data && 
							Array.isArray(option.series[seriesIndex].data)) {
							const newData = [...option.series[seriesIndex].data]
							const point = { ...newData[targetIndex] }
							if (point && typeof point === 'object') {
								point.symbolSize = 14
								point.itemStyle = {
									opacity: 1,
									borderColor: '#fff',
									borderWidth: 2
								}
								newData[targetIndex] = point
								const seriesUpdate: any = {}
								seriesUpdate[`series.${seriesIndex}.data`] = newData
								chartInstance.value.setOption(seriesUpdate, false)
								hoveredDataIndex.value = targetIndex
							}
						}
					}

					tooltip.value.data = {
						metro: itemData.metro || '-',
						city: itemData.city || '-',
						zipcode: itemData.zipcode || '-',
						year: year,
						val: val
					}
					tooltip.value.visible = true
				}
			}
		})

		chartInstance.value.on('mouseout', (params: any) => {
			if (params.componentType === 'series') {
				// Delay resetting index to handle smooth transition between symbol and line
				hideTooltipTimer = setTimeout(() => {
					// Clear point highlight and hide symbol
					if (hoveredDataIndex.value !== -1 && chartInstance.value) {
						chartInstance.value.dispatchAction({
							type: 'downplay',
							seriesIndex: hoveredSeriesIndex.value,
							dataIndex: hoveredDataIndex.value
						})
						
						// Hide the point's symbol
						const option = chartInstance.value.getOption() as any
						if (option.series && option.series[hoveredSeriesIndex.value] && 
							option.series[hoveredSeriesIndex.value].data && 
							Array.isArray(option.series[hoveredSeriesIndex.value].data)) {
							const point = option.series[hoveredSeriesIndex.value].data[hoveredDataIndex.value]
							if (point && typeof point === 'object') {
								point.symbolSize = 0
								if (point.itemStyle) {
									point.itemStyle.opacity = 0
								} else {
									point.itemStyle = { opacity: 0 }
								}
								chartInstance.value.setOption(option, false)
							}
						}
						
						hoveredDataIndex.value = -1
					}
					
					hoveredSeriesIndex.value = -1 
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

		// Extract growth rates and create data array with symbol configuration
		const dataWithSymbols = item.data.map((d: any) => ({
			value: parseFloat((d.growth_rate * 100).toFixed(2)), // Convert to percentage as number
			symbol: 'circle',
			symbolSize: 0, // Hidden by default
			itemStyle: {
				opacity: 0
			}
		}))

		series.push({
			name: name,
			type: 'line',
			data: dataWithSymbols,
			smooth: true,
			showSymbol: true, // Enable symbols
			symbol: 'circle',
			symbolSize: 0, // Default hidden
			triggerLineEvent: true, // Enable hover on the line itself
			itemStyle: {
				opacity: 0 // Invisible normally
			},
			emphasis: {
				focus: 'series',
				showSymbol: true,
				symbolSize: 12,
				itemStyle: {
					opacity: 1,
					borderColor: '#fff',
					borderWidth: 2,
					shadowBlur: 8,
					shadowColor: 'rgba(0, 0, 0, 0.3)'
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
