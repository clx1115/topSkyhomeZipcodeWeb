<template>
	<div class="rent-tab">
		<div class="filter-header">
			<div class="section-title">Rent</div>
			<div class="controls">
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
				<!-- Top: Ranking Chart -->
				<div class="chart-top">
					<RentRanking 
						:data="data" 
						@showTooltip="(e, item, type) => $emit('showTooltip', e, item, type)"
						@moveTooltip="(e) => $emit('moveTooltip', e)"
						@hideTooltip="() => $emit('hideTooltip')"
					/>
				</div>
				
				<!-- Bottom: Historical Line Chart -->
				<div class="chart-bottom">
					<div class="chart-header-row">
						<div class="chart-title">Historical Rent</div>
						<div class="chart-controls">
							<div class="mini-control">
								<span class="label">Base Year</span>
								<el-select
									:model-value="baseYear"
									@update:model-value="$emit('update:baseYear', $event)"
									size="small"
									style="width: 80px"
								>
									<el-option
										v-for="year in yearList"
										:key="year"
										:label="year"
										:value="year"
									/>
								</el-select>
							</div>
							<div class="mini-control">
								<span class="label">Current Year</span>
								<el-select
									:model-value="currentYear"
									@update:model-value="$emit('update:currentYear', $event)"
									size="small"
									style="width: 80px"
								>
									<el-option
										v-for="year in yearList"
										:key="year"
										:label="year"
										:value="year"
									/>
								</el-select>
							</div>
						</div>
					</div>
					
					<!-- Line Chart Placeholder -->
					<div class="line-chart-placeholder">
						<div class="placeholder-content">
							<i class="el-icon-data-line"></i>
							<span>Historical Line Chart Module Placeholder</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'
import RentRanking from '../RankingCharts/RentRanking.vue'

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
.rent-tab {
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;

	.filter-header {
		flex: 0 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 0;
		border-bottom: 1px solid #eee;
		margin-bottom: 15px;

		.section-title {
			font-size: 18px;
			font-weight: 600;
			color: #333;
		}

		.controls {
			display: flex;
			gap: 15px;
			align-items: center;

			.control-item {
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 8px;

				.label {
					font-size: 14px;
					color: #333;
					white-space: nowrap;
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
		flex: 1;
		display: flex;
		gap: 20px;
		overflow-y: auto;
		padding-right: 5px; /* Space for scrollbar */
	}

	.left-panel {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;

		.map-placeholder {
			flex: 1;
			background: #f5f7fa;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			border: 2px dashed #dcdfe6;
			min-height: 400px;

			.placeholder-content {
				text-align: center;
				color: #909399;

				i {
					font-size: 48px;
					margin-bottom: 10px;
					display: block;
				}
			}
		}
	}

	.right-panel {
		width: 40%;
		min-width: 400px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.chart-top {
		flex: 0 0 auto;
	}

	.chart-bottom {
		flex: 0 0 auto;
		background: #fff;
		border-radius: 8px;
		padding-top: 10px;

		.chart-header-row {
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
			margin-bottom: 10px;
			flex-wrap: wrap;
			gap: 10px;

			.chart-title {
				font-size: 14px;
				font-weight: 600;
				color: #666;
			}

			.chart-controls {
				display: flex;
				gap: 10px;

				.mini-control {
					display: flex;
					flex-direction: column;
					gap: 2px;

					.label {
						font-size: 12px;
						color: #333;
					}
				}
			}
		}

		.line-chart-placeholder {
			height: 300px;
			background: #f5f7fa;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			border: 2px dashed #dcdfe6;

			.placeholder-content {
				text-align: center;
				color: #909399;

				i {
					font-size: 32px;
					margin-bottom: 8px;
					display: block;
				}
			}
		}
	}

	.custom-option-item {
		display: flex;
		align-items: center;
		padding: 5px 0;
	}
}
</style>