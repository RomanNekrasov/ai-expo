<template>
  <div class="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-red-300 to-red-200">
    <!-- SVG Filter Definition -->
    <svg class="absolute w-0 h-0">
      <defs>
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.6"
            numOctaves="4"
            seed="5"
          />
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0.05 0.1 0.15 0.2 0.25 0.3 0.35 0.4"/>
          </feComponentTransfer>
          <feComposite operator="over" in2="SourceGraphic"/>
        </filter>
      </defs>
    </svg>

    <!-- Blob containers for smooth position transitions -->
    <div
      v-for="blob in blobs"
      :key="blob.id"
      class="blob-container"
      :style="{
        transform: `translate(${positions[currentState][blob.id].x}, ${positions[currentState][blob.id].y})`
      }"
    >
      <!-- Animated blob inside container -->
      <div
        class="blob"
        :class="`blob-${blob.id}`"
        :style="{
          width: `${blob.size}px`,
          height: `${blob.size}px`,
          background: blob.gradient,
          animationDuration: `${blob.floatDuration}s`,
          animationDelay: `${blob.floatDelay}s`
        }"
      ></div>
    </div>

    <!-- Noise overlay using SVG filter -->
    <div class="noise-overlay"></div>
  </div>
</template>

<script>
export default {
  name: 'AnimatedBackground',
  props: {
    currentState: {
      type: String,
      default: 'normal',
      validator: (value) => ['normal', 'left', 'right'].includes(value)
    }
  },
  setup(props) {
    // Blob configurations
    const blobs = [
      {
        id: 1,
        size: 800,
        gradient: 'linear-gradient(45deg, #fad9d9 0%, #dd0000 100%)',
        floatDuration: 20,
        floatDelay: 0
      },
      {
        id: 2,
        size: 900,
        gradient: 'linear-gradient(45deg, #ddebf3 0%, #1d78af 100%)',
        floatDuration: 25,
        floatDelay: -5
      },
      {
        id: 3,
        size: 350,
        gradient: 'linear-gradient(45deg, #eb6666 0%, #dd0000 100%)',
        floatDuration: 18,
        floatDelay: -10
      },
      {
        id: 4,
        size: 450,
        gradient: 'linear-gradient(45deg, #e6f1e3 0%, #56a446 100%)',
        floatDuration: 22,
        floatDelay: -3
      },
      {
        id: 5,
        size: 300,
        gradient: 'linear-gradient(45deg, #cce4c8 0%, #56a446 100%)',
        floatDuration: 15,
        floatDelay: -8
      }
    ]

    // Position configurations for each state (using viewport-based positions)
    const positions = {
      normal: {
        1: { x: '10vw', y: '60vh' },
        2: { x: '70vw', y: '10vh' },
        3: { x: '20vw', y: '40vh' },
        4: { x: '60vw', y: '70vh' },
        5: { x: '40vw', y: '30vh' }
      },
      left: {
        1: { x: '-30vw', y: '50vh' },
        2: { x: '-25vw', y: '20vh' },
        3: { x: '-20vw', y: '60vh' },
        4: { x: '-25vw', y: '35vh' },
        5: { x: '-15vw', y: '45vh' }
      },
      right: {
        1: { x: '95vw', y: '50vh' },
        2: { x: '90vw', y: '20vh' },
        3: { x: '85vw', y: '60vh' },
        4: { x: '90vw', y: '35vh' },
        5: { x: '80vw', y: '45vh' }
      }
    }

    return {
      blobs,
      positions
    }
  }
}
</script>

<style scoped>
/* Container handles position transitions */
.blob-container {
  position: absolute;
  transition: transform 2.5s cubic-bezier(0.4, 0.0, 0.2, 1);
  will-change: transform;
}

/* Blob handles appearance and floating animation */
.blob {
  border-radius: 50%;
  filter: blur(60px);
  mix-blend-mode: multiply;
  animation: float 20s infinite ease-in-out;
}

/* Noise overlay for grainy texture */
.noise-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  filter: url(#noiseFilter);
  opacity: 0.9; /* Adjust this for noise intensity */
}

/* Optional: Add extra texture with CSS */
.noise-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgba(255,255,255,0.02) 1deg,
      transparent 2deg
    );
  background-size: 100px 100px;
  mix-blend-mode: overlay;
}

/* Unique floating animations for each blob */
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -40px) scale(1.05);
  }
  50% {
    transform: translate(-20px, -20px) scale(0.95);
  }
  75% {
    transform: translate(40px, 30px) scale(1.02);
  }
}

.blob-2 {
  animation-name: float-2;
}

@keyframes float-2 {
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  33% {
    transform: translate(-40px, 35px) scale(1.08) rotate(120deg);
  }
  66% {
    transform: translate(35px, -45px) scale(0.92) rotate(240deg);
  }
}

.blob-3 {
  animation-name: float-3;
}

@keyframes float-3 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(50px, 50px) scale(1.1);
  }
}

.blob-4 {
  animation-name: float-4;
}

@keyframes float-4 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  20% {
    transform: translate(-25px, -35px) scale(1.03);
  }
  40% {
    transform: translate(30px, -20px) scale(0.97);
  }
  60% {
    transform: translate(20px, 40px) scale(1.05);
  }
  80% {
    transform: translate(-35px, 25px) scale(0.98);
  }
}

.blob-5 {
  animation-name: float-5;
}

@keyframes float-5 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(45px, -30px) scale(0.95);
  }
  50% {
    transform: translate(-30px, 35px) scale(1.08);
  }
  75% {
    transform: translate(25px, 45px) scale(1.02);
  }
}
</style>