<template>
	<div class="home-value-gain-tab">
		<div class="filter-header">
			<div class="section-title">Accumulative Home Value Gain</div>
			<div class="controls">
				<div class="control-item">
					<span class="label">Base Year</span>
					<el-select
						:model-value="baseYear"
						@update:model-value="$emit('update:baseYear', $event)"
						size="default"
						style="width: 100px"
					>
						<el-option
							v-for="year in yearList"
							:key="year"
							:label="year"
							:value="year"
						/>
					</el-select>
				</div>
				<div class="control-item">
					<span class="label">Current Year</span>
					<el-select
						:model-value="currentYear"
						@update:model-value="$emit('update:currentYear', $event)"
						size="default"
						style="width: 100px"
					>
						<el-option
							v-for="year in yearList"
							:key="year"
							:label="year"
							:value="year"
						/>
					</el-select>
				</div>
				<div class="control-item">
					<span class="label">Metro</span>
					<el-select
						:model-value="selectedMetros"
						@update:model-value="$emit('update:selectedMetros', $event)"
						multiple
						collapse-tags
						collapse-tags-tooltip
						placeholder="Select Metro"
						style="width: 240px"
						size="default"
						filterable
						:filter-method="(query) => $emit('search:metro', query)"
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
						:model-value="selectedZipcodes"
						@update:model-value="$emit('update:selectedZipcodes', $event)"
						multiple
						collapse-tags
						collapse-tags-tooltip
						placeholder="(All)"
						style="width: 160px"
						size="default"
						filterable
						:filter-method="(query) => $emit('search:zipcode', query)"
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

		<div class="content-container">
			<div class="left-panel">
				<!-- Map Placeholder -->
				<div class="map-placeholder">
					<div class="placeholder-content">
						<i class="el-icon-map-location"></i>
						<span>Map Module Placeholder</span>
					</div>
				</div>
			</div>
			<div class="right-panel">
				<div class="chart-top">
					<HomeValueGainRanking 
						:data="data" 
						:baseYear="baseYear"
						:currentYear="currentYear"
						:yearList="yearList"
						:showFilters="false"
						@update:baseYear="$emit('update:baseYear', $event)"
						@update:currentYear="$emit('update:currentYear', $event)"
						@showTooltip="(e, item, type) => $emit('showTooltip', e, item, type)"
						@moveTooltip="(e) => $emit('moveTooltip', e)"
						@hideTooltip="() => $emit('hideTooltip')"
					/>
				</div>
				<div class="chart-bottom">
					<HomeValueGainTrend 
						:baseYear="baseYear"
						:currentYear="currentYear"
						:selectedMetros="selectedMetros"
						:selectedZipcodes="selectedZipcodes"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import HomeValueGainRanking from '@/components/RankingCharts/HomeValueGainRanking.vue'
import HomeValueGainTrend from '@/components/RankingCharts/HomeValueGainTrend.vue'
import { type PropType } from 'vue'

defineProps({
	data: { type: Array as PropType<any[]>, default: () => [] },
	baseYear: { type: Number, default: 2024 },
	currentYear: { type: Number, default: 2025 },
	yearList: { type: Array as PropType<number[]>, default: () => [] },
	// Filter props
	selectedMetros: { type: Array as PropType<string[]>, default: () => [] },
	selectedZipcodes: { type: Array as PropType<string[]>, default: () => [] },
	metroList: { type: Array as PropType<string[]>, default: () => [] },
	zipcodeList: { type: Array as PropType<string[]>, default: () => [] }
})

defineEmits([
	'update:baseYear', 'update:currentYear', 
	'showTooltip', 'moveTooltip', 'hideTooltip',
	'update:selectedMetros', 'update:selectedZipcodes',
	'search:metro', 'search:zipcode'
])
</script>

<style scoped lang="scss">
.home-value-gain-tab {
	padding: 20px 40px;
	height: calc(100vh - 160px); /* Adjust based on header height */
	min-height: 600px;
	display: flex;
	flex-direction: column;
}

.filter-header {
	margin-bottom: 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;

	.section-title {
		font-size: 20px;
		font-weight: 600;
		color: #333;
	}

	.controls {
		display: flex;
		gap: 20px;
		align-items: center;

		.control-item {
			display: flex;
			flex-direction: column;
			gap: 5px;

			.label {
				font-size: 12px;
				color: #666;
			}

			/* Fix for Metro dropdown height and tag positioning */
			:deep(.el-select__wrapper) {
				min-height: 32px !important;
				height: 32px !important;
				padding: 0 8px !important;
			}
			
			:deep(.el-select__tags) {
				position: absolute !important;
				top: 0 !important;
				bottom: 0 !important;
				transform: none !important;
				margin: 0 !important;
				display: flex !important;
				flex-wrap: nowrap !important;
				align-items: center !important;
				overflow: hidden !important;
				max-width: calc(100% - 30px) !important;
			}

			:deep(.el-select__tags > span) {
				display: flex !important;
				align-items: center !important;
				flex-wrap: nowrap !important;
			}
			
			:deep(.el-tag) {
				display: inline-flex !important;
				align-items: center !important;
				justify-content: center !important;
				height: 22px !important;
				line-height: 22px !important;
				margin: 0 2px !important;
				padding: 0 4px !important;
				box-sizing: border-box !important;
			}
			
			:deep(.el-tag__content) {
				display: inline-block !important;
				max-width: 70px !important;
				overflow: hidden !important;
				text-overflow: ellipsis !important;
				white-space: nowrap !important;
			}

			:deep(.el-tag__close) {
				margin-left: 2px !important;
			}
		}
	}
}

.content-container {
	display: flex;
	gap: 20px;
	flex: 1;
	min-height: 0; /* Important for nested scrolling */
	overflow-y: auto; /* Allow scrolling if content is too tall */
}

.left-panel {
	flex: 3; /* 60% */
	background: #fff;
	border-radius: 8px;
	border: 1px solid #eee;
	overflow: hidden;
}

.right-panel {
	flex: 2; /* 40% */
	display: flex;
	flex-direction: column;
	gap: 20px;
	min-width: 0; /* Prevent flex overflow */
}

.chart-top {
	flex: 0 0 auto; /* Allow it to take necessary size */
	margin-bottom: 20px;
}

.chart-bottom {
	flex: 1;
	background: #fff;
	border-radius: 8px;
	border: 1px solid #eee;
	min-height: 400px; /* Ensure minimum visibility */
}

.map-placeholder, .line-chart-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #f8f9fa;
	color: #999;
	font-size: 16px;
	font-weight: 500;
}

.placeholder-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
}

.custom-option-item {
	display: flex;
	align-items: center;
	padding: 5px 0;
}
</style>