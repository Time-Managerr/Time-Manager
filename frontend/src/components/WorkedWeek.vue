<template>
        <div class="w-33">
          <div class="d-flex flex-column gap-2 align-items-center shadow card p-3">
            <h5>Worked This Week</h5>
            <div class="d-flex justify-content-center gap-3 align-items-center">
              <div class="75">
                <h3 class="fw-bold text-center">{{ workedweek || "00:00:00" }}</h3>
              </div>
              <div class="d-flex justify-content-center bg-primary-subtle rounded-4 p-3">
                <svg style="height: 50px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M22.7 11.5L20.7005 13.5L18.7 11.5M20.9451 13C20.9814 12.6717 21 12.338 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C14.8273 21 17.35 19.6963 19 17.6573M12 7V12L15 14" stroke="#1b93b1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
              </div>
            </div>
          </div>
        </div>
</template>

<script setup>
import { ref } from 'vue';

const workedweek = ref("00:00:00");

</script>