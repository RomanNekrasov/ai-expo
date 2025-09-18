<template>
  <div class="utp-scene">
    <h2 class="scene-title">{{ scene.title }}</h2>
    <p class="scene-description">{{ scene.description }}</p>

    <div class="utp-visualization">
      <div class="pc-box left-pc">
        <div class="pc-label">LLM Machine</div>
        <div class="pc-icon">💻</div>
      </div>

      <div class="utp-cable">
        <div class="cable-line"></div>
        <div class="data-flow"></div>
        <div class="cable-label">UTP ethernet Kabel</div>
      </div>

      <div class="pc-box right-pc">
        <div class="pc-label">Whisper Machine</div>
        <div class="pc-icon">💻</div>
      </div>
    </div>

    <ul v-if="scene.points" class="scene-points">
      <li v-for="(point, idx) in scene.points" :key="idx">
        {{ point }}
      </li>
    </ul>

    <div class="unified-navigation">
      <div class="scene-navigation">
        <button class="nav-button prev" :disabled="isFirst" @click="onPrevious">
          ← Vorige
        </button>
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

const { scene, isFirst, isLast, onNext, onPrevious } = props
</script>

<style scoped>
.utp-scene {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.utp-visualization {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
  flex: 1;
  min-height: 200px;
}

.pc-box {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  min-width: 150px;
  transition: all 0.3s ease;
}

.pc-box:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-5px);
}

.left-pc {
  border-color: rgba(255, 102, 102, 0.5);
}

.right-pc {
  border-color: rgba(102, 255, 102, 0.5);
}

.pc-label {
  color: white;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.pc-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.utp-cable {
  position: relative;
  flex: 1;
  height: 60px;
  margin: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cable-line {
  width: 100%;
  height: 8px;
  background: linear-gradient(90deg, #ff6666 0%, #66ff66 100%);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.data-flow {
  position: absolute;
  top: 0;
  left: -20px;
  width: 40px;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
  animation: data-flow 2s ease-in-out infinite;
}

.cable-label {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

@keyframes data-flow {
  0% {
    left: -20px;
  }
  100% {
    left: 100%;
  }
}

.scene-points {
  list-style: none;
  padding: 0;
  margin: 0;
}

.scene-points li {
  position: relative;
  padding-left: 2rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.scene-points li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #ff6666;
  font-weight: bold;
}
</style>
