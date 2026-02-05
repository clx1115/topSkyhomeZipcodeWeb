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
				// params is an array of series data for the current axis value
				// Since we want to show details for the hovered point, we iterate
				// However, ECharts tooltip formatter with trigger 'axis' shows all series by default
				// To match the screenshot which seems to show specific details for one point or summary
				// But standard axis tooltip shows all. 
				// The screenshot shows a single box with details: Metro, City, Zipcode, Year, % Difference
				// This implies we might need to find which series is being hovered or show for all but formatted differently?
				// Actually, the screenshot looks like it's showing details for the *closest* point or a specific series.
				// But typically 'axis' trigger shows a list. 
				// Let's stick to a clean list first, but format the X-axis label nicely.
				// Wait, the user said "match image 2". Image 2 shows a specific box with Metro/City/Zipcode/Year/% Difference.
				// This usually happens when you hover over a *specific line* (trigger: 'item') OR 
				// if it's 'axis' trigger, it might be showing the top one or we need to customize.
				// Let's look closely at the screenshot. It shows "Metro: ... City: ... Zipcode: ... Year: ... % Difference: ...".
				// This suggests a single data point is the focus.
				
				// Let's try to improve the formatting to match the "clean" look first, 
				// but keep 'axis' trigger as it's better for comparing lines.
				// If the user insists on the exact box format for *one* item, we might need trigger: 'item'.
				// But for now, let's format the X-axis label (Year/Quarter) and the list values.
				
				// Re-reading: "Interface return format... change to image 2 can show quarter and this page height bigger"
				// "Show quarter" -> X axis label formatting.
				// "Page height bigger" -> CSS change.
				// The tooltip in image 2 is quite specific. It shows metadata (Metro/City/Zipcode) which is per-series.
				// If we use 'axis' trigger, we have multiple series. Showing Metro/City/Zipcode for *each* would be huge.
				// The screenshot shows *one* box. This implies either only one series is hovered (trigger: 'item') 
				// or the tooltip is customized to show the "active" one.
				
				// Let's try trigger: 'item' to match the screenshot's single-item detail view.
				const data = params.data || params; // ECharts structure varies slightly
				const seriesIndex = params.seriesIndex;
				const itemData = chartData.value[seriesIndex]; // We need to map back to source data
				
				if (!itemData) return '';
				
				const year = params.name; // X-axis value (period)
				const val = params.value;
				
				return `
					<div style="font-size: 12px; line-height: 1.5;">
						<div style="display:flex; justify-content:space-between; gap: 20px;">
							<span style="color:#666">Metro:</span>
							<span style="font-weight:500; text-align:right">${itemData.metro}</span>
						</div>
						<div style="display:flex; justify-content:space-between; gap: 20px;">
							<span style="color:#666">City:</span>
							<span style="font-weight:500; text-align:right">${itemData.city}</span>
						</div>
						<div style="display:flex; justify-content:space-between; gap: 20px;">
							<span style="color:#666">Zipcode:</span>
							<span style="font-weight:500; text-align:right">${itemData.zipcode}</span>
						</div>
						<div style="display:flex; justify-content:space-between; gap: 20px;">
							<span style="color:#666">Year:</span>
							<span style="font-weight:500; text-align:right">${year}</span>
						</div>
						<div style="display:flex; justify-content:space-between; gap: 20px; margin-top: 4px;">
							<span style="color:#666">% Difference in Home Value:</span>
							<span style="font-weight:500; text-align:right">${val}%</span>
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
