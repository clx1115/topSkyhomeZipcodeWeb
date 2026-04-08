<template>
	<div class="population-module">
		<div class="header-controls">
			<div class="left-title">
				<h1 class="title">Population</h1>
			</div>
			<div class="right-filters">
				<div class="filter-group">
					<span class="label">Metro</span>
					<el-select 
						v-model="selectedMetrosValue" 
						multiple 
						collapse-tags 
						collapse-tags-tooltip
						placeholder="(Multiple values)" 
						style="width: 240px" 
						size="default"
						filterable
						popper-class="population-metro-popper"
					>
						<el-option label="(All)" value="__all__" class="all-option" />
						<el-option v-for="m in metroList" :key="m" :label="m" :value="m" />
					</el-select>
				</div>
				<div class="filter-group">
					<span class="label">Year</span>
					<div class="slider-container">
						<span class="year-val">2011</span>
						<el-slider v-model="yearRange" range :min="2011" :max="2024" :show-tooltip="false" style="width: 200px" />
						<span class="year-val">2024</span>
					</div>
				</div>
			</div>
		</div>

		<div class="legend-section">
			<div class="legend-group" v-if="selectedMetros.length > 0">
				<div class="legend-header">
					<div class="legend-label">Metro</div>
					<div 
						v-if="selectedMetros.length > 6" 
						class="more-btn" 
						@click="isLegendExpanded = !isLegendExpanded"
					>
						{{ isLegendExpanded ? 'Collapse' : 'More' }}
						<el-icon><ArrowDown v-if="!isLegendExpanded" /><ArrowUp v-else /></el-icon>
					</div>
				</div>
				<div class="legend-items" :class="{ expanded: isLegendExpanded }">
					<div v-for="m in displayedMetrosData" :key="m.name" class="legend-item">
						<span class="color-box" :style="{ backgroundColor: m.color }"></span>
						<span class="name" :title="m.name">{{ m.name }}</span>
					</div>
				</div>
			</div>
			<div class="legend-group country-group">
				<div class="legend-label">Country</div>
				<div class="legend-items">
					<div class="legend-item">
						<span class="color-box" style="background-color: #4a7ebb"></span>
						<span class="name">United States</span>
					</div>
				</div>
			</div>
		</div>

		<div class="main-content">
			<div class="top-row">
				<div class="map-container placeholder-box">
					<div class="placeholder-text">Map Placeholder (Figure 5)</div>
				</div>
				<div class="chart-container panel">
					<div class="panel-header">Accumulative Population Growth</div>
					<div class="panel-body chart-body" ref="growthChartRef"></div>
				</div>
			</div>
			<div class="bottom-row">
				<div class="chart-container panel">
					<div class="panel-header">% Net Population Growth According to Migration Pattern</div>
					<div class="panel-body chart-body" ref="migrationChartRef"></div>
				</div>
				<div class="chart-container placeholder-box">
					<div class="placeholder-text">Population Density (Current Year) Placeholder</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { getMsaMetrosList, getRrowthTrend, getNetMigrationTrend } from "@/api/charts"
import * as echarts from 'echarts'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

const metroList = ref<string[]>([])
const selectedMetros = ref<string[]>([])
const yearRange = ref([2011, 2024])
const isLegendExpanded = ref(false)

const growthChartRef = ref<HTMLElement | null>(null)
let growthChart: echarts.ECharts | null = null

const migrationChartRef = ref<HTMLElement | null>(null)
let migrationChart: echarts.ECharts | null = null

const selectedMetrosValue = computed({
	get: () => selectedMetros.value,
	set: (val: string[]) => {
		if (val.includes('__all__')) {
			if (selectedMetros.value.length === metroList.value.length) {
				selectedMetros.value = []
			} else {
				selectedMetros.value = [...metroList.value]
			}
		} else {
			selectedMetros.value = val
		}
	}
})

const defaultSelectedMetros = [
	'Charlotte-Concord-Gastonia, NC-SC',
	'Las Vegas-Henderson-Paradise, NV',
	'Memphis, TN-MS-AR',
	'Phoenix-Mesa-Chandler, AZ',
	'San Jose-Sunnyvale-Santa Clara, CA',
	'Seattle-Tacoma-Bellevue, WA'
]

const metroColorsMap: Record<string, string> = {
	'Charlotte-Concord-Gastonia, NC-SC': '#ef4444',
	'Las Vegas-Henderson-Paradise, NV': '#2c7a9b',
	'Memphis, TN-MS-AR': '#fbc4b4',
	'Phoenix-Mesa-Chandler, AZ': '#c4b5d4',
	'San Jose-Sunnyvale-Santa Clara, CA': '#84cc16',
	'Seattle-Tacoma-Bellevue, WA': '#f97316'
}

const colors = [
	'#ef4444', '#2c7a9b', '#fbc4b4', '#c4b5d4', '#84cc16', '#f97316',
	'#6a5acd', '#ff7f50', '#1e90ff', '#ffa500', '#2e8b57', '#ff1493'
]

const normalizeMetroList = (raw: any): string[] => {
	const data = raw?.data ?? raw ?? []
	if (!Array.isArray(data)) return []
	const mapped = data
		.map((x: any) => {
			if (typeof x === "string") return x
			if (x && typeof x.metro === "string") return x.metro
			return ""
		})
		.filter(Boolean)
	return Array.from(new Set(mapped))
}

const fetchMetroList = async () => {
	try {
		const res: any = await getMsaMetrosList()
		const list = normalizeMetroList(res)
		metroList.value = list
		
		// 默认选中图2中的城市（如果API列表中存在）
		const filteredDefaults = defaultSelectedMetros.filter(m => list.includes(m))
		if (filteredDefaults.length > 0) {
			selectedMetros.value = filteredDefaults
		} else if (list.length > 0) {
			// 如果没找到默认的，就选前几个
			selectedMetros.value = list.slice(0, 6)
		}
	} catch (err: any) {
		console.error("Failed to fetch metro list:", err)
		metroList.value = []
	}
}

const selectedMetrosData = computed(() => {
	return selectedMetros.value.map((name, index) => ({
		name,
		color: metroColorsMap[name] || colors[index % colors.length]
	}))
})

const displayedMetrosData = computed(() => {
	if (isLegendExpanded.value) return selectedMetrosData.value
	return selectedMetrosData.value.slice(0, 6)
})

const initChart = () => {
	if (growthChartRef.value) {
		growthChart = echarts.init(growthChartRef.value)
	}
	if (migrationChartRef.value) {
		migrationChart = echarts.init(migrationChartRef.value)
	}
	window.addEventListener('resize', () => {
		growthChart?.resize()
		migrationChart?.resize()
	})
}

const updateGrowthChart = async () => {
	if (!growthChart) return
	
	try {
		const params = {
			base_year: yearRange.value[0],
			current_year: yearRange.value[1],
			metro: selectedMetros.value,
			top: 10
		}
		
		const res: any = await getRrowthTrend(params)
		const data = res?.data ?? []
		
		if (!data.length) {
			growthChart.clear()
			return
		}

		// We need to extract all years for X axis
		const years = Array.from(new Set(data.flatMap((m: any) => m.data.map((d: any) => d.year)))).sort((a: any, b: any) => a - b)
		
		const series = data.map((m: any, index: number) => {
			const color = metroColorsMap[m.metro] || colors[index % colors.length]
			return {
				name: m.metro,
				type: 'line',
				smooth: true,
				data: years.map(y => {
					const point = m.data.find((d: any) => d.year === y)
					// 使用 growth_rate 字段，如果为 undefined 则显示 null
					if (!point || point.growth_rate === undefined || point.growth_rate === null) return null
					return (point.growth_rate * 100).toFixed(2)
				}),
				itemStyle: { color },
				lineStyle: { width: 3 },
				symbol: 'none',
				endLabel: {
					show: true,
					formatter: (params: any) => {
						if (params.value === null) return ''
						return `${params.value}%`
					},
					fontSize: 10,
					color: '#333',
					offset: [10, 0]
				}
			}
		})

		const option = {
			tooltip: {
				trigger: 'axis',
				formatter: (params: any) => {
					let html = `<div style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">${params[0].axisValue}</div>`
					params.forEach((p: any) => {
						if (p.value !== null && p.value !== undefined) {
							html += `<div style="display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 2px;">
								<span style="width: 8px; height: 8px; border-radius: 50%; background: ${p.color}"></span>
								<span style="flex: 1; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">${p.seriesName}</span>
								<span style="font-weight: 600;">${p.value}%</span>
							</div>`
						}
					})
					return html
				}
			},
			grid: {
				top: '15%',
				left: '5%',
				right: '12%',
				bottom: '10%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: years,
				axisLine: { lineStyle: { color: '#eee' } },
				axisLabel: { color: '#666', fontSize: 11 },
				boundaryGap: false
			},
			yAxis: {
				type: 'value',
				axisLabel: { 
					color: '#666', 
					fontSize: 11,
					formatter: '{value}%'
				},
				splitLine: { lineStyle: { color: '#f5f5f5' } }
			},
			series
		}
		
		growthChart.setOption(option, true)
	} catch (err) {
		console.error("Failed to update growth chart:", err)
	}
}

const updateMigrationChart = async () => {
	if (!migrationChart) return
	
	try {
		const params = {
			base_year: yearRange.value[0],
			current_year: yearRange.value[1],
			metro: selectedMetros.value,
			top: 10
		}
		
		const res: any = await getNetMigrationTrend(params)
		const data = res?.data ?? []
		
		if (!data.length) {
			migrationChart.clear()
			return
		}

		const years = Array.from(new Set(data.flatMap((m: any) => m.data.map((d: any) => d.year)))).sort((a: any, b: any) => a - b)
		
		const series = data.map((m: any, index: number) => {
			const color = metroColorsMap[m.metro] || colors[index % colors.length]
			
			// Find max and min points for labels
			const values = m.data.map((d: any) => d.net_growth_pct)
			const maxVal = Math.max(...values)
			const minVal = Math.min(...values)
			
			return {
				name: m.metro,
				type: 'line',
				smooth: true,
				data: years.map(y => {
					const point = m.data.find((d: any) => d.year === y)
					if (!point || point.net_growth_pct === undefined) return null
					return (point.net_growth_pct * 100).toFixed(2)
				}),
				itemStyle: { color },
				lineStyle: { width: 2 },
				symbol: 'circle',
				symbolSize: 4,
				markPoint: {
					symbol: 'none',
					data: [
						{ type: 'max', name: 'Max' },
						{ type: 'min', name: 'Min' }
					],
					label: {
						show: true,
						position: 'top',
						formatter: (params: any) => `${params.value}%`,
						fontSize: 10,
						color: '#333'
					}
				}
			}
		})

		const option = {
			tooltip: {
				trigger: 'axis',
				formatter: (params: any) => {
					let html = `<div style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">${params[0].axisValue}</div>`
					params.forEach((p: any) => {
						if (p.value !== null && p.value !== undefined) {
							html += `<div style="display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 2px;">
								<span style="width: 8px; height: 8px; border-radius: 50%; background: ${p.color}"></span>
								<span style="flex: 1; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">${p.seriesName}</span>
								<span style="font-weight: 600;">${p.value}%</span>
							</div>`
						}
					})
					return html
				}
			},
			grid: {
				top: '15%',
				left: '5%',
				right: '5%',
				bottom: '10%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: years,
				axisLine: { lineStyle: { color: '#eee' } },
				axisLabel: { color: '#666', fontSize: 11 },
				boundaryGap: false
			},
			yAxis: {
				type: 'value',
				axisLabel: { 
					color: '#666', 
					fontSize: 11,
					formatter: '{value}%'
				},
				splitLine: { lineStyle: { color: '#f5f5f5' } }
			},
			series
		}
		
		migrationChart.setOption(option, true)
	} catch (err) {
		console.error("Failed to update migration chart:", err)
	}
}

const updateAllCharts = () => {
	updateGrowthChart()
	updateMigrationChart()
}

watch([selectedMetros, yearRange], () => {
	updateAllCharts()
})

onMounted(async () => {
	initChart()
	await fetchMetroList()
	updateAllCharts()
})

onUnmounted(() => {
	window.removeEventListener('resize', () => {
		growthChart?.resize()
		migrationChart?.resize()
	})
	growthChart?.dispose()
	migrationChart?.dispose()
})
</script>

<style scoped lang="scss">
.population-module {
	padding: 10px 0;
}

.header-controls {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
	padding: 0 4px;

	.title {
		font-size: 32px;
		font-weight: 700;
		margin: 0;
		color: #1a1a1a;
	}

	.right-filters {
		display: flex;
		gap: 30px;
		align-items: center;
	}
}

.filter-group {
	display: flex;
	align-items: center;
	gap: 12px;

	.label {
		font-size: 14px;
		color: #333;
		font-weight: 600;
		white-space: nowrap;
	}

	.slider-container {
		display: flex;
		align-items: center;
		gap: 10px;

		.year-val {
			font-size: 12px;
			color: #666;
		}
	}
}

.legend-section {
	display: flex;
	gap: 60px;
	margin-bottom: 24px;
	padding: 0 4px;
	align-items: flex-start;

	.legend-group {
		flex: 1;
		min-width: 0;

		.legend-header {
			display: flex;
			align-items: center;
			gap: 12px;
			margin-bottom: 8px;
		}

		.legend-label {
			font-size: 13px;
			color: #333;
			font-weight: 600;
		}

		.more-btn {
			font-size: 12px;
			color: #3b82f6;
			cursor: pointer;
			display: flex;
			align-items: center;
			gap: 2px;
			user-select: none;

			&:hover {
				color: #2563eb;
			}
		}

		.legend-items {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 10px 30px;
			transition: all 0.3s ease;

			&.expanded {
				// No extra styles needed as grid will auto-expand
			}
		}

		&.country-group {
			flex: 0 0 auto;
			.legend-items {
				grid-template-columns: 1fr;
			}
		}
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;

		.color-box {
			width: 14px;
			height: 14px;
			flex-shrink: 0;
			border-radius: 2px;
		}

		.name {
			font-size: 12px;
			color: #444;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
}

.main-content {
	display: flex;
	flex-direction: column;
	gap: 20px;

	.top-row, .bottom-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
	}

	.panel {
		background: #fff;
		border: 1px solid #eee;
		border-radius: 4px;
		min-height: 400px;
		display: flex;
		flex-direction: column;
	}

	.panel-header {
		padding: 12px 16px;
		font-size: 14px;
		font-weight: 600;
		color: #333;
		border-bottom: 1px solid #f5f5f5;
	}

	.chart-body {
		flex: 1;
		min-height: 340px;
	}

	.placeholder-box {
		background: #fdfdfd;
		border: 1px solid #eee;
		border-radius: 4px;
		min-height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
		font-size: 14px;
	}
}
</style>

<style lang="scss">
.population-metro-popper {
	.el-select-dropdown__item.all-option {
		color: #3b82f6 !important;
		font-weight: 600 !important;
	}
}
</style>
