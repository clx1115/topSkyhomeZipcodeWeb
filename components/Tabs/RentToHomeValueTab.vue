<template>
	<div class="rent-to-home-value-tab">
		<div class="filter-header">
			<div class="section-title">Rent to Home Value</div>
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
					<RentToHomeValueRanking 
						:data="data" 
						@showTooltip="(e, item, type) => $emit('showTooltip', e, item, type)"
						@moveTooltip="(e) => $emit('moveTooltip', e)"
						@hideTooltip="() => $emit('hideTooltip')"
					/>
				</div>
				
				<!-- Bottom: Historical Line Chart -->
				<div class="chart-bottom">
					<div class="chart-header-row">
						<div class="chart-title">Historical Rent to Home Value</div>
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
import RentToHomeValueRanking from '../RankingCharts/RentToHomeValueRanking.vue'

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
.rent-to-home-value-tab {
	padding: 20px 40px;
	height: calc(100vh - 160px);
	min-height: 900px;
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
				height: 32px;
				top: 50%;
				transform: translateY(-50%);
			}

			:deep(.el-tag) {
				margin-top: 2px !important;
				margin-bottom: 2px !important;
			}
		}
	}
}

.content-container {
	flex: 1;
	display: flex;
	gap: 20px;
	min-height: 0; /* Important for nested scrolling */

	.left-panel {
		flex: 1;
		background: #f5f7fa;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px dashed #ccc;
		
		.map-placeholder {
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			
			.placeholder-content {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 10px;
				color: #999;
				
				i {
					font-size: 48px;
				}
				
				span {
					font-size: 16px;
				}
			}
		}
	}

	.right-panel {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 20px;
		min-width: 0; /* Prevent flex overflow */

		.chart-top {
			flex: 1;
			min-height: 0;
			background: #fff;
			border-radius: 8px;
			// border: 1px solid #eee;
			// padding: 15px;
			display: flex;
			flex-direction: column;
		}

		.chart-bottom {
			flex: 1;
			min-height: 0;
			background: #fff;
			border-radius: 8px;
			border: 1px solid #eee;
			padding: 15px;
			display: flex;
			flex-direction: column;
			
			.chart-header-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 10px;
				
				.chart-title {
					font-size: 16px;
					font-weight: 600;
					color: #333;
				}
				
				.chart-controls {
					display: flex;
					gap: 15px;
					
					.mini-control {
						display: flex;
						align-items: center;
						gap: 8px;
						
						.label {
							font-size: 12px;
							color: #666;
						}
					}
				}
			}
			
			.line-chart-placeholder {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
				background: #f9f9f9;
				border-radius: 4px;
				
				.placeholder-content {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 10px;
					color: #999;
					
					i {
						font-size: 32px;
					}
					
					span {
						font-size: 14px;
					}
				}
			}
		}
	}
}

/* Custom Option Styles */
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

/* Fix for Metro dropdown height and tag positioning */
:deep(.el-select__wrapper) {
	min-height: 32px !important;
	height: 32px !important;
	padding: 0 8px !important;
}

:deep(.el-select__tags) {
	height: 32px;
	top: 50%;
	transform: translateY(-50%);
}

:deep(.el-tag) {
	margin-top: 2px !important;
	margin-bottom: 2px !important;
}

:deep(.el-select__tags-text) {
    display: inline-block;
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
}
</style>