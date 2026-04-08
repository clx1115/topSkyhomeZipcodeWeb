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
				<div class="legend-label">Metro</div>
				<div class="legend-items">
					<div v-for="m in selectedMetrosData" :key="m.name" class="legend-item">
						<span class="color-box" :style="{ backgroundColor: m.color }"></span>
						<span class="name">{{ m.name }}</span>
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
				<div class="chart-container placeholder-box">
					<div class="placeholder-text">Accumulative Population Growth Chart Placeholder</div>
				</div>
			</div>
			<div class="bottom-row">
				<div class="chart-container placeholder-box">
					<div class="placeholder-text">% Net Population Growth According to Migration Pattern Placeholder</div>
				</div>
				<div class="chart-container placeholder-box">
					<div class="placeholder-text">Population Density (Current Year) Placeholder</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getMsaMetrosList } from "@/api/charts"

const metroList = ref<string[]>([])
const selectedMetros = ref<string[]>([])
const yearRange = ref([2011, 2024])

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

onMounted(() => {
	fetchMetroList()
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

	.legend-group {
		.legend-label {
			font-size: 13px;
			color: #333;
			margin-bottom: 8px;
			font-weight: 600;
		}

		.legend-items {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 10px 30px;
		}

		&.country-group {
			.legend-items {
				grid-template-columns: 1fr;
			}
		}
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 8px;

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

	.placeholder-box {
		background: #fdfdfd;
		border: 1px solid #eee;
		border-radius: 4px;
		min-height: 360px;
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
