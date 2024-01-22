<template>
  <div class="container">
    <h1>Projects</h1>
    <div class="new-project">
      <input v-model="newProjectName" type="text" placeholder="New project name">
      <button @click="createProject">Create Project</button>
      </div>
      <div class="stop-button-container">
      <button @click="stopAllSessions" class="stop-button">Stop All Sessions</button>
    </div>
    <ul>
      <li v-for="project in projects" :key="project.id" class="project-item">
        <RouterLink :to="`/projects/${project.id}`" class="project-link">
          {{ project.name }} ({{ project.running ? 'Running' : 'Stopped'   }})
        </RouterLink>
        ({{ formatTime(project.totalTime) }}) 
        <button @click="deleteProject(project.id)" class="delete-button">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatTime } from '../lib/time'

interface Project {
  id: number;
  name: string;
  totalTime: number;
  running: boolean;
}

const projects = ref<Project[]>([])
const newProjectName = ref('')

const loadProjects = async () => {
  const response = await fetch('/api/projects')
  const data = await response.json()
  projects.value = data
}

onMounted(() => {
  fetch('/api/projects')
    .then(res => res.json())
    .then(data => projects.value = data)
})

const createProject = () => {
  fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: newProjectName.value }),
  })
  .then(res => res.json())
  .then(() => {
    newProjectName.value = ''
  })

  loadProjects()
}

const deleteProject = (id) => {
  fetch(`/api/projects/${id}`, {
    method: 'DELETE',
  })
  .then(() => {
    loadProjects()
  })
}

const stopAllSessions = () => {
  fetch(`/api/sessions/stop`, {
    method: 'POST',
  })
  .then(() => {
    loadProjects()
  })
}
</script>
<style scoped>
.container {
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

.new-project {
  display: flex;
  margin-bottom: 2em;
}

.new-project input {
  margin-right: 1em;
  padding: 0.5em;
  font-size: 1em;
}

.new-project button {
  padding: 0.5em 1em;
  font-size: 1em;
  color: white;
  background-color: #007BFF;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0px 10px 20px -10px rgba(0,0,0,0.2);
}

.new-project button:hover {
  background-color: #0056b3;
}

ul {
  list-style-type: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%; /* Add this line */
}

li {
  margin: 1em 0;
  padding: 1em;
  width: 80%; /* Adjust this value as needed */
  background-color: #fff;
  box-shadow: 0px 10px 20px -10px rgba(0,0,0,0.2);
  border-radius: 10px;
}

a {
  color: #007BFF;
  text-decoration: none;
  font-size: 1.2em;
}

a:hover {
  color: #0056b3;
}
.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-link {
  flex-grow: 1;
}

.delete-button {
  margin-left: auto;
  padding: 0.5em 1em;
  font-size: 1em;
  color: white;
  background-color: #dc3545;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.delete-button:hover {
  background-color: #c82333;
}

.stop-button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2em;
}

.stop-button {
  padding: 0.5em 2em;
  font-size: 1.2em;
  color: white;
  background-color: #28a745;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.stop-button:hover {
  background-color: #218838;
}
</style>