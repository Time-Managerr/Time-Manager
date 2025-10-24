<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const clocks = ref([]);
const getDate = (dateString) => dateString.split("T")[0];
const getHeure = (dateString) => dateString.slice(11, 19);

const fetchClocksByIdUser = async (userId) => {
  const response = await fetch(`http://127.0.0.1:3000/clocks/user/${userId}`);
  const data = await response.json();
  clocks.value = data;
  console.log("Clocks for user", userId, "fetched:", data);
};

const redirection = (id) => {
  router.push(`/clock/${id}`);
};

onMounted(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.id) {
    fetchClocksByIdUser(user.id);
  } else {
    console.error("Aucun utilisateur trouvé");
  }
});
</script>

<template>
    <div class="d-flex flex-column justify-content-between mx-auto my-4 shadow card p-3">
        <h4 class="fw-semibold mt-2 mb-4">My previous clocks</h4>
        <div class="rounded-3 overflow-auto">
            <table class="table table-striped text-center fw-medium">
            <thead>
                <tr class="table-primary">
                    <th scope="col">
                        <svg class="col-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 10V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V10M20 10V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V10M20 10H4M8 3V7M16 3V7" stroke="#1b93b1" stroke-width="2" stroke-linecap="round"></path> <rect x="6" y="12" width="3" height="3" rx="0.5" fill="#1b93b1"></rect> <rect x="10.5" y="12" width="3" height="3" rx="0.5" fill="#1b93b1"></rect> <rect x="15" y="12" width="3" height="3" rx="0.5" fill="#1b93b1"></rect> </g></svg>
                    </th>
                    <th scope="col-1">
                        <svg class="col-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 13L11 15L15 11M3 6L6.5 3M21 6L17.5 3M12 21C16.4183 21 20 17.4183 20 13C20 8.58172 16.4183 5 12 5C7.58172 5 4 8.58172 4 13C4 17.4183 7.58172 21 12 21Z" stroke="#1b93b1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                    </th>
                    <th scope="col">
                        <svg class="col-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Interface / Exit"> <path id="Vector" d="M12 15L15 12M15 12L12 9M15 12H4M4 7.24802V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2839 4.21799 18.9076C4 18.4798 4 17.9201 4 16.8V16.75" stroke="#1b93b1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
                    </th>
                    <th scope="col">
                        <svg class="col-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 12H3V8C3 6.89543 3.89543 6 5 6H9M4 12V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12M4 12H10M20 12H21V8C21 6.89543 20.1046 6 19 6H15M20 12H14M14 12V10H10V12M14 12V14H10V12M9 6V5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V6M9 6H15" stroke="#1b93b1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                    </th>                    
                </tr>
            </thead>
            <tbody>
                <tr v-for="clock in clocks" :key="clock.id" @click="redirection(clock.id)">
                    <td scope="row">{{ getDate(clock.createdAt) }}</td>
                    <td class="text-success">{{ getHeure(clock.clockIn) }}</td>
                    <td class="text-danger">{{ getHeure(clock.clockOut) || 'Non pointé' }}</td>
                    <td >{{clock.hoursWorked}}</td>
                </tr>
            </tbody>
        </table>
        </div>
        
    </div>
</template>