<template>
  <div class="container-fluid mt-4">
    <h2 class="mb-4">Performance Metrics</h2>

    <!-- Filters and controls -->
    <div class="card p-3 mb-4">
      <div class="row">
        <div class="col-md-2">
          <label class="form-label fw-bold" for="kpi-scope">Scope</label>
          <select id="kpi-scope" class="form-select" v-model="scope">
            <option value="user">User</option>
            <option value="team">Team</option>
          </select>
        </div>

        <div class="col-md-3" v-if="scope === 'user'">
          <label class="form-label fw-bold" for="kpi-target-user">Select User</label>
          <select id="kpi-target-user" class="form-select" v-model.number="targetId">
            <option :value="null" disabled>-- Choose a user --</option>
            <option v-for="u in availableUsers" :key="u.idUser" :value="u.idUser">
              {{ u.firstname }} {{ u.lastname }}
            </option>
          </select>
        </div>

        <div class="col-md-3" v-if="scope === 'team'">
          <label class="form-label fw-bold" for="kpi-target-team">Select Team</label>
          <select id="kpi-target-team" class="form-select" v-model.number="targetId">
            <option :value="null" disabled>-- Choose a team --</option>
            <option v-for="t in availableTeams" :key="t.idTeam" :value="t.idTeam">
              {{ t.name }}
            </option>
          </select>
        </div>

        <div class="col-md-2">
          <label class="form-label fw-bold" for="kpi-start-date">Start Date</label>
          <input id="kpi-start-date" type="date" class="form-control" v-model="startDate" />
        </div>

        <div class="col-md-2">
          <label class="form-label fw-bold" for="kpi-end-date">End Date</label>
          <input id="kpi-end-date" type="date" class="form-control" v-model="endDate" />
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
                style="display: inline-block; padding: 20px 40px; border-radius: 10px;"
              >
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
                style="display: inline-block; padding: 20px 40px; border-radius: 10px;"
              >
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
                  style="font-size: 1rem; padding: 8px 12px;"
                >
                  {{ getLatenessPercentage(r.lateness) }}%
                </span>
              </td>
              <td>{{ decimalToHHMM(r.hours.total) }}</td>
              <td>
                <span
                  :class="'badge ' + getHoursBadgeColor(r.hours)"
                  style="font-size: 1rem; padding: 8px 12px;"
                >
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
import { ref, onMounted, nextTick } from 'vue';
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

        const teamsRes = await teamsService.getAllTeams();
        availableTeams.value = teamsRes;

        if (currentUser && currentUser.profile === 'manager') {
          const mgrTeams = await teamsService.getTeamsByUserId(currentUser.id);
          const uniqueUsers = new Map();

          if (currentUser.id) {
            uniqueUsers.set(currentUser.id, {
              idUser: currentUser.id,
              firstname: currentUser.firstname,
              lastname: currentUser.lastname,
            });
          }

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
      const pct = Number.parseFloat(getLatenessPercentage(lateness));
      if (pct < 5) return 'bg-success text-white';
      if (pct < 15) return 'bg-warning text-dark';
      return 'bg-danger text-white';
    };

    const getLatenessBadgeColor = (lateness) => {
      const pct = Number.parseFloat(getLatenessPercentage(lateness));
      if (pct < 5) return 'bg-success';
      if (pct < 15) return 'bg-warning';
      return 'bg-danger';
    };

    const getAvgHours = (hours) => {
      if (hours.totalDays === 0) return 0;
      return hours.total / hours.totalDays;
    };

    const getHoursColor = (hours) => {
      const avg = Number.parseFloat(String(getAvgHours(hours)));
      return avg >= 8 ? 'bg-success text-white' : 'bg-danger text-white';
    };

    const getHoursBadgeColor = (hours) => {
      const avg = Number.parseFloat(String(getAvgHours(hours)));
      return avg >= 8 ? 'bg-success' : 'bg-danger';
    };

    const formatTime = (iso) => {
      if (!iso) return '-';
      const d = new Date(iso);
      const hours = String(d.getUTCHours()).padStart(2, '0');
      const minutes = String(d.getUTCMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const decimalToHHMM = (hours) => {
      if (hours === null || hours === undefined) return '-';
      const numeric = typeof hours === 'number' ? hours : Number.parseFloat(String(hours));
      if (Number.isNaN(numeric)) return '-';

      const h = Math.floor(numeric);
      const m = Math.round((numeric - h) * 60);
      return `${h}:${m.toString().padStart(2, '0')}`;
    };

    const formatDate = (iso) => {
      if (!iso) return '-';
      return new Date(iso).toLocaleDateString();
    };

    /**
     * ---- Refactor: reduce cognitive complexity (isClockInLate) ----
     */
    const toMinutes = (h, m) => h * 60 + m;

    const getClockInMinutes = (clockInIso) => {
      const d = new Date(clockInIso);
      return toMinutes(d.getUTCHours(), d.getUTCMinutes());
    };

    const getPlannedStartMinutesWithGrace = (planningStartIso, graceMinutes = 5) => {
      const p = new Date(planningStartIso);
      const baseMin = toMinutes(p.getUTCHours(), p.getUTCMinutes());
      return baseMin + graceMinutes;
    };

    const getDefaultStartMinutesWithGrace = (graceMinutes = 5) => toMinutes(9, 0) + graceMinutes;

    const isClockInLate = (clock) => {
      if (!clock?.clockIn) return false;

      const clockMin = getClockInMinutes(clock.clockIn);

      const plannedIso = clock.planning?.startTime;
      if (plannedIso) {
        const plannedMin = getPlannedStartMinutesWithGrace(plannedIso, 5);
        return clockMin > plannedMin;
      }

      return clockMin > getDefaultStartMinutesWithGrace(5);
    };

    const isClockOutEarly = (clock) => {
      if (!clock?.clockOut) return false;

      const clockOutTime = new Date(clock.clockOut);

      if (clock.planning?.endTime) {
        const plannedEnd = new Date(clock.planning.endTime);
        return clockOutTime < plannedEnd;
      }

      const h = clockOutTime.getUTCHours();
      const m = clockOutTime.getUTCMinutes();
      return h < 17 || (h === 17 && m < 0);
    };

    const getClockInStyle = (clock) => (isClockInLate(clock) ? 'color: #dc3545; font-weight: bold;' : '');
    const getClockOutStyle = (clock) => (isClockOutEarly(clock) ? 'color: #dc3545; font-weight: bold;' : '');

    const getClockStatus = (clock) => {
      const raw = clock?.hoursWorked;
      if (raw === null || raw === undefined) return 'No data';

      const hours = typeof raw === 'number' ? raw : Number.parseFloat(String(raw));
      if (Number.isNaN(hours)) return 'No data';

      if (hours < 8) return 'Short';
      if (hours > 8.5) return 'Overtime';
      return 'Normal';
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
            datasets: [{ data: [onTimeCount, lateCount], backgroundColor: ['#198754', '#dc3545'] }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
      }

      if (kpiData.value && hoursChart.value) {
        const avgHours = Number.parseFloat(String(getAvgHours(kpiData.value.hours)));
        const targetHours = 8;
        const convertToHHMM = decimalToHHMM;

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
            scales: { y: { beginAtZero: false, min: 6, max: 9, ticks: { stepSize: 0.5 } } },
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (context) => convertToHHMM(context.parsed.y) } }
            }
          }
        });
      }
    };

    const validateSelectionOrToast = () => {
      if (targetId.value) return true;
      toast.warning('Please select a ' + (scope.value === 'user' ? 'user' : 'team'));
      return false;
    };

    const resetResults = () => {
      kpiData.value = null;
      teamResults.value = null;
      clockHistory.value = [];
    };

    const buildPayload = () => ({
      scope: scope.value,
      start: startDate.value,
      end: endDate.value
    });

    const buildPlanningsMaps = (plannings) => {
      const planningsByDate = {};
      const planningsByDayOfWeek = {};

      plannings.forEach((p) => {
        if (p?.isTemplate && p.dayOfWeek !== null && p.dayOfWeek !== undefined) {
          planningsByDayOfWeek[p.dayOfWeek] = p;
          return;
        }
        if (p?.date) {
          const dateKey = new Date(p.date).toDateString();
          planningsByDate[dateKey] = p;
        }
      });

      return { planningsByDate, planningsByDayOfWeek };
    };

    const attachPlanningToClocks = (clocks, planningsByDate, planningsByDayOfWeek, rangeStart, rangeEnd) => {
      return clocks
        .filter((c) => {
          const d = new Date(c.clockIn);
          return d >= rangeStart && d <= rangeEnd;
        })
        .map((c) => {
          const d = new Date(c.clockIn);
          const dateKey = d.toDateString();
          const dayOfWeek = (d.getDay() + 6) % 7;

          const planning = planningsByDate[dateKey] || planningsByDayOfWeek[dayOfWeek];
          return { ...c, planning };
        })
        .sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn));
    };

    const loadUserData = async (payload) => {
      payload.targetUserId = Number(targetId.value);

      const res = await kpiService.compute(payload);
      kpiData.value = res.data;

      const clocksRes = await clockService.getByUserId(targetId.value);
      const rangeStart = new Date(startDate.value);
      const rangeEnd = new Date(endDate.value);

      const plannings = await planningService.getByUserId(targetId.value);
      const { planningsByDate, planningsByDayOfWeek } = buildPlanningsMaps(plannings);

      clockHistory.value = attachPlanningToClocks(
        clocksRes,
        planningsByDate,
        planningsByDayOfWeek,
        rangeStart,
        rangeEnd
      );

      await createCharts();
    };

    const loadTeamData = async (payload) => {
      payload.targetTeamId = Number(targetId.value);
      const res = await kpiService.compute(payload);
      teamResults.value = res.data.teamResults;
    };

    const loadData = async () => {
      if (!validateSelectionOrToast()) return;

      resetResults();

      try {
        const payload = buildPayload();
        if (scope.value === 'user') {
          await loadUserData(payload);
        } else {
          await loadTeamData(payload);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        toast.error('Error: ' + (err.response?.data?.error || err.message));
      }
    };

    const getLatenessBgColor = (lateness) => {
      const pct = Number.parseFloat(getLatenessPercentage(lateness));
      if (pct < 5) return '#d4edda';
      if (pct < 15) return '#fff3cd';
      return '#f8d7da';
    };

    /**
     * ---- Refactor: reduce cognitive complexity (exportPdf) ----
     * Keep same output, only split into helpers.
     */
    const buildPdfContainer = () => {
      const container = document.createElement('div');
      container.style.backgroundColor = '#fff';
      container.style.padding = '20px';
      container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      return container;
    };

    const buildPdfHeaderHtml = () => {
      return `
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 24px; margin-bottom: 10px;">Performance Metrics Report</h1>
          <p style="color: #666; font-size: 14px;">Period: ${startDate.value} to ${endDate.value}</p>
        </div>
      `;
    };

    const buildUserSummaryCardsHtml = (d) => {
      return `
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
    };

    const buildClockHistoryTableHeaderHtml = () => {
      return `
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
    };

    const buildClockHistoryRowHtml = (c) => {
      const lateStyle = isClockInLate(c) ? 'color: #dc3545; font-weight: bold;' : '';
      const earlyStyle = isClockOutEarly(c) ? 'color: #dc3545; font-weight: bold;' : '';

      const clockOutText = c.clockOut ? formatTime(c.clockOut) : '-';
      const hoursText = c.hoursWorked ? decimalToHHMM(c.hoursWorked) : '-';

      return `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(c.clockIn)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; ${lateStyle}">${formatTime(c.clockIn)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; ${earlyStyle}">${clockOutText}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${hoursText}</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><span style="background-color: #e7f3ff; padding: 2px 6px; border-radius: 3px;">${getClockStatus(c)}</span></td>
        </tr>
      `;
    };

    const buildClockHistoryTableFooterHtml = () => {
      return `
            </tbody>
          </table>
        </div>
      `;
    };

    const buildUserPdfHtml = () => {
      const d = kpiData.value;
      if (!d) return '';

      let html = buildUserSummaryCardsHtml(d);

      if (clockHistory.value.length > 0) {
        html += buildClockHistoryTableHeaderHtml();
        for (const c of clockHistory.value.slice(0, 30)) {
          html += buildClockHistoryRowHtml(c);
        }
        html += buildClockHistoryTableFooterHtml();
      }

      return html;
    };

    const buildTeamTableHeaderHtml = () => {
      return `
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
    };

    const buildTeamRowHtml = (r) => {
      const bg = getLatenessBgColor(r.lateness);
      return `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>${r.user.firstname} ${r.user.lastname}</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${r.lateness.onTimeDays} / ${r.lateness.totalDays}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <span style="background-color: ${bg}; padding: 2px 6px; border-radius: 3px;">
              ${getLatenessPercentage(r.lateness)}%
            </span>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">${decimalToHHMM(getAvgHours(r.hours))}</td>
        </tr>
      `;
    };

    const buildTeamTableFooterHtml = () => {
      return `
            </tbody>
          </table>
        </div>
      `;
    };

    const buildTeamPdfHtml = () => {
      if (!teamResults.value) return '';
      let html = buildTeamTableHeaderHtml();
      for (const r of teamResults.value) {
        html += buildTeamRowHtml(r);
      }
      html += buildTeamTableFooterHtml();
      return html;
    };

    const buildReportHtml = () => {
      let html = buildPdfHeaderHtml();

      if (scope.value === 'user' && kpiData.value) {
        html += buildUserPdfHtml();
      } else if (teamResults.value) {
        html += buildTeamPdfHtml();
      }

      return html;
    };

    const exportPdf = async () => {
      try {
        const container = buildPdfContainer();
        container.innerHTML = buildReportHtml();
        document.body.appendChild(container);

        const canvas = await html2canvas(container);

        // prefer childNode.remove()
        container.remove();

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;

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
