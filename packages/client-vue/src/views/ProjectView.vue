<template>
  <div>
    <template v-if="project === null">
      <p>Loading...</p>
    </template>
    <template v-else>
    <h1>Project {{ project.name }} </h1>
    <p>real time {{ realtime }}</p>
    <button @click="startApi">Start</button>
    <button @click="stop">Stop</button>
    </template>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted, computed } from 'vue'
import { useRouter, onBeforeRouteUpdate } from 'vue-router';
import { formatTime } from '../lib/time';

interface Project {
  name: string;
  totalTime: number;
  sessions: Array<{ endedAt: string | null }>;
}

const project = ref<Project | null>(null)
const router = useRouter()
const timeElapsed = ref(0);
let timer: number | null = null;

const load = async (id) => {
  if (timer) 
    clearInterval(timer);


  timer = null;
  const response = await fetch(`/api/projects/${id}`)
  const data = await response.json() as Project;
  project.value = data

  const lastSession = data.sessions[data.sessions.length - 1];
  if (lastSession && lastSession.endedAt === null) {
    start();
  }
}
onMounted(async () => {
  const { id } = router.currentRoute.value.params
  await load(id)
})

onBeforeRouteUpdate(async (to) => {
  await load(to.params.id)
})

const realtime = computed(() => {
  if (project.value === null) return '00:00:00'
  const { totalTime } = project.value
  return formatTime(totalTime + timeElapsed.value)
})


const start = () => {
  timeElapsed.value = 0;
  timer = window.setInterval(() => {
    timeElapsed.value += 0.1;
  }, 100);
}

const startApi = async () => {
  const { id } = router.currentRoute.value.params

  await fetch(`/api/projects/${id}/start`, { method: 'POST' });
  start();
}

const stop = async () => {
  const { id } = router.currentRoute.value.params

  if (timer) {
    clearInterval(timer);
    timer = null;
    await fetch(`/api/projects/${id}/stop`, { method: 'POST' });
    const response = await fetch(`/api/projects/${id}`)
    const data = await response.json() as Project;
    project.value = data
    timeElapsed.value = 0;
  }
}
</script>
<style scoped>
div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

h1 {
  color: #333;
  font-size: 2.5em;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: bold;
}

p {
  color: #666;
  font-size: 1.2em;
}

button {
  margin: 1em;
  padding: 0.5em 1em;
  font-size: 1em;
  color: white;
  background-color: #007BFF;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0px 10px 20px -10px rgba(0,0,0,0.2);
}

button:hover {
  background-color: #0056b3;
}
</style>