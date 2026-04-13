<template>
	<div class="demographics-module">
		<div class="header-controls">
			<div class="left-title">
				<h1 class="title">Demographics</h1>
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
						popper-class="demographics-metro-popper"
					>
						<el-option label="(All)" value="__all__" class="all-option" />
						<el-option v-for="m in metroList" :key="m" :label="m" :value="m" />
					</el-select>
				</div>
			<div class="filter-group">
				<span class="label">Year</span>
				<div class="slider-container">
					<span class="year-val">{{ years[years.length - 1] }}</span>
					<el-slider v-model="selectedYear" :min="years[years.length - 1]" :max="years[0]" :show-tooltip="true" style="width: 200px" />
					<span class="year-val">{{ years[0] }}</span>
				</div>
			</div>
			</div>
		</div>

		<div class="filter-legend-section">
			<div class="legend-group">
				<div class="legend-header">
					<span class="legend-title">Race</span>
				</div>
				<div class="legend-items">
					<div 
						v-for="(race, index) in raceList" 
						:key="race" 
						class="legend-item"
						:class="{ active: selectedRaces.includes(race) }"
						@click="toggleRace(race)"
					>
						<span class="color-box" :style="{ backgroundColor: raceColors[index % raceColors.length] }"></span>
						<span class="name">{{ race }}</span>
					</div>
				</div>
			</div>
			<div class="legend-group">
				<div class="legend-header">
					<span class="legend-title">Age Group</span>
				</div>
				<div class="legend-items">
					<div 
						v-for="(age, index) in ageGroupList" 
						:key="age" 
						class="legend-item"
						:class="{ active: selectedAgeGroups.includes(age) }"
						@click="toggleAgeGroup(age)"
					>
						<span class="color-box" :style="{ backgroundColor: ageColors[index % ageColors.length] }"></span>
						<span class="name">{{ age }}</span>
					</div>
				</div>
			</div>
		</div>

		<div class="main-content">
			<div class="top-row">
				<div class="chart-container">
					<div class="chart-body" ref="raceChartRef" :style="{ height: dynamicHeight }"></div>
				</div>
				<div class="chart-container">
					<div class="chart-body" ref="ageChartRef" :style="{ height: dynamicHeight }"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { getMsaMetrosList, getRaces, getAgeGroups, getRaceDemographics, getAgeDemographics, getNationalRaceDemographics, getNationalAgeDemographics } from "@/api/charts"
import * as echarts from 'echarts'

const metroList = ref<string[]>([])
const selectedMetros = ref<string[]>([])
const years: number[] = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011]
const selectedYear = ref<number>(2024)

const raceList = ref<string[]>([])
const selectedRaces = ref<string[]>([])
const ageGroupList = ref<string[]>([])
const selectedAgeGroups = ref<string[]>([])

const raceChartRef = ref<HTMLElement | null>(null)
let raceChart: echarts.ECharts | null = null
const ageChartRef = ref<HTMLElement | null>(null)
let ageChart: echarts.ECharts | null = null

const dynamicHeight = computed(() => {
	const count = selectedMetros.value.length + 2 // +1 for United States, +1 for Spacer
	return Math.max(550, count * 65) + 'px' // 增加单行高度系数，为换行文字留出垂直空间
})

const raceColors = ['#b48194', '#e9c440', '#59a14f', '#76b0b1', '#e15759', '#f28e2b', '#4a7ebb']
const ageColors = ['#b48194', '#e9c440', '#59a14f', '#76b0b1', '#e15759', '#f28e2b', '#4a7ebb']

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

const toggleRace = (race: string) => {
	const index = selectedRaces.value.indexOf(race)
	if (index > -1) {
		selectedRaces.value.splice(index, 1)
	} else {
		selectedRaces.value.push(race)
	}
}

const toggleAgeGroup = (age: string) => {
	const index = selectedAgeGroups.value.indexOf(age)
	if (index > -1) {
		selectedAgeGroups.value.splice(index, 1)
	} else {
		selectedAgeGroups.value.push(age)
	}
}

const defaultSelectedMetros = [
	'Charlotte-Concord-Gastonia, NC-SC',
	'Las Vegas-Henderson-Paradise, NV',
	'Memphis, TN-MS-AR',
	'Phoenix-Mesa-Chandler, AZ',
	'San Jose-Sunnyvale-Santa Clara, CA',
	'Seattle-Tacoma-Bellevue, WA'
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

const fetchMetadata = async () => {
	try {
		const [metrosRes, racesRes, ageGroupsRes]: any = await Promise.all([
			getMsaMetrosList(),
			getRaces(),
			getAgeGroups()
		])
		
		metroList.value = normalizeMetroList(metrosRes)
		raceList.value = racesRes?.data ?? []
		ageGroupList.value = ageGroupsRes?.data ?? []
		
		selectedRaces.value = [...raceList.value]
		selectedAgeGroups.value = [...ageGroupList.value]
		
		const filteredDefaults = defaultSelectedMetros.filter(m => metroList.value.includes(m))
		if (filteredDefaults.length > 0) {
			selectedMetros.value = filteredDefaults
		} else if (metroList.value.length > 0) {
			selectedMetros.value = metroList.value.slice(0, 6)
		}
	} catch (err) {
		console.error("Failed to fetch metadata:", err)
	}
}

const updateCharts = async () => {
	if (!raceChart || !ageChart) return
	
	const params = {
		year: selectedYear.value,
		metro: selectedMetros.value
	}

	try {
		const [raceRes, nationalRaceRes, ageRes, nationalAgeRes]: any = await Promise.all([
			getRaceDemographics(params),
			getNationalRaceDemographics({ year: selectedYear.value }),
			getAgeDemographics(params),
			getNationalAgeDemographics({ year: selectedYear.value })
		])

		renderRaceChart(raceRes?.data ?? [], nationalRaceRes?.data ?? [])
		renderAgeChart(ageRes?.data ?? [], nationalAgeRes?.data ?? [])
	} catch (err) {
		console.error("Failed to update charts:", err)
	}
}

const renderRaceChart = (data: any[], nationalData: any[]) => {
	if (!raceChart) return
	
	const metros = data.map(m => m.metro).reverse()
	const yAxisData = ['United States', '', ...metros] // 添加一个空字符串作为间隔
	
	const series = raceList.value.filter(r => selectedRaces.value.includes(r)).map((race, index) => {
		const raceColor = raceColors[raceList.value.indexOf(race) % raceColors.length]
		return {
			name: race,
			type: 'bar',
			stack: 'total',
			barWidth: 30, // 减小宽度以增加间隔
			barCategoryGap: '30%', // 增加类别间距
			emphasis: { focus: 'series' },
			label: {
				show: true,
				position: 'inside',
				formatter: (params: any) => params.value > 8 ? params.value + '%' : '',
				color: '#fff',
				fontSize: 11
			},
			data: yAxisData.map(m => {
				if (m === '') return null // Spacer row
				let target: any
				if (m === 'United States') {
					target = nationalData.find(d => d.race === race)
				} else {
					const metroData = data.find(d => d.metro === m)
					target = metroData?.data?.find((d: any) => d.race === race)
				}
				return target ? (target.percentage * 100).toFixed(2) : 0
			}),
			itemStyle: { color: raceColor }
		}
	})

	const option = {
		tooltip: {
			trigger: 'item',
			formatter: (params: any) => {
				const metro = params.name
				if (!metro) return '' // Spacer row
				const race = params.seriesName
				const value = params.value
				return `<div style="padding: 10px; line-height: 1.6;">
					<div style="display: flex; justify-content: space-between; gap: 40px;">
						<span style="color: #999;">Metro:</span>
						<span style="font-weight: bold; color: #333;">${metro}</span>
					</div>
					<div style="display: flex; justify-content: space-between; gap: 40px;">
						<span style="color: #999;">Race:</span>
						<span style="font-weight: bold; color: #333;">${race}</span>
					</div>
					<div style="display: flex; justify-content: space-between; gap: 40px;">
						<span style="color: #999;">% of Population Per Race:</span>
						<span style="font-weight: bold; color: #333;">${value}%</span>
					</div>
				</div>`
			},
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#eee',
			borderWidth: 1,
			textStyle: { color: '#333' },
			extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 4px;'
		},
		legend: { show: false },
		grid: { left: '280', right: '40', bottom: '40', top: '40', containLabel: false }, // 增加左侧边距以适应更长的城市名
		xAxis: {
			type: 'value',
			axisLabel: {
				show: true,
				formatter: (val: number) => val.toFixed(1) + '%',
				color: '#999',
				fontSize: 12
			},
			axisLine: { show: false },
			axisTick: { show: false },
			splitLine: {
				show: true,
				lineStyle: { type: 'solid', color: '#eee' }
			},
			min: 0,
			max: 100,
			interval: 50 // 显示 0, 50, 100
		},
		yAxis: {
			type: 'category',
			data: yAxisData,
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: {
				color: '#666',
				fontSize: 12,
				width: 260, // 增加文字换行宽度
				overflow: 'break',
				interval: 0,
				align: 'right',
				margin: 15,
				formatter: (value: string) => value || ''
			}
		},
		series
	}
	raceChart.setOption(option, true)
}

const renderAgeChart = (data: any[], nationalData: any[]) => {
	if (!ageChart) return
	
	const metros = data.map(m => m.metro).reverse()
	const yAxisData = ['United States', '', ...metros] // 添加一个空字符串作为间隔
	
	const series = ageGroupList.value.filter(a => selectedAgeGroups.value.includes(a)).map((age, index) => {
		const ageColor = ageColors[ageGroupList.value.indexOf(age) % ageColors.length]
		return {
			name: age,
			type: 'bar',
			stack: 'total',
			barWidth: 30, // 减小宽度以增加间隔
			barCategoryGap: '30%', // 增加类别间距
			emphasis: { focus: 'series' },
			label: {
				show: true,
				position: 'inside',
				formatter: (params: any) => params.value > 8 ? params.value + '%' : '',
				color: '#fff',
				fontSize: 11
			},
			data: yAxisData.map(m => {
				if (m === '') return null // Spacer row
				let target: any
				if (m === 'United States') {
					target = nationalData.find(d => d.age_group === age)
				} else {
					const metroData = data.find(d => d.metro === m)
					target = metroData?.data?.find((d: any) => d.age_group === age)
				}
				return target ? (target.percentage * 100).toFixed(2) : 0
			}),
			itemStyle: { color: ageColor }
		}
	})

	const option = {
		tooltip: {
			trigger: 'item',
			formatter: (params: any) => {
				const metro = params.name
				if (!metro) return '' // Spacer row
				const age = params.seriesName
				const value = params.value
				return `<div style="padding: 10px; line-height: 1.6;">
					<div style="display: flex; justify-content: space-between; gap: 40px;">
						<span style="color: #999;">Metro:</span>
						<span style="font-weight: bold; color: #333;">${metro}</span>
					</div>
					<div style="display: flex; justify-content: space-between; gap: 40px;">
						<span style="color: #999;">Age Group:</span>
						<span style="font-weight: bold; color: #333;">${age}</span>
					</div>
					<div style="display: flex; justify-content: space-between; gap: 40px;">
						<span style="color: #999;">% of Population Per Age:</span>
						<span style="font-weight: bold; color: #333;">${value}%</span>
					</div>
				</div>`
			},
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#eee',
			borderWidth: 1,
			textStyle: { color: '#333' },
			extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 4px;'
		},
		legend: { show: false },
		grid: { left: '280', right: '40', bottom: '40', top: '40', containLabel: false }, // 增加左侧边距以适应更长的城市名
		xAxis: {
			type: 'value',
			axisLabel: {
				show: true,
				formatter: (val: number) => val.toFixed(1) + '%',
				color: '#999',
				fontSize: 12
			},
			axisLine: { show: false },
			axisTick: { show: false },
			splitLine: {
				show: true,
				lineStyle: { type: 'solid', color: '#eee' }
			},
			min: 0,
			max: 100,
			interval: 50
		},
		yAxis: {
			type: 'category',
			data: yAxisData,
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: {
				color: '#666',
				fontSize: 12,
				width: 260, // 增加文字换行宽度
				overflow: 'break',
				interval: 0,
				align: 'right',
				margin: 15,
				formatter: (value: string) => value || ''
			}
		},
		series
	}
	ageChart.setOption(option, true)
}

onMounted(async () => {
	selectedYear.value = 2024 // 强制初始化
	await fetchMetadata()
	initCharts()
	updateCharts()
})

const initCharts = () => {
	if (raceChartRef.value) raceChart = echarts.init(raceChartRef.value)
	if (ageChartRef.value) ageChart = echarts.init(ageChartRef.value)
	
	const resizeHandler = () => {
		raceChart?.resize()
		ageChart?.resize()
	}
	window.addEventListener('resize', resizeHandler)
	onUnmounted(() => {
		window.removeEventListener('resize', resizeHandler)
		raceChart?.dispose()
		ageChart?.dispose()
	})
}

watch([selectedMetros, selectedYear, selectedRaces, selectedAgeGroups], () => {
	updateCharts()
})
</script>

<style scoped lang="scss">
.demographics-module {
	padding: 10px 0;

	.header-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;

		.title {
			font-size: 32px;
			font-weight: 700;
			margin: 0;
			color: #1a1a1a;
		}

		.right-filters {
			display: flex;
			gap: 20px;
			align-items: center;

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

				:deep(.el-select) {
					.el-select__selection {
						flex-wrap: nowrap;
						overflow: hidden;
					}
				}
			}
		}
	}

	.filter-legend-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 40px;
		margin-bottom: 20px;
		background: transparent;
		padding: 0;
		border-radius: 0;
		border: none;

		.legend-group {
			.legend-header {
				margin-bottom: 10px;
				.legend-title {
					font-weight: 500;
					font-size: 14px;
					color: #333;
				}
			}

			.legend-items {
				display: flex;
				flex-wrap: wrap;
				gap: x; // handled by justify-content or margin
				
				.legend-item {
					display: flex;
					align-items: center;
					gap: 6px;
					cursor: pointer;
					padding: 2px 0;
					margin-right: 15px;
					opacity: 1;
					background: transparent !important;

					.color-box {
						width: 14px;
						height: 14px;
						border-radius: 2px;
					}

					.name {
						font-size: 12px;
						color: #666;
					}
				}
			}
		}
	}

	.main-content {
		.chart-container {
			background: transparent;
			border: none;
			overflow: visible;

			.chart-body {
				padding: 0;
			}
		}

		.top-row {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 60px; // 增加左右图表之间的间距
		}
	}
}

:deep(.all-option) {
	font-weight: bold;
	color: #409eff;
}
</style>
