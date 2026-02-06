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

const lastMouseY = ref(0)
const hoveredSeriesIndex = ref<number>(-1)

// Initialize chart
onMounted(() => {
	if (chartRef.value) {
		chartInstance.value = echarts.init(chartRef.value)
		window.addEventListener('resize', handleResize)
		
		// Track mouse Y position for magnetic tooltip
		chartInstance.value.getZr().on('mousemove', (params: any) => {
			lastMouseY.value = params.offsetY
		})

		// Track hovered series
		chartInstance.value.on('mouseover', (params: any) => {
			if (params.componentType === 'series') {
				hoveredSeriesIndex.value = params.seriesIndex
			}
		})

		chartInstance.value.on('mouseout', () => {
			hoveredSeriesIndex.value = -1
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
			date_type: 'year',
			type: 'rent',
			metro: props.selectedMetros.join(','),
			zipcode: props.selectedZipcodes.join(','),
			limit: 50
		}

		const response = await fetch('/charts/zipcode/history', {
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

		// Extract values
		const data = item.data.map((d: any) => d.value)

		series.push({
			name: name,
			type: 'line',
			data: data,
			smooth: true,
			showSymbol: false, 
			symbol: 'circle',
			symbolSize: 8,
			triggerLineEvent: true,
			lineStyle: {
				width: 2
			},
			emphasis: {
				focus: 'series',
				showSymbol: true, 
				itemStyle: {
					borderColor: '#fff',
					borderWidth: 2,
					shadowBlur: 8,
					shadowColor: 'rgba(0, 0, 0, 0.3)'
				},
				lineStyle: {
					width: 3
				}
			}
		})
	})

	const option: echarts.EChartsOption = {
		tooltip: {
			show: true,
			trigger: 'axis',
			confine: true,
			padding: 0,
			borderWidth: 0,
			backgroundColor: 'transparent',
			formatter: (params: any) => {
				if (!Array.isArray(params)) {
					params = [params]
				}
				
				if (params.length === 0) return ''

				let targetParam = params[0]
				
				// 1. Priority: Explicitly hovered series
				if (hoveredSeriesIndex.value !== -1) {
					const found = params.find((p: any) => p.seriesIndex === hoveredSeriesIndex.value)
					if (found) targetParam = found
				} else if (chartInstance.value) {
					// 2. Fallback: Find closest point to mouse Y (Magnetic Tooltip)
					let minDiff = Number.MAX_VALUE
					
					for (const p of params) {
						try {
							const point = chartInstance.value.convertToPixel(
								{ seriesIndex: p.seriesIndex }, 
								[p.dataIndex, p.value]
							)
							
							if (point) {
								const diff = Math.abs(point[1] - lastMouseY.value)
								if (diff < minDiff) {
									minDiff = diff
									targetParam = p
								}
							}
						} catch (e) {
							// Ignore conversion errors
						}
					}
				}
				
				const seriesIndex = targetParam.seriesIndex
				const itemData = chartData.value[seriesIndex]
				const year = targetParam.name
				const val = targetParam.value
				
				return `
					<div style="background: rgba(255, 255, 255, 0.95); border: 1px solid #ebeef5; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px; padding: 12px; font-family: sans-serif; min-width: 240px;">
						<div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #ebeef5;">
							<span style="color: #909399; font-size: 12px;">Metro</span>
							<span style="color: #606266; font-weight: 500; margin-left: 15px; text-align: right;">${itemData.metro || '-'}</span>
						</div>
						<div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
							<span style="color: #909399; font-size: 12px;">City</span>
							<span style="color: #606266; font-weight: 500;">${itemData.city || '-'}</span>
						</div>
						<div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
							<span style="color: #909399; font-size: 12px;">Zipcode</span>
							<span style="color: #606266; font-weight: 500;">${itemData.zipcode || '-'}</span>
						</div>
						<div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
							<span style="color: #909399; font-size: 12px;">Year</span>
							<span style="color: #606266; font-weight: 500;">${year || '-'}</span>
						</div>
						<div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #ebeef5;">
							<span style="color: #909399; font-size: 12px;">Rent</span>
							<span style="font-weight: 500; color: #303133;">$${Number(val).toLocaleString()}</span>
						</div>
					</div>
				`
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
			data: periods.map(p => p.replace('-', ' ')),
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
				formatter: '${value}',
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
	min-height: 550px;
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
