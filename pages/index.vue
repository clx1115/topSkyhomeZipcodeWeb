<template>
	<div class="matechat-box">
		<div class="matechat-container">
			<div class="header-section">
				<h1 class="title">TopSkyHome</h1>
				<p class="subtitle">请选择一个页面进入</p>
			</div>

			<div class="metrics-container">
				<div class="metrics-bar">
					<div class="tabs-wrapper">
						<NuxtLink class="metric-item" to="/ZipCode">ZipCode</NuxtLink>
						<NuxtLink class="metric-item" to="/MSA">MSA</NuxtLink>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts"></script>

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
		margin-top: 10px;
	}

	.metrics-bar {
		display: flex;
		align-items: center;
		background-color: #f8f9fa;
		padding: 4px;
		border-radius: 12px;
		border: 1px solid #eee;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
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
		text-decoration: none;

		&:hover {
			color: #000;
			background-color: rgba(0, 0, 0, 0.05);
		}
	}
</style>
