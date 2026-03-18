<template>
	<div class="msa-page">
		<div class="msa-container">
			<div class="header-section">
				<h1 class="title">Housing Related MSA Metrics (Top {{ topN }})</h1>
			</div>

			<div class="filter-bar">
				<div class="filter-group">
					<span class="label">Top n</span>
					<el-input-number v-model="topN" :min="1" :max="100" controls-position="right" class="w-20" />
				</div>

				<div class="filter-group">
					<span class="label">Metro</span>
					<el-select v-model="selectedMetro" placeholder="(All)" filterable style="width: 320px">
						<el-option label="(All)" value="__all__" />
						<el-option v-for="m in metroList" :key="m" :label="m" :value="m" />
					</el-select>
				</div>

				<div class="filter-group wide">
					<span class="label">Population</span>
					<el-slider v-model="minPopulation" :min="1000000" :max="populationMax" :step="1" :show-tooltip="false" />
					<span class="value">{{ formatNumber(minPopulation) }}</span>
				</div>

				<div class="filter-group">
					<span class="label">Base Year</span>
					<el-select v-model="baseYear" style="width: 120px">
						<el-option v-for="y in yearList" :key="y" :label="y" :value="y" />
					</el-select>
				</div>

				<div class="filter-group">
					<span class="label">Current Year</span>
					<el-select v-model="currentYear" style="width: 120px">
						<el-option v-for="y in yearList" :key="y" :label="y" :value="y" />
					</el-select>
				</div>
			</div>

			<div class="grid">
				<div class="panel">
					<div class="panel-header">
						<div class="panel-title">% of Home Value Gain</div>
					</div>
					<div class="panel-body">
						<div class="table-header home-value-gain">
							<span class="col-metro">Metro</span>
							<span class="col-base">Base Year Value</span>
							<span class="col-current">Current Year Value</span>
							<span class="col-rate"></span>
						</div>
						<div class="table-body">
							<div v-for="(row, idx) in filteredHomeValueGrowth" :key="row.metro + idx" class="table-row home-value-gain">
								<span class="col-metro">{{ row.metro }}</span>
								<span class="col-base">{{ formatCurrencyK(row.base_year_value) }}</span>
								<span class="col-current">{{ formatCurrencyK(row.current_year_value) }}</span>
								<span class="col-rate">
									<div class="bar-line">
										<div class="bar-wrap">
											<div class="bar" :style="{ width: toPercentWidth(row.growth_rate, maxHomeValueGrowthRate) + '%', backgroundColor: barColor(idx) }"></div>
										</div>
										<span class="bar-text">{{ formatPercentAuto(row.growth_rate) }}</span>
									</div>
								</span>
							</div>
							<div v-if="filteredHomeValueGrowth.length === 0" class="empty">No data</div>
						</div>
					</div>
				</div>

				<div class="panel">
					<div class="panel-header">
						<div class="panel-title">Rent-to-Home-Value Ratio</div>
						<div class="range">
							<span class="range-label">Rent to Home Value</span>
							<el-slider v-model="rentToValueRange" range :min="rentToValueMin" :max="rentToValueMax" :step="0.0001" :show-tooltip="false" style="width: 280px" />
							<span class="range-value">{{ formatPercentRatio(rentToValueRange[0]) }} - {{ formatPercentRatio(rentToValueRange[1]) }}</span>
						</div>
					</div>
					<div class="panel-body">
						<div class="bar-list">
							<div v-for="(row, idx) in filteredRentToValue" :key="row.metro + idx" class="bar-row">
								<span class="bar-label">{{ row.metro }}</span>
								<div class="bar-wrap">
									<div class="bar" :style="{ width: ((row.avg_rent_to_home_value || 0) / (maxRentToValue || 1) * 100) + '%', backgroundColor: barColor(idx) }"></div>
								</div>
								<span class="bar-val">{{ formatPercentRatio(row.avg_rent_to_home_value) }}</span>
							</div>
							<div v-if="filteredRentToValue.length === 0" class="empty">No data</div>
						</div>
					</div>
				</div>

				<div class="panel">
					<div class="panel-header">
						<div class="panel-title">% of Population Growth</div>
						<div class="year-pickers">
							<div class="year-picker">
								<span class="year-label">Base Year</span>
								<el-select v-model="populationBaseYear" style="width: 110px">
									<el-option v-for="y in yearList" :key="y" :label="y" :value="y" />
								</el-select>
							</div>
							<div class="year-picker">
								<span class="year-label">Current Year</span>
								<el-select v-model="populationCurrentYear" style="width: 110px">
									<el-option v-for="y in yearList" :key="y" :label="y" :value="y" />
								</el-select>
							</div>
						</div>
					</div>
					<div class="panel-body">
						<div class="table-header population-growth">
							<span class="col-metro">Metro</span>
							<span class="col-base">Base Year Pop. ({{ populationBaseYear }})</span>
							<span class="col-current">Current Year Pop. ({{ populationCurrentYear }})</span>
							<span class="col-rate"></span>
						</div>
						<div class="table-body">
							<div v-for="(row, idx) in filteredPopulationGrowth" :key="row.metro + idx" class="table-row population-growth">
								<span class="col-metro">{{ row.metro }}</span>
								<span class="col-base">{{ formatNumberK(row.base_year_population) }}</span>
								<span class="col-current">{{ formatNumberK(row.current_year_population) }}</span>
								<span class="col-rate">
									<div class="bar-line">
										<div class="bar-wrap">
											<div class="bar" :style="{ width: toPercentWidth(row.growth_rate, maxPopulationGrowthRate) + '%', backgroundColor: barColor(idx) }"></div>
										</div>
										<span class="bar-text">{{ formatPercentAuto(row.growth_rate) }}</span>
									</div>
								</span>
							</div>
							<div v-if="filteredPopulationGrowth.length === 0" class="empty">No data</div>
						</div>
					</div>
				</div>

				<div class="panel">
					<div class="panel-header">
						<div class="panel-title">Home Value</div>
						<div class="range">
							<span class="range-label">Home Value</span>
							<el-slider v-model="homeValueRange" range :min="homeValueMin" :max="homeValueMax" :step="1000" :show-tooltip="false" style="width: 280px" />
							<span class="range-value">{{ formatCurrencyK(homeValueRange[0]) }} - {{ formatCurrencyK(homeValueRange[1]) }}</span>
						</div>
					</div>
					<div class="panel-body">
						<div class="bar-list">
							<div v-for="(row, idx) in filteredHomeValue" :key="row.metro + idx" class="bar-row">
								<span class="bar-label">{{ row.metro }}</span>
								<div class="bar-wrap">
									<div class="bar" :style="{ width: ((row.avg_home_value_index || 0) / (maxHomeValue || 1) * 100) + '%', backgroundColor: barColor(idx) }"></div>
								</div>
								<span class="bar-val">{{ formatCurrencyK(row.avg_home_value_index) }}</span>
							</div>
							<div v-if="filteredHomeValue.length === 0" class="empty">No data</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { getMsaHomeValueGrowthRank, getMsaHomeValueRank, getMsaMetrosList, getMsaPopulationGrowthRank, getMsaRentToValueRank } from "@/api/charts"
import { computed, onMounted, ref, watch } from "vue"

type MsaHomeValueGrowthItem = {
	metro: string
	base_year_value: number
	current_year_value: number
	growth_rate: number
}

type MsaPopulationGrowthItem = {
	metro: string
	base_year_population: number
	current_year_population: number
	growth_rate: number
}

type MsaRentToValueItem = {
	metro: string
	avg_rent_to_home_value: number
}

type MsaHomeValueItem = {
	metro: string
	avg_home_value_index: number
}

const topN = ref(20)
const selectedMetro = ref<string>("__all__")
const metroList = ref<string[]>([])

const yearList = Array.from({ length: 31 }, (_, i) => 1996 + i).reverse()
const baseYear = ref(2020)
const currentYear = ref(2024)
const populationBaseYear = ref(2023)
const populationCurrentYear = ref(2024)

const populationMax = 20000000
const minPopulation = ref(1000000)

const homeValueGrowthData = ref<MsaHomeValueGrowthItem[]>([])
const populationGrowthData = ref<MsaPopulationGrowthItem[]>([])
const rentToValueData = ref<MsaRentToValueItem[]>([])
const homeValueData = ref<MsaHomeValueItem[]>([])

const rentToValueMin = ref(0)
const rentToValueMax = ref(0.01)
const rentToValueRange = ref<[number, number]>([0, 0.01])

const homeValueMin = ref(0)
const homeValueMax = ref(2000000)
const homeValueRange = ref<[number, number]>([0, 2000000])

const barColors = [
	"#6a5acd",
	"#ff7f50",
	"#1e90ff",
	"#ffa500",
	"#2e8b57",
	"#ff1493",
	"#20b2aa",
	"#8b0000",
	"#708090",
	"#b8860b",
	"#00b0ff",
	"#7c4dff"
]

const barColor = (index: number) => barColors[index % barColors.length]

const formatNumber = (val: number | undefined | null) => {
	const num = Number(val)
	if (!Number.isFinite(num)) return "-"
	return num.toLocaleString()
}

const formatNumberK = (val: number | undefined | null) => {
	const num = Number(val)
	if (!Number.isFinite(num)) return "-"
	return `${Math.round(num / 1000).toLocaleString()}K`
}

const formatCurrencyK = (val: number | undefined | null) => {
	const num = Number(val)
	if (!Number.isFinite(num)) return "-"
	return `$${Math.round(num / 1000).toLocaleString()}K`
}

const formatPercentRatio = (val: number | undefined | null) => {
	const num = Number(val)
	if (!Number.isFinite(num)) return "-"
	return `${(num * 100).toFixed(2)}%`
}

const formatPercentAuto = (val: number | undefined | null) => {
	const num = Number(val)
	if (!Number.isFinite(num)) return "-"
	const normalized = Math.abs(num) <= 1 ? num * 100 : num
	return `${normalized.toFixed(2)}%`
}

const toNum = (val: any, fallback = 0) => {
	const num = Number(val)
	return Number.isFinite(num) ? num : fallback
}

const toStr = (val: any) => {
	return typeof val === "string" ? val : ""
}

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

const normalizeHomeValueGrowth = (raw: any): MsaHomeValueGrowthItem[] => {
	const data = raw?.data ?? raw ?? []
	if (!Array.isArray(data)) return []
	return data
		.map((x: any) => {
			const metro = toStr(x?.metro) || toStr(x?.msa) || toStr(x?.name)
			const base_year_value = toNum(x?.base_year_value ?? x?.base_value ?? x?.base_year_home_value)
			const current_year_value = toNum(x?.current_year_value ?? x?.current_value ?? x?.current_year_home_value)
			const growth_rate = toNum(x?.growth_rate ?? x?.growthRate ?? x?.rate)
			return { metro, base_year_value, current_year_value, growth_rate }
		})
		.filter((x: any) => x.metro)
}

const normalizePopulationGrowth = (raw: any): MsaPopulationGrowthItem[] => {
	const data = raw?.data ?? raw ?? []
	if (!Array.isArray(data)) return []
	return data
		.map((x: any) => {
			const metro = toStr(x?.metro) || toStr(x?.msa) || toStr(x?.name)
			const base_year_population = toNum(
				x?.base_year_population ??
					x?.base_year_pop ??
					x?.base_population ??
					x?.base_pop ??
					x?.baseYearPopulation ??
					x?.baseYearPop
			)
			const current_year_population = toNum(
				x?.current_year_population ??
					x?.current_year_pop ??
					x?.current_population ??
					x?.current_pop ??
					x?.currentYearPopulation ??
					x?.currentYearPop
			)
			const growth_rate = toNum(x?.growth_rate ?? x?.growthRate ?? x?.rate)
			return { metro, base_year_population, current_year_population, growth_rate }
		})
		.filter((x: any) => x.metro)
}

const normalizeRentToValue = (raw: any): MsaRentToValueItem[] => {
	const data = raw?.data ?? raw ?? []
	if (!Array.isArray(data)) return []
	return data
		.map((x: any) => {
			const metro = toStr(x?.metro) || toStr(x?.msa) || toStr(x?.name)
			const avg_rent_to_home_value = toNum(x?.avg_rent_to_home_value ?? x?.value ?? x?.rent_to_value)
			return { metro, avg_rent_to_home_value }
		})
		.filter((x: any) => x.metro)
}

const normalizeHomeValue = (raw: any): MsaHomeValueItem[] => {
	const data = raw?.data ?? raw ?? []
	if (!Array.isArray(data)) return []
	return data
		.map((x: any) => {
			const metro = toStr(x?.metro) || toStr(x?.msa) || toStr(x?.name)
			const avg_home_value_index = toNum(x?.avg_home_value_index ?? x?.value ?? x?.avg_home_value)
			return { metro, avg_home_value_index }
		})
		.filter((x: any) => x.metro)
}

const fetchMetroList = async () => {
	try {
		const res: any = await getMsaMetrosList()
		metroList.value = normalizeMetroList(res)
	} catch (err: any) {
		if (Array.isArray(err)) metroList.value = normalizeMetroList(err)
		else metroList.value = []
	}
}

const fetchAll = async () => {
	const safeBase = Math.min(baseYear.value, currentYear.value)
	const safeCurrent = Math.max(baseYear.value, currentYear.value)
	if (safeBase !== baseYear.value) baseYear.value = safeBase
	if (safeCurrent !== currentYear.value) currentYear.value = safeCurrent

	const safePopBase = Math.min(populationBaseYear.value, populationCurrentYear.value)
	const safePopCurrent = Math.max(populationBaseYear.value, populationCurrentYear.value)
	if (safePopBase !== populationBaseYear.value) populationBaseYear.value = safePopBase
	if (safePopCurrent !== populationCurrentYear.value) populationCurrentYear.value = safePopCurrent

	const common = {
		base_year: baseYear.value,
		current_year: currentYear.value,
		top: topN.value
	}

	const populationParams = {
		base_year: populationBaseYear.value,
		current_year: populationCurrentYear.value,
		top: topN.value
	}

	const minPopNum = Number(minPopulation.value) || 1

	const [growthRes, rentToValueRes, popRes, homeValueRes] = await Promise.all([
		getMsaHomeValueGrowthRank({ ...common, min_population: minPopNum }),
		getMsaRentToValueRank({ ...common, min_population: minPopNum }),
		getMsaPopulationGrowthRank({ ...populationParams, min_avg_population: minPopNum }),
		getMsaHomeValueRank({ ...common, min_avg_population: minPopNum })
	])

	homeValueGrowthData.value = normalizeHomeValueGrowth(growthRes as any)
	rentToValueData.value = normalizeRentToValue(rentToValueRes as any)
	populationGrowthData.value = normalizePopulationGrowth(popRes as any)
	homeValueData.value = normalizeHomeValue(homeValueRes as any)

	const rentVals = rentToValueData.value.map(x => Number(x.avg_rent_to_home_value) || 0)
	const rentMin = rentVals.length ? Math.min(...rentVals) : 0
	const rentMax = rentVals.length ? Math.max(...rentVals) : 0.01
	rentToValueMin.value = Math.max(0, rentMin)
	rentToValueMax.value = Math.max(rentToValueMin.value + 0.0001, rentMax || 0.01)
	rentToValueRange.value = [rentToValueMin.value, rentToValueMax.value]

	const hvVals = homeValueData.value.map(x => Number(x.avg_home_value_index) || 0)
	const hvMin = hvVals.length ? Math.min(...hvVals) : 0
	const hvMax = hvVals.length ? Math.max(...hvVals) : 2000000
	homeValueMin.value = Math.max(0, hvMin)
	homeValueMax.value = Math.max(homeValueMin.value + 1000, hvMax || 2000000)
	homeValueRange.value = [homeValueMin.value, homeValueMax.value]
}

let debounceTimer: any = null
const debouncedFetch = () => {
	if (debounceTimer) clearTimeout(debounceTimer)
	debounceTimer = setTimeout(() => {
		fetchAll().catch(() => null)
	}, 500)
}

watch([topN, baseYear, currentYear, populationBaseYear, populationCurrentYear, minPopulation], () => debouncedFetch())

onMounted(async () => {
	await fetchMetroList()
	await fetchAll()
})

const applyMetroFilter = <T extends { metro: string }>(rows: T[]) => {
	if (selectedMetro.value === "__all__") return rows
	return rows.filter(r => r.metro === selectedMetro.value)
}

const maxHomeValueGrowthRate = computed(() => {
	const vals = filteredHomeValueGrowth.value.map(x => Math.abs(Number(x.growth_rate) || 0))
	return Math.max(0.0001, ...vals)
})

const maxPopulationGrowthRate = computed(() => {
	const vals = filteredPopulationGrowth.value.map(x => Math.abs(Number(x.growth_rate) || 0))
	return Math.max(0.0001, ...vals)
})

const maxRentToValue = computed(() => {
	const vals = filteredRentToValue.value.map(x => Number(x.avg_rent_to_home_value) || 0)
	return Math.max(0.0001, ...vals)
})

const maxHomeValue = computed(() => {
	const vals = filteredHomeValue.value.map(x => Number(x.avg_home_value_index) || 0)
	return Math.max(1, ...vals)
})

const toPercentWidth = (value: number, maxValue: number) => {
	const v = Math.abs(Number(value) || 0)
	const m = Number(maxValue) || 1
	return Math.min(100, (v / m) * 100)
}

const filteredHomeValueGrowth = computed(() => applyMetroFilter(homeValueGrowthData.value))
const filteredPopulationGrowth = computed(() => applyMetroFilter(populationGrowthData.value))

const filteredRentToValue = computed(() => {
	const rows = applyMetroFilter(rentToValueData.value)
	const [minV, maxV] = rentToValueRange.value
	return rows.filter(r => {
		const v = Number(r.avg_rent_to_home_value) || 0
		return v >= minV && v <= maxV
	})
})

const filteredHomeValue = computed(() => {
	const rows = applyMetroFilter(homeValueData.value)
	const [minV, maxV] = homeValueRange.value
	return rows.filter(r => {
		const v = Number(r.avg_home_value_index) || 0
		return v >= minV && v <= maxV
	})
})
</script>
<style scoped lang="scss">
	.msa-page {
		width: 100%;
		min-height: 100vh;
		background: #fff;
	}

	.msa-container {
		max-width: 1440px;
		margin: 0 auto;
		padding: 18px 20px 24px;
	}

	.header-section {
		text-align: center;
		margin-bottom: 10px;

		.title {
			font-size: 22px;
			font-weight: 700;
			margin: 0;
			color: #1a1a1a;
		}
	}

	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 18px;
		align-items: center;
		justify-content: center;
		padding: 10px 14px;
		border: 1px solid #eee;
		border-radius: 10px;
		background: #fafafa;
		margin-bottom: 16px;
	}

	.filter-group {
		display: flex;
		align-items: center;
		gap: 10px;

		.label {
			font-size: 13px;
			color: #333;
			font-weight: 600;
			white-space: nowrap;
		}

		.value {
			font-size: 12px;
			color: #666;
			min-width: 80px;
			text-align: right;
			white-space: nowrap;
		}

		&.wide {
			min-width: 360px;
		}
	}

	:deep(.el-input-number.w-20) {
		width: 90px;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 18px;
	}

	.panel {
		border: 1px solid #eee;
		border-radius: 10px;
		background: #fff;
		overflow: hidden;
		min-height: 380px;
		display: flex;
		flex-direction: column;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 14px;
		border-bottom: 1px solid #f1f1f1;
	}

	.year-pickers {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.year-picker {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.year-label {
		font-size: 12px;
		color: #666;
		white-space: nowrap;
	}

	.panel-title {
		font-size: 14px;
		font-weight: 700;
		color: #333;
	}

	.range {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.range-label {
		font-size: 12px;
		color: #666;
		white-space: nowrap;
	}

	.range-value {
		font-size: 12px;
		color: #666;
		white-space: nowrap;
	}

	.panel-body {
		padding: 10px 12px 12px;
		flex: 1;
		min-height: 0;
	}

	.table-header {
		display: flex;
		align-items: center;
		font-size: 12px;
		color: #888;
		padding: 6px 4px 8px;
		border-bottom: 1px solid #eee;
		font-weight: 600;
	}

	.table-body {
		overflow: auto;
		max-height: 560px;
		min-height: 0;
	}

	.table-row {
		display: flex;
		align-items: center;
		padding: 7px 4px;
		border-bottom: 1px solid #fafafa;
		font-size: 13px;
		color: #333;

		&:hover {
			background: #f7f8fb;
		}
	}

	.home-value-gain,
	.population-growth {
		.col-metro {
			flex: 1;
			min-width: 180px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			padding-right: 10px;
		}

		.col-base,
		.col-current {
			width: 110px;
			white-space: nowrap;
			text-align: right;
			color: #666;
		}

		.col-rate {
			width: 190px;
			padding-left: 10px;
		}
	}

	.bar-line {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.bar-wrap {
		flex: 1;
		height: 12px;
		background: #f2f2f2;
		border-radius: 6px;
		overflow: hidden;
	}

	.bar {
		height: 100%;
		border-radius: 6px;
		min-width: 2px;
	}

	.bar-text {
		font-size: 12px;
		color: #666;
		white-space: nowrap;
		min-width: 58px;
		text-align: right;
	}

	.bar-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		overflow: auto;
		max-height: 560px;
		min-height: 0;
		padding-right: 4px;
	}

	.bar-row {
		display: grid;
		grid-template-columns: 1fr 220px 70px;
		align-items: center;
		gap: 10px;
	}

	.bar-label {
		font-size: 12px;
		color: #666;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.bar-val {
		font-size: 12px;
		color: #444;
		white-space: nowrap;
		text-align: right;
	}

	.empty {
		padding: 18px 0;
		text-align: center;
		color: #999;
		font-size: 13px;
	}

	@media (max-width: 1100px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
