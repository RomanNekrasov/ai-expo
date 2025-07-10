<template>
  <div id="app" class="relative min-h-screen font-display flex flex-col">
    <AnimatedBackground
      :current-state="blobState"
      @state-change="handleStateChange"
    />
    <div class="relative z-10 flex flex-col flex-1">
      <header class="text-center pt-12 pb-8 px-8">
        <h1 class="text-5xl md:text-6xl font-black text-white mb-2 <!--drop-shadow-lg--> tracking-tight">
          AI op Legacy Hardware
        </h1>
        <p class="text-xl text-white/80 font-light">
          Een visuele reis door lokale AI-verwerking
        </p>
      </header>
      <div class="flex-1 flex items-center justify-center">
        <StoryScene
          @scene-change="handleSceneChange"
          @blob-state-change="handleBlobStateChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import AnimatedBackground from './components/AnimatedBackground.vue'
import StoryScene from './components/StoryScene.vue'

export default {
  name: 'App',
  components: {
    AnimatedBackground,
    StoryScene
  },
  setup() {
    const blobState = ref('normal')
    const currentScene = ref(null)

    const handleSceneChange = (scene) => {
      currentScene.value = scene
    }

    const handleBlobStateChange = (state) => {
      blobState.value = state
    }

    const handleStateChange = (state) => {
      // This is from the AnimatedBackground component
      console.log('Background state changed:', state)
    }

    return {
      blobState,
      currentScene,
      handleSceneChange,
      handleBlobStateChange,
      handleStateChange
    }
  }
}
</script>