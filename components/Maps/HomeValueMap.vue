<template>
	<div class="home-value-map">
		<div ref="mapContainer" class="map-container"></div>
		<div class="map-legend">
			<span class="legend-label">{{ legendLabel }}</span>
			<div class="legend-gradient">
				<span class="legend-min">{{ minValue }}{{ unit }}</span>
				<div class="gradient-bar"></div>
				<span class="legend-max">{{ maxValue }}{{ unit }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed, type PropType } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
	data: { type: Array as PropType<any[]>, default: () => [] },
	title: { type: String, default: 'Accumulative Home Value Gain' },
	legendLabel: { type: String, default: '% Home Value Gain' },
	valueField: { type: String, default: 'growth_rate' },
	unit: { type: String, default: '%' },
	colorScheme: { type: String, default: 'redGreen' }
})

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let zipcodeCoords: Record<string, { lat: number; lng: number }> = {}

const minValue = computed(() => {
	if (!props.data || props.data.length === 0) return -9.7
	const values = props.data.map((item: any) => item[props.valueField] || 0)
	return Math.min(...values).toFixed(1)
})

const maxValue = computed(() => {
	if (!props.data || props.data.length === 0) return 1.2
	const values = props.data.map((item: any) => item[props.valueField] || 0)
	return Math.max(...values).toFixed(1)
})

const getColor = (value: number) => {
	if (props.colorScheme === 'redGreen') {
		if (value < -8) return '#8B0000'
		if (value < -6) return '#B22222'
		if (value < -4) return '#CD5C5C'
		if (value < -2) return '#F08080'
		if (value < 0) return '#FFA07A'
		if (value < 0.5) return '#FFE4E1'
		return '#90EE90'
	} else {
		if (value < 20) return '#fee5d9'
		if (value < 40) return '#fcae91'
		if (value < 60) return '#fb6a4a'
		if (value < 80) return '#de2d26'
		return '#a50f15'
	}
}

onMounted(async () => {
	if (!mapContainer.value) return

	// 加载本地邮编坐标数据
	try {
		const response = await fetch('/data/us-zipcodes.json')
		if (response.ok) {
			zipcodeCoords = await response.json()
		}
	} catch (error) {
		console.warn('Failed to load zipcode data:', error)
	}

	map = L.map(mapContainer.value, {
		center: [29.4241, -98.4936],
		zoom: 10,
		zoomControl: true
	})

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '© 2026 Mapbox © OpenStreetMap',
		maxZoom: 18
	}).addTo(map)

	await loadZipcodeData()
})

const loadZipcodeData = async () => {
	if (!props.data || props.data.length === 0) return
	
	const bounds: [number, number][] = []
	
	props.data.forEach((item: any) => {
		const zipcode = item.zipcode || item.Zipcode
		const value = item[props.valueField] || 0
		const city = item.city || item.City || ''
		const metro = item.metro || item.Metro || ''
		
		const coords = zipcodeCoords[zipcode]
		
		if (coords) {
			bounds.push([coords.lat, coords.lng])
			
			const radius = 0.05
			const sides = 6
			const polygonCoords: [number, number][] = []
			
			for (let j = 0; j < sides; j++) {
				const angle = (j * 2 * Math.PI) / sides
				const lat = coords.lat + radius * Math.cos(angle)
				const lng = coords.lng + radius * Math.sin(angle)
				polygonCoords.push([lat, lng])
			}
			
			const polygon = L.polygon(polygonCoords, {
				color: '#666',
				weight: 1,
				fillColor: getColor(value),
				fillOpacity: 0.7
			}).addTo(map!)
			
			L.marker([coords.lat, coords.lng], {
				icon: L.divIcon({
					className: 'zipcode-label',
					html: `<div style="font-size: 11px; font-weight: 600; color: #333; text-shadow: 1px 1px 2px white;">${zipcode}</div>`,
					iconSize: [50, 20]
				})
			}).addTo(map!)
			
			polygon.bindTooltip(`
				<strong>Zipcode: ${zipcode}</strong><br>
				City: ${city}<br>
				Metro: ${metro}<br>
				${props.legendLabel}: ${value.toFixed(1)}${props.unit}
			`, {
				sticky: true
			})
		}
	})
	
	if (bounds.length > 0 && map) {
		map.fitBounds(bounds, { padding: [50, 50] })
	}
}

onBeforeUnmount(() => {
	if (map) {
		map.remove()
		map = null
	}
})

watch(() => props.data, () => {
	if (map) {
		map.eachLayer(layer => {
			if (layer instanceof L.Polygon || layer instanceof L.Marker) {
				map!.removeLayer(layer)
			}
		})
		loadZipcodeData()
	}
}, { deep: true })
</script>

<style scoped lang="scss">
.home-value-map {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	position: relative;
	background: #fff;
	border-radius: 8px;
	overflow: hidden;
}

.map-header {
	padding: 15px 20px;
	border-bottom: 1px solid #eee;
	
	.map-title {
		font-size: 18px;
		font-weight: 600;
		color: #333;
	}
}

.map-container {
	flex: 1;
	position: relative;
	z-index: 1;
}

.map-legend {
	position: absolute;
	bottom: 20px;
	left: 20px;
	background: rgba(255, 255, 255, 0.95);
	padding: 12px 16px;
	border-radius: 6px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	z-index: 1000;
	
	.legend-label {
		display: block;
		font-size: 12px;
		font-weight: 600;
		color: #333;
		margin-bottom: 8px;
	}
	
	.legend-gradient {
		display: flex;
		align-items: center;
		gap: 8px;
		
		.legend-min,
		.legend-max {
			font-size: 11px;
			color: #666;
			font-weight: 500;
		}
		
		.gradient-bar {
			width: 200px;
			height: 12px;
			background: linear-gradient(to right, 
				#8B0000 0%,
				#B22222 14%,
				#CD5C5C 28%,
				#F08080 42%,
				#FFA07A 57%,
				#FFE4E1 71%,
				#90EE90 100%
			);
			border-radius: 2px;
			border: 1px solid #ddd;
		}
	}
}

:deep(.leaflet-container) {
	font-family: inherit;
}

:deep(.leaflet-popup-content) {
	margin: 8px 12px;
	font-size: 13px;
}

:deep(.zipcode-label) {
	background: transparent;
	border: none;
	text-align: center;
}
</style>
