<template>
  <div class="text-scene">
    <div class="scene-text">
      <h2 class="scene-title">{{ scene.title }}</h2>
      <p class="scene-description">{{ scene.description }}</p>

      <div v-if="scene.showCompass" class="compass-container">
        <svg viewBox="0 0 200 200" class="compass-svg">
          <defs>
            <radialGradient id="outerRing" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.2" />
              <stop offset="70%" style="stop-color:#ffffff;stop-opacity:0.1" />
              <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.3" />
            </radialGradient>

            <radialGradient id="innerRing" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.1" />
            </radialGradient>

            <linearGradient id="needleNorth" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#ff6666" />
              <stop offset="100%" style="stop-color:#dd0000" />
            </linearGradient>

            <linearGradient id="needleSouth" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#666666" />
              <stop offset="100%" style="stop-color:#333333" />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx="100" cy="100" r="90" fill="none" stroke="url(#outerRing)" stroke-width="3" opacity="0.8" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="url(#innerRing)" stroke-width="2" opacity="0.6" />

          <g stroke="rgba(255,255,255,0.7)" stroke-width="2" fill="none">
            <line x1="100" y1="20" x2="100" y2="35" />
            <line x1="180" y1="100" x2="165" y2="100" />
            <line x1="100" y1="180" x2="100" y2="165" />
            <line x1="20" y1="100" x2="35" y2="100" />
          </g>

          <g stroke="rgba(255,255,255,0.5)" stroke-width="1" fill="none">
            <line x1="163.6" y1="36.4" x2="156.4" y2="43.6" />
            <line x1="163.6" y1="163.6" x2="156.4" y2="156.4" />
            <line x1="36.4" y1="163.6" x2="43.6" y2="156.4" />
            <line x1="36.4" y1="36.4" x2="43.6" y2="43.6" />
          </g>

          <g fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">
            <text x="100" y="15" dominant-baseline="middle">N</text>
            <text x="190" y="105" dominant-baseline="middle">O</text>
            <text x="100" y="195" dominant-baseline="middle">Z</text>
            <text x="10" y="105" dominant-baseline="middle">W</text>
          </g>

          <g filter="url(#glow)">
            <polygon points="100,100 95,45 100,35 105,45" fill="url(#needleNorth)" stroke="rgba(255,255,255,0.3)" stroke-width="1">
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" values="0 100 100;5 100 100;-5 100 100;0 100 100" dur="4s" repeatCount="indefinite" />
            </polygon>

            <polygon points="100,100 105,155 100,165 95,155" fill="url(#needleSouth)" stroke="rgba(255,255,255,0.2)" stroke-width="1">
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" values="0 100 100;5 100 100;-5 100 100;0 100 100" dur="4s" repeatCount="indefinite" />
            </polygon>
          </g>

          <circle cx="100" cy="100" r="6" fill="rgba(255,255,255,0.9)" stroke="rgba(255,102,102,0.8)" stroke-width="2">
            <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
          </circle>

          <g stroke="rgba(255,255,255,0.3)" stroke-width="1" fill="none">
            <path d="M 30 30 L 40 30 M 30 30 L 30 40" />
            <path d="M 170 30 L 160 30 M 170 30 L 170 40" />
            <path d="M 170 170 L 160 170 M 170 170 L 170 160" />
            <path d="M 30 170 L 40 170 M 30 170 L 30 160" />
          </g>
        </svg>
      </div>

      <ul v-if="scene.points" class="scene-points-text">
        <li v-for="(point, idx) in scene.points" :key="idx">
          {{ point }}
        </li>
      </ul>
    </div>

    <div class="unified-navigation">
      <div class="scene-navigation">
        <button class="nav-button prev" :disabled="isFirst" @click="onPrevious">
          ← Vorige
        </button>
        <span class="scene-counter">{{ currentIndex + 1 }} / {{ totalScenes }}</span>
        <button class="nav-button next" :disabled="isLast" @click="onNext">
          Volgende →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  scene: {
    type: Object,
    required: true
  },
  currentIndex: {
    type: Number,
    required: true
  },
  totalScenes: {
    type: Number,
    required: true
  },
  isFirst: {
    type: Boolean,
    required: true
  },
  isLast: {
    type: Boolean,
    required: true
  },
  onNext: {
    type: Function,
    required: true
  },
  onPrevious: {
    type: Function,
    required: true
  }
})

const { scene, currentIndex, totalScenes, isFirst, isLast, onNext, onPrevious } = props
</script>

<style scoped>
.text-scene {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.scene-text {
  flex: 1;
}

.compass-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
}

.compass-svg {
  width: 300px;
  height: 300px;
  filter: drop-shadow(0 0 10px rgba(255, 102, 102, 0.3));
  transition: all 0.3s ease;
}

.compass-svg:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 0 15px rgba(255, 102, 102, 0.5));
}

.scene-points-text {
  list-style: none;
  padding: 0;
  margin: 0;
}

.scene-points-text li {
  position: relative;
  padding-left: 2rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.3rem;
}

.scene-points-text li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #ff6666;
  font-weight: bold;
}
</style>
