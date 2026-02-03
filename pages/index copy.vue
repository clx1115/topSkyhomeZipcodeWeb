<template>
	<div class="matechat-box">
		<div class="matechat-container">
			<div class="header-section">
				<h1 class="title">Housing Data By Zipcode</h1>
				<p class="subtitle">After you finalize your targeted metropolitan, dig into the region by comparing data for different zip code</p>
			</div>
			
			<div class="metrics-container">
				<div class="metrics-bar">
					<div class="tabs-wrapper">
						<div class="metric-item" 
							v-for="item in tabs" 
							:key="item" 
							:class="{ active: currentTab === item }" 
							@click="currentTab = item">
							{{ item }}
						</div>
					</div>
				</div>
			</div>

			<ClientOnly>
				<!-- Custom Tooltip -->
				<div 
					v-if="tooltip.visible" 
					class="custom-tooltip"
					:style="{ transform: `translate3d(${tooltip.x}px, ${tooltip.y}px, 0)` }"
				>
					<div class="tooltip-row">
						<span class="tooltip-label">Metro:</span>
						<span class="tooltip-value">{{ tooltip.data.metro }}</span>
					</div>
					<div class="tooltip-row">
						<span class="tooltip-label">City:</span>
						<span class="tooltip-value">{{ tooltip.data.city }}</span>
					</div>
					<div class="tooltip-row">
						<span class="tooltip-label">Zipcode:</span>
						<span class="tooltip-value">{{ tooltip.data.zipcode }}</span>
					</div>
					
					<!-- Type Specific Info -->
					<template v-if="tooltip.type === 'growth'">
						<div class="tooltip-row">
							<span class="tooltip-label">Home Value % Increase:</span>
							<span class="tooltip-value">{{ (tooltip.data.growth_rate || 0).toFixed(1) }}%</span>
						</div>
						<div class="tooltip-row" v-if="tooltip.data.base_value">
							<span class="tooltip-label">Base Year Value:</span>
							<span class="tooltip-value">${{ Math.round(tooltip.data.base_value / 1000).toLocaleString() }}K</span>
						</div>
						<div class="tooltip-row" v-if="tooltip.data.current_value">
							<span class="tooltip-label">Current Year Value:</span>
							<span class="tooltip-value">${{ Math.round(tooltip.data.current_value / 1000).toLocaleString() }}K</span>
						</div>
					</template>

					<template v-else-if="tooltip.type === 'rent_to_value'">
						<div class="tooltip-row">
							<span class="tooltip-label">Rent to Home Value:</span>
							<span class="tooltip-value">{{ ((tooltip.data.value || 0) * 100).toFixed(1) }}%</span>
						</div>
					</template>

					<template v-else-if="tooltip.type === 'home_value'">
						<div class="tooltip-row">
							<span class="tooltip-label">Home Value:</span>
							<span class="tooltip-value">${{ Math.round((tooltip.data.value || 0) / 1000).toLocaleString() }}K</span>
						</div>
					</template>

					<template v-else-if="tooltip.type === 'rent'">
						<div class="tooltip-row">
							<span class="tooltip-label">Rent:</span>
							<span class="tooltip-value">${{ Math.round(tooltip.data.value || 0).toLocaleString() }}</span>
						</div>
					</template>
				</div>

				<div class="filter-section">
					<div class="section-title">Housing Metrics Ranking (Top {{ topN }})</div>
					<div class="controls">
						<div class="control-item">
							<span class="label">Top n</span>
							<el-input-number v-model="topN" :min="1" :max="100" controls-position="right" size="default" class="w-20" />
						</div>
						<div class="control-item">
							<span class="label">Metro</span>
							<el-select
								v-model="selectedMetros"
								multiple
								collapse-tags
								collapse-tags-tooltip
								placeholder="Select Metro"
								style="width: 240px"
								size="default"
								filterable
								:filter-method="filterMetros"
							>
								<el-option
									v-for="item in metroList"
									:key="item"
									:label="item"
									:value="item"
								>
									<div class="custom-option-item">
										<el-checkbox :model-value="selectedMetros.includes(item)" size="small" style="pointer-events: none; margin-right: 8px;" />
										<span class="option-text">{{ item }}</span>
									</div>
								</el-option>
							</el-select>
						</div>
						<div class="control-item">
							<span class="label">Zipcode</span>
							<el-select
								v-model="selectedZipcodes"
								multiple
								collapse-tags
								collapse-tags-tooltip
								placeholder="(All)"
								style="width: 160px"
								size="default"
								filterable
								:filter-method="filterZipcodes"
							>
								<el-option
									v-for="item in zipcodeList"
									:key="item"
									:label="item"
									:value="item"
								>
									<div class="custom-option-item">
										<el-checkbox :model-value="selectedZipcodes.includes(item)" size="small" style="pointer-events: none; margin-right: 8px;" />
										<span class="option-text">{{ item }}</span>
									</div>
								</el-option>
							</el-select>
						</div>
					</div>
				</div>

				<!-- Charts Section -->
				<div class="charts-section">
					<div class="chart-row">
						<!-- Chart 1: Home Value Gain Ranking -->
						<div class="chart-item">
							<div class="chart-header">
								<h3>Home Value Gain Ranking</h3>
								<div class="chart-filters">
									<div class="year-filter">
										<span>Base Year</span>
										<el-select v-model="rankingBaseYear" size="small" style="width: 75px">
											<el-option v-for="year in yearList" :key="year" :label="year" :value="year" />
										</el-select>
									</div>
									<div class="year-filter">
										<span>Current Year</span>
										<el-select v-model="rankingCurrentYear" size="small" style="width: 75px">
											<el-option v-for="year in yearList" :key="year" :label="year" :value="year" />
										</el-select>
									</div>
								</div>
							</div>
							<div class="chart-content">
								<div class="ranking-table-header">
									<span class="col-zip">Zipcode</span>
									<span class="col-city">City</span>
									<span class="col-metro">Metro</span>
									<span class="col-growth"></span>
								</div>
								<div class="ranking-table-body">
									<div 
										v-for="(item, index) in rankingData" 
										:key="index" 
										class="ranking-row"
										@mouseenter="showTooltip($event, item, 'growth')"
										@mousemove="moveTooltip"
										@mouseleave="hideTooltip"
									>
										<span class="col-zip">{{ item.zipcode }}</span>
										<span class="col-city">{{ item.city }}</span>
										<span class="col-metro">{{ item.metro }}</span>
										<div class="col-growth">
											<div class="diverging-bar-container">
												<div class="bar-side left">
													<template v-if="(item.growth_rate || 0) < 0">
														<span class="growth-text negative">{{ (item.growth_rate || 0).toFixed(1) }}%</span>
														<div 
															class="growth-bar negative" 
															:style="{ width: (Math.abs(item.growth_rate || 0) / maxGrowthVal * 100) + '%' }"
														></div>
													</template>
												</div>
												<div class="axis-line"></div>
												<div class="bar-side right">
													<template v-if="(item.growth_rate || 0) >= 0">
														<div 
															class="growth-bar positive" 
															:style="{ width: (Math.abs(item.growth_rate || 0) / maxGrowthVal * 100) + '%' }"
														></div>
														<span class="growth-text positive">{{ (item.growth_rate || 0).toFixed(1) }}%</span>
													</template>
												</div>
											</div>
										</div>
									</div>
									<div v-if="rankingData.length === 0" class="no-data">
										No data available
									</div>
								</div>
							</div>
						</div>
						
						<!-- Chart 2: Rent to Home Value Ranking -->
						<div class="chart-item">
							<div class="chart-header">
								<h3>Rent to Home Value Ranking</h3>
							</div>
							<div class="chart-content">
								<div class="ranking-table-header">
									<span class="col-zip">Zipcode</span>
									<span class="col-city">City</span>
									<span class="col-metro">Metro</span>
									<span class="col-growth"></span>
								</div>
								<div class="ranking-table-body">
									<div 
										v-for="(item, index) in rentToValueData" 
										:key="index" 
										class="ranking-row"
										@mouseenter="showTooltip($event, item, 'rent_to_value')"
										@mousemove="moveTooltip"
										@mouseleave="hideTooltip"
									>
										<span class="col-zip">{{ item.zipcode }}</span>
										<span class="col-city">{{ item.city }}</span>
										<span class="col-metro">{{ item.metro }}</span>
										<div class="col-growth">
											<div class="growth-bar-container">
												<div 
													class="growth-bar" 
													:style="{ width: ((item.value || 0) / maxRentToValueVal * 100) + '%', backgroundColor: getBarColor(index) }"
												></div>
												<span class="growth-text">{{ ((item.value || 0) * 100).toFixed(1) }}%</span>
											</div>
										</div>
									</div>
									<div v-if="rentToValueData.length === 0" class="no-data">
										No data available
									</div>
								</div>
							</div>
						</div>

						<!-- Chart 3: Home Value Ranking -->
						<div class="chart-item">
							<div class="chart-header">
								<h3>Home Value Ranking</h3>
							</div>
							<div class="chart-content">
								<div class="ranking-table-header">
									<span class="col-zip">Zipcode</span>
									<span class="col-city">City</span>
									<span class="col-metro">Metro</span>
									<span class="col-growth"></span>
								</div>
								<div class="ranking-table-body">
									<div 
										v-for="(item, index) in homeValueData" 
										:key="index" 
										class="ranking-row"
										@mouseenter="showTooltip($event, item, 'home_value')"
										@mousemove="moveTooltip"
										@mouseleave="hideTooltip"
									>
										<span class="col-zip">{{ item.zipcode }}</span>
										<span class="col-city">{{ item.city }}</span>
										<span class="col-metro">{{ item.metro }}</span>
										<div class="col-growth">
											<div class="growth-bar-container">
												<div 
													class="growth-bar" 
													:style="{ width: ((item.value || 0) / maxHomeValueVal * 100) + '%', backgroundColor: getBarColor(index) }"
												></div>
												<span class="growth-text">${{ Math.round((item.value || 0) / 1000).toLocaleString() }}K</span>
											</div>
										</div>
									</div>
									<div v-if="homeValueData.length === 0" class="no-data">
										No data available
									</div>
								</div>
							</div>
						</div>

						<!-- Chart 4: Rent Ranking -->
						<div class="chart-item">
							<div class="chart-header">
								<h3>Rent Ranking</h3>
							</div>
							<div class="chart-content">
								<div class="ranking-table-header">
									<span class="col-zip">Zipcode</span>
									<span class="col-city">City</span>
									<span class="col-metro">Metro</span>
									<span class="col-growth"></span>
								</div>
								<div class="ranking-table-body">
									<div 
										v-for="(item, index) in rentData" 
										:key="index" 
										class="ranking-row"
										@mouseenter="showTooltip($event, item, 'rent')"
										@mousemove="moveTooltip"
										@mouseleave="hideTooltip"
									>
										<span class="col-zip">{{ item.zipcode }}</span>
										<span class="col-city">{{ item.city }}</span>
										<span class="col-metro">{{ item.metro }}</span>
										<div class="col-growth">
											<div class="growth-bar-container">
												<div 
													class="growth-bar" 
													:style="{ width: ((item.value || 0) / maxRentVal * 100) + '%', backgroundColor: getBarColor(index) }"
												></div>
												<span class="growth-text">${{ Math.round(item.value || 0).toLocaleString() }}</span>
											</div>
										</div>
									</div>
									<div v-if="rentData.length === 0" class="no-data">
										No data available
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</ClientOnly>
		</div>
	</div>
</template>
<script setup lang="ts">
	import { getZipcodeMetrosList, getZipcodeList, growthRate, zipcodeRank } from "@/api/charts"
	import { ref, onMounted, watch, computed } from 'vue'

	const tabs = ['Metro','Home Value Gain', 'Rent to Home Value', 'Home Value', 'Rent']
	const currentTab = ref('Metro')
	
	const topN = ref(15)
	const selectedMetros = ref<string[]>([])
	const selectedZipcodes = ref<string[]>([])
	
	// 完整数据列表
	const fullMetroList = ref<string[]>([])
	const fullZipcodeList = ref<string[]>([])
	// 显示的数据列表（限制数量）
	const metroList = ref<string[]>([])
	const zipcodeList = ref<string[]>([])

	// Ranking Chart Data
	const rankingData = ref<any[]>([])
	const rankingBaseYear = ref(2024)
	const rankingCurrentYear = ref(2025)
	const yearList = Array.from({ length: 11 }, (_, i) => 2015 + i).reverse() // 2025 down to 2015

	// Other Charts Data
	const rentToValueData = ref<any[]>([])
	const homeValueData = ref<any[]>([])
	const rentData = ref<any[]>([])

	const barColors = [
		'#8884d8', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658',
		'#ff7300', '#ff0000', '#0088fe', '#00c49f', '#ffbb28', '#ff8042',
		'#413ea0', '#f50057', '#7c4dff', '#00b0ff'
	]

	const getBarColor = (index: number) => {
		return barColors[index % barColors.length]
	}

	// 搜索过滤方法
	const filterMetros = (query: string) => {
		if (query) {
			metroList.value = fullMetroList.value
				.filter(item => item.toLowerCase().includes(query.toLowerCase()))
				.slice(0, 100)
		} else {
			metroList.value = fullMetroList.value.slice(0, 50)
		}
	}

	const filterZipcodes = (query: string) => {
		if (query) {
			zipcodeList.value = fullZipcodeList.value
				.filter(item => item.toLowerCase().includes(query.toLowerCase()))
				.slice(0, 100)
		} else {
			zipcodeList.value = fullZipcodeList.value.slice(0, 50)
		}
	}

	const fetchFilterData = async () => {
		const allOption = "(All)"
		
		// 获取 Metro 列表
		try {
			const metroRes: any = await getZipcodeMetrosList()
			const metros = metroRes?.data || metroRes || []
			// 添加 (All) 选项
			fullMetroList.value = Array.isArray(metros) ? [allOption, ...metros] : [allOption]
			metroList.value = fullMetroList.value.slice(0, 50)
		} catch (error: any) {
			// 修复：如果接口直接返回数组，请求封装可能会将其视为错误抛出
			if (Array.isArray(error)) {
				fullMetroList.value = [allOption, ...error]
				metroList.value = fullMetroList.value.slice(0, 50)
			} else {
				console.error("Failed to fetch metro data:", error)
			}
		}

		// 设置默认选中
		const defaultMetro = "Austin-Round Rock-Georgetown, TX"
		if (selectedMetros.value.length === 0) {
			if (fullMetroList.value.includes(defaultMetro)) {
				selectedMetros.value = [defaultMetro]
			} else if (fullMetroList.value.includes(allOption)) {
				selectedMetros.value = [allOption]
			}
		}

		// 获取 Zipcode 列表
		try {
			const zipcodeRes: any = await getZipcodeList()
			const zipcodes = zipcodeRes?.data || zipcodeRes || []
			// 添加 (All) 选项
			fullZipcodeList.value = Array.isArray(zipcodes) ? [allOption, ...zipcodes] : [allOption]
			zipcodeList.value = fullZipcodeList.value.slice(0, 50)
		} catch (error: any) {
			if (Array.isArray(error)) {
				fullZipcodeList.value = [allOption, ...error]
				zipcodeList.value = fullZipcodeList.value.slice(0, 50)
			} else {
				console.error("Failed to fetch zipcode data:", error)
			}
		}

		// 设置 Zipcode 默认选中 (All)
		if (fullZipcodeList.value.includes(allOption) && selectedZipcodes.value.length === 0) {
			selectedZipcodes.value = [allOption]
		}
	}

	const fetchRankingData = async () => {
		try {
			// 处理参数
			const metros = selectedMetros.value.includes('(All)') ? '' : selectedMetros.value.join(',')
			const zipcodes = selectedZipcodes.value.includes('(All)') ? '' : selectedZipcodes.value.join(',')
			
			const params = {
				base_year: rankingBaseYear.value,
				current_year: rankingCurrentYear.value,
				metro: metros,
				zipcode: zipcodes,
				top: topN.value
			}
			
			const res: any = await growthRate(params)
			rankingData.value = res?.data || res || []
		} catch (error) {
			console.error("Failed to fetch ranking data:", error)
			rankingData.value = []
		}
	}

	const fetchOtherChartsData = async () => {
		try {
			const metros = selectedMetros.value.includes('(All)') ? '' : selectedMetros.value.join(',')
			const zipcodes = selectedZipcodes.value.includes('(All)') ? '' : selectedZipcodes.value.join(',')
			const baseParams = {
				metro: metros,
				zipcode: zipcodes,
				top: topN.value,
				current_year: rankingCurrentYear.value
			}

			// Rent to Home Value
			const rentToValueRes: any = await zipcodeRank({ ...baseParams, dimension: 'rent_to_value' })
			rentToValueData.value = rentToValueRes?.data || rentToValueRes || []

			// Home Value
			const homeValueRes: any = await zipcodeRank({ ...baseParams, dimension: 'home_value' })
			homeValueData.value = homeValueRes?.data || homeValueRes || []

			// Rent
			const rentRes: any = await zipcodeRank({ ...baseParams, dimension: 'rent' })
			rentData.value = rentRes?.data || rentRes || []

		} catch (error) {
			console.error("Failed to fetch other charts data:", error)
		}
	}

	// Computed Max Values for scaling
	const maxGrowthVal = computed(() => {
		if (!rankingData.value.length) return 1
		return Math.max(...rankingData.value.map(item => Math.abs(item.growth_rate || 0))) || 1
	})

	const maxRentToValueVal = computed(() => {
		if (!rentToValueData.value.length) return 1
		return Math.max(...rentToValueData.value.map(item => Number(item.value) || 0)) || 1
	})

	const maxHomeValueVal = computed(() => {
		if (!homeValueData.value.length) return 1
		return Math.max(...homeValueData.value.map(item => Number(item.value) || 0)) || 1
	})

	const maxRentVal = computed(() => {
		if (!rentData.value.length) return 1
		return Math.max(...rentData.value.map(item => Number(item.value) || 0)) || 1
	})

	// Tooltip State
	const tooltip = ref({
		visible: false,
		x: 0,
		y: 0,
		data: null as any,
		type: ''
	})

	let tooltipTimeout: any = null

	const showTooltip = (event: MouseEvent, item: any, type: string) => {
		if (tooltipTimeout) {
			clearTimeout(tooltipTimeout)
			tooltipTimeout = null
		}
		tooltip.value.visible = true
		tooltip.value.data = item
		tooltip.value.type = type
		updateTooltipPosition(event)
	}

	const moveTooltip = (event: MouseEvent) => {
		updateTooltipPosition(event)
	}

	const updateTooltipPosition = (event: MouseEvent) => {
		const offset = 15
		const tooltipWidth = 320 // Estimated max width
		const tooltipHeight = 220 // Estimated max height
		
		let x = event.clientX + offset
		let y = event.clientY + offset
		
		// Check horizontal overflow
		if (x + tooltipWidth > window.innerWidth) {
			x = event.clientX - tooltipWidth - offset
		}
		
		// Check vertical overflow
		if (y + tooltipHeight > window.innerHeight) {
			y = event.clientY - tooltipHeight - offset
		}
		
		tooltip.value.x = x
		tooltip.value.y = y
	}

	const hideTooltip = () => {
		tooltipTimeout = setTimeout(() => {
			tooltip.value.visible = false
		}, 100)
	}

	// Debounce Logic
	let debounceTimer: any = null
	
	const debouncedFetch = () => {
		if (debounceTimer) clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			fetchRankingData()
			fetchOtherChartsData()
		}, 2000)
	}

	// Watchers for Ranking Chart
	watch([rankingBaseYear, rankingCurrentYear, topN, selectedMetros, selectedZipcodes], () => {
		debouncedFetch()
	})

	onMounted(async () => {
		await fetchFilterData()
		await fetchRankingData()
		await fetchOtherChartsData()
	})
</script>
<style scoped lang="scss">
	.matechat-box {
		width: 100%;
		height: 100vh;
		padding: 0;
		overflow: hidden;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		background-color: #fff;
	}

	.matechat-container {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;
		min-height: 0;
		max-width: 1440px;
		margin: 0 auto;
		width: 100%;

		/* Hide scrollbar */
		&::-webkit-scrollbar {
			display: none;
		}
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.header-section {
		width: 100%;
		padding: 20px 20px 10px;
		text-align: center;

		.title {
			font-size: 32px;
			font-weight: 700;
			color: #1a1a1a;
			margin: 0 0 8px 0;
			line-height: 1.2;
		}

		.subtitle {
			font-size: 16px;
			color: #666;
			font-weight: 400;
			margin: 0;
			line-height: 1.5;
			max-width: 1200px;
			margin: 0 auto;
		}
	}

	.metrics-container {
		display: flex;
		justify-content: center;
		padding: 0 20px;
		margin-bottom: 15px;
	}

	.metrics-bar {
		display: flex;
		align-items: center;
		background-color: #f8f9fa;
		padding: 4px;
		border-radius: 12px;
		border: 1px solid #eee;
		box-shadow: 0 2px 4px rgba(0,0,0,0.02);
	}

	.metric-label {
		padding: 8px 20px;
		font-weight: 600;
		color: #333;
		font-size: 14px;
		user-select: none;
	}

	.tabs-wrapper {
		display: flex;
		gap: 4px;
	}

	.metric-item {
		padding: 8px 20px;
		cursor: pointer;
		border-radius: 8px;
		font-size: 14px;
		color: #666;
		transition: all 0.2s ease;
		font-weight: 500;
		user-select: none;

		&:hover {
			color: #000;
			background-color: rgba(0, 0, 0, 0.05);
		}

		&.active {
			background-color: #fff;
			color: #000;
			font-weight: 600;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		}
	}

	.filter-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 40px;
		border-bottom: 1px solid #f0f0f0;
		background-color: #fff;

		.section-title {
			font-size: 18px;
			color: #333;
			font-weight: 600;
		}

		.controls {
			display: flex;
			align-items: center;
			gap: 24px;

			.control-item {
				display: flex;
				align-items: center;
				gap: 12px;

				.label {
					font-size: 14px;
					color: #666;
					font-weight: 500;
				}
			}
		}
	}
	
	:deep(.el-input-number.w-20) {
		width: 100px;
	}

	.custom-option-item {
		display: flex;
		align-items: center;
		width: 100%;
	}

	.option-text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	// Charts Section Styles
	.charts-section {
		padding: 20px 40px;
		margin-bottom: 20px;
		
		.chart-row {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 20px;
		}
		
		.chart-item {
			background: #fff;
			border-radius: 8px;
			// border: 1px solid #eee;
			// padding: 15px;
			min-height: 400px;
			
			&.placeholder {
				border: 2px dashed #eee;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #ccc;
			}
		}
	}

	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 15px;
		flex-wrap: wrap;
		gap: 10px;
		
		h3 {
			font-size: 16px;
			font-weight: 600;
			color: #333;
			margin: 0;
			flex: 1;
		}
		
		.chart-filters {
			display: flex;
			gap: 10px;
			
			.year-filter {
				display: flex;
				align-items: center;
				gap: 5px;
				
				span {
					font-size: 12px;
					color: #666;
				}
			}
		}
	}

	.ranking-table-header {
		display: flex;
		padding-bottom: 8px;
		border-bottom: 1px solid #eee;
		font-size: 12px;
		color: #666;
		font-weight: 500;
		
		span {
			padding: 0 4px;
		}
		
		.col-zip { width: 15%; }
		.col-city { width: 20%; }
		.col-metro { width: 40%; }
		.col-growth { width: 25%; text-align: right; }
	}

	.ranking-table-body {
		max-height: 560px;
		overflow-y: auto;
		
		/* Hide scrollbar */
		&::-webkit-scrollbar {
			display: none;
		}
		-ms-overflow-style: none;
		scrollbar-width: none;
		
		.ranking-row {
			display: flex;
			align-items: center;
			padding: 6px 0;
			font-size: 13px;
			color: #333;
			border-bottom: 1px solid #f9f9f9;
			
			&:hover {
				background-color: #f8f9fa;
			}
			
			span {
				padding: 0 4px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			
			.col-zip { width: 15%; color: #666; }
			.col-city { width: 20%; }
			.col-metro { width: 40%; color: #666; font-size: 12px; }
			.col-growth { 
				width: 25%; 
				display: flex; 
				justify-content: flex-end;
			}
		}
	}

	.custom-tooltip {
		position: fixed;
		top: 0;
		left: 0;
		background-color: #fff;
		border: 1px solid #e0e0e0;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		padding: 12px;
		border-radius: 4px;
		z-index: 9999;
		pointer-events: none;
		font-size: 13px;
		min-width: 200px;
		max-width: 320px;
		will-change: transform;
		
		.tooltip-row {
			display: flex;
			justify-content: space-between;
			margin-bottom: 6px;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.tooltip-label {
				color: #666;
				margin-right: 12px;
			}
			
			.tooltip-value {
				color: #333;
				font-weight: 500;
				text-align: right;
			}
		}
	}

	.diverging-bar-container {
		display: flex;
		align-items: center;
		width: 100%;
		height: 100%;
		
		.axis-line {
			width: 1px;
			height: 100%;
			background-color: #eee;
			margin: 0 4px;
		}
		
		.bar-side {
			flex: 1;
			display: flex;
			align-items: center;
			min-width: 0; /* Prevents overflow */
			
			&.left {
				justify-content: flex-end;
				
				.growth-bar {
					border-top-left-radius: 2px;
					border-bottom-left-radius: 2px;
					background-color: #f06292; /* Pink/Red for negative */
				}
				
				.growth-text {
					margin-right: 4px;
				}
			}
			
			&.right {
				justify-content: flex-start;
				
				.growth-bar {
					border-top-right-radius: 2px;
					border-bottom-right-radius: 2px;
					background-color: #81c784; /* Green for positive */
				}
				
				.growth-text {
					margin-left: 4px;
				}
			}
		}
		
		.growth-bar {
			height: 12px;
			min-width: 2px;
		}
		
		.growth-text {
			font-size: 12px;
			color: #333;
			white-space: nowrap;
		}
	}

	.growth-bar-container {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		width: 100%;
		gap: 8px;
		
		.growth-bar {
			height: 16px;
			border-radius: 2px;
			min-width: 2px;
			
			&.positive {
				background-color: #4db6ac; // Teal for positive
			}
			
			&.negative {
				background-color: #e57373; // Red for negative
			}
		}
		
		.growth-text {
			font-size: 12px;
			color: #333;
			min-width: 40px;
			text-align: left;
			white-space: nowrap;
		}
	}

	.no-data {
		padding: 20px;
		text-align: center;
		color: #999;
		font-size: 14px;
	}

	/* Fix for Select Height Issue */
	.controls {
		:deep(.el-select__tags-text) {
			display: inline-block;
			max-width: 140px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			vertical-align: middle;
		}
	}
</style>