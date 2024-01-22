<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

interface Project {
  id: number;
  name: string;
}

const projects = ref<Project[]>([])

onMounted(async () => {
  const response = await fetch('/api/projects')
  const data = await response.json()
  projects.value = data.slice(0, 5)
})
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <h1>Timetrak</h1>
        <div class="project-links">
          <RouterLink to="/">Home</RouterLink>

          <RouterLink v-for="project in projects" :key="project.id" :to="`/projects/${project.id}`">
            {{ project.name }}
          </RouterLink>
        </div>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f5f5f5;
}

.wrapper {
  width: 90%;
  margin: auto;
}

nav {
  display: flex;
  align-items: center;
}

h1 {
  margin-right: 20px;
}
.project-links {
  display: flex;
  gap: 1em;
}
</style>