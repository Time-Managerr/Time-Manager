<template>
    <div>
        <ToastContainer />
        <template v-if="route.path && route.path.toLowerCase() === '/login'">
            <router-view />
        </template>
        <template v-else>
            <div class="d-flex">
                <SideNav />
                <div class="flex-fill d-flex flex-column">
                    <Header />
                    <div class="flex-fill">
                        <router-view />
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import SideNav from './components/SideNav.vue'
import ToastContainer from './components/ToastContainer.vue'

const route = useRoute()
</script>

<style>

</style>
