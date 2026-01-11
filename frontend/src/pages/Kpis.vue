<template>
  <div class="container-fluid mt-4">
    <h2 class="mb-4">Performance Metrics</h2>

    <!-- Filters and controls -->
    <div class="card p-3 mb-4">
      <div class="row">
        <div class="col-md-2">
          <label class="form-label fw-bold">Scope</label>
          <select class="form-select" v-model="scope">
            <option value="user">User</option>
            <option value="team">Team</option>
          </select>
        </div>
        <div class="col-md-3" v-if="scope === 'user'">
          <label class="form-label fw-bold">Select User</label>
          <select class="form-select" v-model.number="targetId">
            <option :value="null" disabled>-- Choose a user --</option>
            <option v-for="u in availableUsers" :key="u.idUser" :value="u.idUser">
              {{ u.firstname }} {{ u.lastname }}
            </option>
          </select>
        </div>
        <div class="col-md-3" v-if="scope === 'team'">
          <label class="form-label fw-bold">Select Team</label>
          <select class="form-select" v-model.number="targetId">
            <option :value="null" disabled>-- Choose a team --</option>
            <option v-for="t in availableTeams" :key="t.idTeam" :value="t.idTeam">
              {{ t.name }}
            </option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label fw-bold">Start Date</label>
          <input type="date" class="form-control" v-model="startDate" />
        </div>
        <div class="col-md-2">
          <label class="form-label fw-bold">End Date</label>
          <input type="date" class="form-control" v-model="endDate" />
        </div>
        <div class="col-md-2 d-flex align-items-end gap-2">
          <button class="btn btn-primary flex-grow-1" @click="loadData">Load</button>
          <button class="btn btn-outline-secondary" @click="exportPdf" v-if="kpiData || teamResults">PDF</button>
        </div>
      </div>
    </div>

    <!-- Single User KPI View -->
    <div v-if="scope === 'user' && kpiData">
      <!-- KPI Cards -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card p-4">
            <h5 class="text-secondary mb-3">Attendance</h5>
            <p class="lead">
              Employee <strong>{{ kpiData.user.firstname }} {{ kpiData.user.lastname }}</strong> 
              has been on time <strong>{{ kpiData.lateness.onTimeDays }}</strong> days 
              on the <strong>{{ kpiData.lateness.totalDays }}</strong> days selected
            </p>
            <div class="text-center my-3">
              <div 
                :class="getLatenessColor(kpiData.lateness)" 
                style="display: inline-block; padding: 20px 40px; border-radius: 10px;">
                <div style="font-size: 3rem; font-weight: bold;">
                  {{ getLatenessPercentage(kpiData.lateness) }}%
                </div>
                <div class="text-muted">Lateness Rate</div>
              </div>
            </div>
            <!-- Pie Chart for Lateness -->
            <canvas ref="latenessChart" style="max-height: 200px;"></canvas>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card p-4">
            <h5 class="text-secondary mb-3">Hours Worked</h5>
            <p class="lead">
              Total hours worked: <strong>{{ decimalToHHMM(kpiData.hours.total) }}</strong> 
              over {{ kpiData.hours.totalDays }} days
            </p>
            <div class="text-center my-3">
              <div 
                :class="getHoursColor(kpiData.hours)" 
                style="display: inline-block; padding: 20px 40px; border-radius: 10px;">
                <div style="font-size: 3rem; font-weight: bold;">
                  {{ decimalToHHMM(getAvgHours(kpiData.hours)) }}
                </div>
                <div class="text-muted">Average Daily Hours</div>
              </div>
            </div>
            <!-- Bar Chart for Hours -->
            <canvas ref="hoursChart" style="max-height: 200px;"></canvas>
          </div>
        </div>
      </div>

      <!-- Clock History -->
      <div class="card p-4">
        <h5 class="mb-3">Clock History ({{ startDate }} - {{ endDate }})</h5>
        <div v-if="clockHistory.length === 0" class="text-muted text-center py-4">
          No clock entries found for this period.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-sm table-hover">
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in clockHistory" :key="c.idClock">
                <td>{{ formatDate(c.clockIn) }}</td>
                <td :style="getClockInStyle(c)">{{ formatTime(c.clockIn) }}</td>
                <td :style="getClockOutStyle(c)">{{ c.clockOut ? formatTime(c.clockOut) : '-' }}</td>
                <td>{{ c.hoursWorked ? decimalToHHMM(c.hoursWorked) : '-' }}</td>
                <td>
                  <span :class="'badge ' + getClockBadge(c)">
                    {{ getClockStatus(c) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Team KPI View -->
    <div v-if="scope === 'team' && teamResults" class="card p-4">
      <h4 class="mb-4">Team Performance</h4>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Employee</th>
              <th>On Time / Total Days</th>
              <th>Lateness Rate</th>
              <th>Total Hours</th>
              <th>Avg Daily Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in teamResults" :key="r.user.id">
              <td><strong>{{ r.user.firstname }} {{ r.user.lastname }}</strong></td>
              <td>{{ r.lateness.onTimeDays }} / {{ r.lateness.totalDays }}</td>
              <td>
                <span 
                  :class="'badge ' + getLatenessBadgeColor(r.lateness)"
                  style="font-size: 1rem; padding: 8px 12px;">
                  {{ getLatenessPercentage(r.lateness) }}%
                </span>
              </td>
              <td>{{ decimalToHHMM(r.hours.total) }}</td>
              <td>
                <span 
                  :class="'badge ' + getHoursBadgeColor(r.hours)"
                  style="font-size: 1rem; padding: 8px 12px;">
                  {{ decimalToHHMM(getAvgHours(r.hours)) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import kpiService from '../services/kpiService';
import usersService from '../services/usersService';
import teamsService from '../services/teamsService';
import clockService from '../services/clockService';
import planningService from '../services/planningService';
import { useToast } from '../composables/useToast';

const toast = useToast();

Chart.register(...registerables);

export default {
  setup() {
    const scope = ref('user');
    const targetId = ref(null);
    const startDate = ref('2025-12-01');
    const endDate = ref('2026-01-09');
    const kpiData = ref(null);
    const teamResults = ref(null);
    const availableUsers = ref([]);
    const availableTeams = ref([]);
    const clockHistory = ref([]);
    const latenessChart = ref(null);
    const hoursChart = ref(null);
    let latenessChartInstance = null;
    let hoursChartInstance = null;

    const fetchAvailableOptions = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        // Always populate teams (filtered by backend based on role)
        const teamsRes = await teamsService.getAllTeams();
        availableTeams.value = teamsRes;

        // Populate users based on role for reliable dropdown
        if (currentUser && currentUser.profile === 'manager') {
          // Get teams where the manager is manager or member, including detailed members
          const mgrTeams = await teamsService.getTeamsByUserId(currentUser.id);
          const uniqueUsers = new Map();

          // Include the manager themselves
          if (currentUser.id) {
            uniqueUsers.set(currentUser.id, {
              idUser: currentUser.id,
              firstname: currentUser.firstname,
              lastname: currentUser.lastname,
            });
          }

          // Include all team members
          for (const t of mgrTeams) {
            for (const m of (t.members || [])) {
              uniqueUsers.set(m.id, {
                idUser: m.id,
                firstname: m.firstname || (m.name ? m.name.split(' ')[0] : ''),
                lastname: m.lastname || (m.name ? m.name.split(' ').slice(1).join(' ') : ''),
              });
            }
          }
          availableUsers.value = Array.from(uniqueUsers.values());
        } else {
          // Admin or fallback: load all users
          const usersRes = await usersService.getAll();
          availableUsers.value = usersRes;
        }
      } catch (err) {
        console.error('Error fetching options:', err);
      }
    };

    onMounted(fetchAvailableOptions);

    const getLatenessPercentage = (lateness) => {
      if (lateness.totalDays === 0) return 0;
      return ((lateness.lateCount / lateness.totalDays) * 100).toFixed(1);
    };

    const getLatenessColor = (lateness) => {
      const pct = parseFloat(getLatenessPercentage(lateness));
      if (pct < 5) return 'bg-success text-white';
      if (pct < 15) return 'bg-warning text-dark';
      return 'bg-danger text-white';
    };

    const getLatenessBadgeColor = (lateness) => {
      const pct = parseFloat(getLatenessPercentage(lateness));
      if (pct < 5) return 'bg-success';
      if (pct < 15) return 'bg-warning';
      return 'bg-danger';
    };

    const getAvgHours = (hours) => {
      if (hours.totalDays === 0) return 0;
      return hours.total / hours.totalDays;
    };

    const getHoursColor = (hours) => {
      const avg = parseFloat(getAvgHours(hours));
      return avg >= 8 ? 'bg-success text-white' : 'bg-danger text-white';
    };

    const getHoursBadgeColor = (hours) => {
      const avg = parseFloat(getAvgHours(hours));
      return avg >= 8 ? 'bg-success' : 'bg-danger';
    };

    const formatTime = (iso) => {
      if (!iso) return '-';
      try {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) { return '-'; }
    };

    const decimalToHHMM = (hours) => {
      if (!hours && hours !== 0) return '-';
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return `${h}:${m.toString().padStart(2, '0')}`;
    };

    const isClockInLate = (clock) => {
      if (!clock || !clock.clockIn) return false;
      try {
        const clockInTime = new Date(clock.clockIn);
        
        // If there's a planning, compare with planned start time + 5min grace period
        if (clock.planning && clock.planning.startTime) {
          const plannedStart = new Date(clock.planning.startTime);
          plannedStart.setMinutes(plannedStart.getMinutes() + 5); // Add 5min tolerance
          return clockInTime > plannedStart;
        }
        
        // Fallback to default 9:05 (9:00 + 5min) if no planning
        return clockInTime.getHours() > 9 || (clockInTime.getHours() === 9 && clockInTime.getMinutes() > 5);
      } catch (e) { 
        return false; 
      }
    };

    const isClockOutEarly = (clock) => {
      if (!clock || !clock.clockOut) return false;
      try {
        const clockOutTime = new Date(clock.clockOut);
        
        // If there's a planning, compare with planned end time
        if (clock.planning && clock.planning.endTime) {
          const plannedEnd = new Date(clock.planning.endTime);
          return clockOutTime < plannedEnd;
        }
        
        // Fallback to default 17:00 if no planning
        return clockOutTime.getHours() < 17 || (clockOutTime.getHours() === 17 && clockOutTime.getMinutes() < 0);
      } catch (e) { 
        return false; 
      }
    };

    const getClockInStyle = (clock) => {
      return isClockInLate(clock) ? 'color: #dc3545; font-weight: bold;' : '';
    };

    const getClockOutStyle = (clock) => {
      return isClockOutEarly(clock) ? 'color: #dc3545; font-weight: bold;' : '';
    };

    const formatDate = (iso) => {
      if (!iso) return '-';
      try {
        return new Date(iso).toLocaleDateString();
      } catch (e) { return '-'; }
    };

    const getClockStatus = (clock) => {
      // Safely convert to number
      const hours = clock.hoursWorked ? parseFloat(clock.hoursWorked) : null;
      
      if (hours === null || hours === undefined || isNaN(hours)) {
        return 'No data';
      }
      
      if (hours < 8) {
        return 'Short';
      } else if (hours > 8.5) {
        return 'Overtime';
      } else {
        return 'Normal';
      }
    };

    const getClockBadge = (clock) => {
      const status = getClockStatus(clock);
      if (status === 'Normal') return 'bg-success';
      if (status === 'Overtime') return 'bg-info';
      return 'bg-warning';
    };

    const createCharts = async () => {
      await nextTick();
      
      if (latenessChartInstance) latenessChartInstance.destroy();
      if (hoursChartInstance) hoursChartInstance.destroy();

      if (kpiData.value && latenessChart.value) {
        const lateCount = kpiData.value.lateness.lateCount;
        const onTimeCount = kpiData.value.lateness.onTimeDays;
        
        latenessChartInstance = new Chart(latenessChart.value, {
          type: 'pie',
          data: {
            labels: ['On Time', 'Late'],
            datasets: [{
              data: [onTimeCount, lateCount],
              backgroundColor: ['#198754', '#dc3545']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' }
            }
          }
        });
      }

      if (kpiData.value && hoursChart.value) {
        const avgHours = parseFloat(getAvgHours(kpiData.value.hours));
        const targetHours = 8;
        const convertToHHMM = decimalToHHMM; // Capture in closure
        
        hoursChartInstance = new Chart(hoursChart.value, {
          type: 'bar',
          data: {
            labels: ['Average Hours', 'Target Hours'],
            datasets: [{
              label: 'Hours',
              data: [avgHours, targetHours],
              backgroundColor: [avgHours >= 8 ? '#198754' : '#dc3545', '#0dcaf0']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: false,
                min: 6,
                max: 9,
                ticks: { stepSize: 0.5 }
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return convertToHHMM(context.parsed.y);
                  }
                }
              }
            }
          }
        });
      }
    };

    const loadData = async () => {
      try {
        if (!targetId.value) { 
          toast.warning('Please select a ' + (scope.value === 'user' ? 'user' : 'team')); 
          return; 
        }

        kpiData.value = null;
        teamResults.value = null;
        clockHistory.value = [];

        const payload = {
          scope: scope.value,
          start: startDate.value,
          end: endDate.value
        };
        
        if (scope.value === 'user') {
          payload.targetUserId = Number(targetId.value);
          
          // Fetch KPI data
          const res = await kpiService.compute(payload);
          kpiData.value = res.data;
          
          // Fetch clock history and plannings for the period
          const clocksRes = await clockService.getByUserId(targetId.value);
          const start = new Date(startDate.value);
          const end = new Date(endDate.value);
          
          // Fetch all plannings for the user
          const plannings = await planningService.getByUserId(targetId.value);
          
          // Build a map of plannings by date for quick lookup
          const planningsByDate = {};
          plannings.forEach(p => {
            const dateKey = new Date(p.date).toDateString();
            planningsByDate[dateKey] = p;
          });
          
          // Attach planning data to clocks
          clockHistory.value = clocksRes.filter(c => {
            const d = new Date(c.clockIn);
            return d >= start && d <= end;
          }).map(c => ({
            ...c,
            planning: planningsByDate[new Date(c.clockIn).toDateString()]
          })).sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn));
          
          // Create charts
          await createCharts();
        } else {
          payload.targetTeamId = Number(targetId.value);
          const res = await kpiService.compute(payload);
          teamResults.value = res.data.teamResults;
        }
      } catch (err) {
        console.error('Error loading data:', err);
        toast.error('Error: ' + (err.response?.data?.error || err.message));
      }
    };

    const exportPdf = async () => {
      try {
        // Create a container for the content to capture
        const container = document.createElement('div');
        container.style.backgroundColor = '#fff';
        container.style.padding = '20px';
        container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        
        let html = `
          <div style="margin-bottom: 20px;">
            <h1 style="font-size: 24px; margin-bottom: 10px;">Performance Metrics Report</h1>
            <p style="color: #666; font-size: 14px;">Period: ${startDate.value} to ${endDate.value}</p>
          </div>
        `;

        if (scope.value === 'user' && kpiData.value) {
          const d = kpiData.value;
          html += `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 18px; margin-bottom: 10px;">${d.user.firstname} ${d.user.lastname}</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                  <h3 style="font-size: 14px; color: #666; margin-bottom: 10px;">Attendance</h3>
                  <p style="font-size: 12px; margin: 5px 0;">On time: <strong>${d.lateness.onTimeDays}/${d.lateness.totalDays} days</strong></p>
                  <p style="font-size: 12px; margin: 5px 0;">Lateness rate: <strong>${getLatenessPercentage(d.lateness)}%</strong></p>
                </div>
                <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                  <h3 style="font-size: 14px; color: #666; margin-bottom: 10px;">Hours Worked</h3>
                  <p style="font-size: 12px; margin: 5px 0;">Total hours: <strong>${decimalToHHMM(d.hours.total)}</strong></p>
                  <p style="font-size: 12px; margin: 5px 0;">Average daily: <strong>${decimalToHHMM(getAvgHours(d.hours))}</strong></p>
                </div>
              </div>
            </div>
          `;

          // Add clock history table
          if (clockHistory.value.length > 0) {
            html += `
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 16px; margin-bottom: 10px;">Clock History</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <thead>
                    <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ddd;">
                      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Date</th>
                      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Clock In</th>
                      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Clock Out</th>
                      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Hours</th>
                      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
            `;
            
            for (const c of clockHistory.value.slice(0, 30)) {
              const isLate = isClockInLate(c) ? 'color: #dc3545; font-weight: bold;' : '';
              const isEarly = isClockOutEarly(c) ? 'color: #dc3545; font-weight: bold;' : '';
              html += `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(c.clockIn)}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; ${isLate}">${formatTime(c.clockIn)}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; ${isEarly}">${c.clockOut ? formatTime(c.clockOut) : '-'}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${c.hoursWorked ? decimalToHHMM(c.hoursWorked) : '-'}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;"><span style="background-color: #e7f3ff; padding: 2px 6px; border-radius: 3px;">${getClockStatus(c)}</span></td>
                </tr>
              `;
            }
            
            html += `
                  </tbody>
                </table>
              </div>
            `;
          }
        } else if (teamResults.value) {
          html += `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 18px; margin-bottom: 15px;">Team Performance</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ddd;">
                    <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Employee</th>
                    <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">On Time / Total</th>
                    <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Lateness Rate</th>
                    <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Avg Hours</th>
                  </tr>
                </thead>
                <tbody>
          `;
          
          for (const r of teamResults.value) {
            html += `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>${r.user.firstname} ${r.user.lastname}</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${r.lateness.onTimeDays} / ${r.lateness.totalDays}</td>
                <td style="padding: 8px; border: 1px solid #ddd;"><span style="background-color: ${getLatenessPercentage(r.lateness) < 5 ? '#d4edda' : getLatenessPercentage(r.lateness) < 15 ? '#fff3cd' : '#f8d7da'}; padding: 2px 6px; border-radius: 3px;">${getLatenessPercentage(r.lateness)}%</span></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${decimalToHHMM(getAvgHours(r.hours))}</td>
              </tr>
            `;
          }
          
          html += `
                </tbody>
              </table>
            </div>
          `;
        }

        container.innerHTML = html;
        document.body.appendChild(container);

        // Capture the styled content as an image
        const canvas = await html2canvas(container);
        document.body.removeChild(container);

        // Create PDF with the captured image
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297; // A4 height in mm

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
        }

        pdf.save(`performance-${scope.value}-${startDate.value}_${endDate.value}.pdf`);
      } catch (err) {
        console.error('Error exporting PDF:', err);
        toast.error('Error exporting: ' + err.message);
      }
    };

    return {
      scope,
      targetId,
      startDate,
      endDate,
      kpiData,
      teamResults,
      availableUsers,
      availableTeams,
      clockHistory,
      latenessChart,
      hoursChart,
      loadData,
      exportPdf,
      getLatenessPercentage,
      getLatenessColor,
      getLatenessBadgeColor,
      getAvgHours,
      getHoursColor,
      getHoursBadgeColor,
      formatTime,
      decimalToHHMM,
      formatDate,
      getClockStatus,
      getClockBadge,
      isClockInLate,
      isClockOutEarly,
      getClockInStyle,
      getClockOutStyle
    };
  }
};
</script>

<style scoped>
.lead {
  font-size: 1.1rem;
  line-height: 1.6;
}
</style>

