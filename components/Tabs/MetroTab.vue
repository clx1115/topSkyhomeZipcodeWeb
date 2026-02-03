<template>
	<div class="charts-section">
		<div class="filter-section">
			<div class="section-title">Housing Metrics Ranking (Top {{ topN }})</div>
			<div class="controls">
				<div class="control-item">
					<span class="label">Top n</span>
					<el-input-number 
						:model-value="topN"
						@update:model-value="$emit('update:topN', $event)"
						:min="1" 
						:max="100" 
						controls-position="right" 
						size="default" 
						class="w-20" 
					/>
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

		<div class="chart-row">
			<!-- Chart 1: Home Value Gain Ranking -->
			<HomeValueGainRanking 
				:data="rankingData" 
				:baseYear="rankingBaseYear"
				:currentYear="rankingCurrentYear"
				:yearList="yearList"
				@update:baseYear="$emit('update:rankingBaseYear', $event)"
				@update:currentYear="$emit('update:rankingCurrentYear', $event)"
				@showTooltip="(e, item, type) => $emit('showTooltip', e, item, type)"
				@moveTooltip="(e) => $emit('moveTooltip', e)"
				@hideTooltip="() => $emit('hideTooltip')"
			/>
			
			<!-- Chart 2: Rent to Home Value Ranking -->
			<RentToHomeValueRanking 
				:data="rentToValueData"
				@showTooltip="(e, item, type) => $emit('showTooltip', e, item, type)"
				@moveTooltip="(e) => $emit('moveTooltip', e)"
				@hideTooltip="() => $emit('hideTooltip')"
			/>

			<!-- Chart 3: Home Value Ranking -->
			<HomeValueRanking
				:data="homeValueData"
				@showTooltip="(e, item, type) => $emit('showTooltip', e, item, type)"
				@moveTooltip="(e) => $emit('moveTooltip', e)"
				@hideTooltip="() => $emit('hideTooltip')"
			/>

			<!-- Chart 4: Rent Ranking -->
			<RentRanking
				:data="rentData"
				@showTooltip="(e, item, type) => $emit('showTooltip', e, item, type)"
				@moveTooltip="(e) => $emit('moveTooltip', e)"
				@hideTooltip="() => $emit('hideTooltip')"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import HomeValueGainRanking from '@/components/RankingCharts/HomeValueGainRanking.vue'
import RentToHomeValueRanking from '@/components/RankingCharts/RentToHomeValueRanking.vue'
import HomeValueRanking from '@/components/RankingCharts/HomeValueRanking.vue'
import RentRanking from '@/components/RankingCharts/RentRanking.vue'
import { type PropType } from 'vue'

defineProps({
	rankingData: { type: Array as PropType<any[]>, default: () => [] },
	rentToValueData: { type: Array as PropType<any[]>, default: () => [] },
	homeValueData: { type: Array as PropType<any[]>, default: () => [] },
	rentData: { type: Array as PropType<any[]>, default: () => [] },
	rankingBaseYear: { type: Number, default: 2024 },
	rankingCurrentYear: { type: Number, default: 2025 },
	yearList: { type: Array as PropType<number[]>, default: () => [] },
	// Filter props
	topN: { type: Number, default: 15 },
	selectedMetros: { type: Array as PropType<string[]>, default: () => [] },
	selectedZipcodes: { type: Array as PropType<string[]>, default: () => [] },
	metroList: { type: Array as PropType<string[]>, default: () => [] },
	zipcodeList: { type: Array as PropType<string[]>, default: () => [] }
})

defineEmits([
	'update:rankingBaseYear', 'update:rankingCurrentYear', 
	'showTooltip', 'moveTooltip', 'hideTooltip',
	'update:topN', 'update:selectedMetros', 'update:selectedZipcodes',
	'search:metro', 'search:zipcode'
])
</script>

<style scoped lang="scss">
.charts-section {
	padding: 20px 40px;
	margin-bottom: 20px;
	
	.filter-section {
		margin-bottom: 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.section-title {
			font-size: 18px;
			font-weight: 600;
			color: #333;
		}

		.controls {
			display: flex;
			gap: 20px;
			align-items: center;

			.control-item {
				display: flex;
				align-items: center;
				gap: 10px;

				.label {
					font-size: 14px;
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

	.chart-row {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
	}
}

.custom-option-item {
	display: flex;
	align-items: center;
	padding: 5px 0;
}
</style>