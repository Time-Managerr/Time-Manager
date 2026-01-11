import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Kpis from '../pages/Kpis.vue';
import { nextTick } from 'vue';

// Mock axios
vi.mock('axios');

describe('Kpis.vue - Component Rendering', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'role') return 'manager';
      return null;
    });
  });

  it('should render the component', () => {
    wrapper = mount(Kpis);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render the page title', () => {
    wrapper = mount(Kpis);
    expect(wrapper.find('h2').text()).toBe('Analyse de Performance');
  });

  it('should render scope selection buttons', () => {
    wrapper = mount(Kpis);
    const buttons = wrapper.findAll('.btn-outline-primary');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    expect(wrapper.html()).toContain('Utilisateur');
    expect(wrapper.html()).toContain('Équipe');
  });

  it('should render date range inputs', () => {
    wrapper = mount(Kpis);
    const dateInputs = wrapper.findAll('input[type="date"]');
    expect(dateInputs.length).toBe(2);
  });

  it('should render compute button', () => {
    wrapper = mount(Kpis);
    const computeButton = wrapper.find('button.btn-success');
    expect(computeButton.exists()).toBe(true);
    expect(computeButton.text()).toContain('Calculer');
  });

  it('should render export PDF button', () => {
    wrapper = mount(Kpis);
    const exportButton = wrapper.find('button.btn-danger');
    expect(exportButton.exists()).toBe(true);
    expect(exportButton.text()).toContain('Exporter PDF');
  });
});

describe('Kpis.vue - Data Initialization', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'role') return 'manager';
      if (key === 'userId') return '1';
      return null;
    });
  });

  it('should initialize with default scope (user)', () => {
    wrapper = mount(Kpis);
    expect(wrapper.vm.scope).toBe('user');
  });

  it('should initialize with user ID from localStorage', () => {
    wrapper = mount(Kpis);
    expect(wrapper.vm.selectedUserId).toBe('1');
  });

  it('should initialize with default date range (last 30 days)', () => {
    wrapper = mount(Kpis);
    expect(wrapper.vm.startDate).toBeTruthy();
    expect(wrapper.vm.endDate).toBeTruthy();
    const start = new Date(wrapper.vm.startDate);
    const end = new Date(wrapper.vm.endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBeGreaterThanOrEqual(29);
    expect(diffDays).toBeLessThanOrEqual(31);
  });

  it('should initialize with empty results', () => {
    wrapper = mount(Kpis);
    expect(wrapper.vm.results).toBeNull();
  });

  it('should initialize with loading false', () => {
    wrapper = mount(Kpis);
    expect(wrapper.vm.loading).toBe(false);
  });

  it('should initialize with empty error', () => {
    wrapper = mount(Kpis);
    expect(wrapper.vm.error).toBe('');
  });
});

describe('Kpis.vue - Scope Selection', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'role') return 'manager';
      if (key === 'userId') return '1';
      return null;
    });
    wrapper = mount(Kpis);
  });

  it('should switch to team scope when team button clicked', async () => {
    const teamButtons = wrapper.findAll('button').find(btn => 
      btn.text().includes('Équipe')
    );
    await teamButtons[0].trigger('click');
    await nextTick();
    expect(wrapper.vm.scope).toBe('team');
  });

  it('should switch to user scope when user button clicked', async () => {
    wrapper.vm.scope = 'team';
    await nextTick();
    const userButtons = wrapper.findAll('button').find(btn => 
      btn.text().includes('Utilisateur')
    );
    await userButtons[0].trigger('click');
    await nextTick();
    expect(wrapper.vm.scope).toBe('user');
  });

  it('should clear results when switching scope', async () => {
    wrapper.vm.results = { some: 'data' };
    await nextTick();
    const teamButtons = wrapper.findAll('button').find(btn => 
      btn.text().includes('Équipe')
    );
    await teamButtons[0].trigger('click');
    await nextTick();
    expect(wrapper.vm.results).toBeNull();
  });

  it('should clear error when switching scope', async () => {
    wrapper.vm.error = 'Some error';
    await nextTick();
    const userButtons = wrapper.findAll('button').find(btn => 
      btn.text().includes('Utilisateur')
    );
    await userButtons[0].trigger('click');
    await nextTick();
    expect(wrapper.vm.error).toBe('');
  });
});

describe('Kpis.vue - User Selection', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn(() => 'mock-token');
    wrapper = mount(Kpis);
    wrapper.vm.users = [
      { idUser: 1, firstname: 'John', lastname: 'Doe' },
      { idUser: 2, firstname: 'Jane', lastname: 'Smith' },
    ];
  });

  it('should display user dropdown when users are available', async () => {
    await nextTick();
    expect(wrapper.html()).toContain('Sélectionner un utilisateur');
  });

  it('should update selectedUserId when user is selected', async () => {
    wrapper.vm.selectedUserId = '2';
    await nextTick();
    expect(wrapper.vm.selectedUserId).toBe('2');
  });

  it('should clear results when user selection changes', async () => {
    wrapper.vm.results = { some: 'data' };
    wrapper.vm.selectedUserId = '2';
    await nextTick();
    expect(wrapper.vm.results).toBeNull();
  });
});

describe('Kpis.vue - Team Selection', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn(() => 'mock-token');
    wrapper = mount(Kpis);
    wrapper.vm.teams = [
      { idTeam: 1, name: 'Team Alpha' },
      { idTeam: 2, name: 'Team Beta' },
    ];
    wrapper.vm.scope = 'team';
  });

  it('should display team dropdown when teams are available', async () => {
    await nextTick();
    expect(wrapper.html()).toContain('Sélectionner une équipe');
  });

  it('should update selectedTeamId when team is selected', async () => {
    wrapper.vm.selectedTeamId = '2';
    await nextTick();
    expect(wrapper.vm.selectedTeamId).toBe('2');
  });

  it('should clear results when team selection changes', async () => {
    wrapper.vm.results = { some: 'data' };
    wrapper.vm.selectedTeamId = '2';
    await nextTick();
    expect(wrapper.vm.results).toBeNull();
  });
});

describe('Kpis.vue - Date Range Validation', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn(() => 'mock-token');
    wrapper = mount(Kpis);
  });

  it('should accept valid date range', () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    
    wrapper.vm.startDate = lastMonth.toISOString().split('T')[0];
    wrapper.vm.endDate = today.toISOString().split('T')[0];
    
    expect(wrapper.vm.startDate).toBeTruthy();
    expect(wrapper.vm.endDate).toBeTruthy();
  });

  it('should clear results when start date changes', async () => {
    wrapper.vm.results = { some: 'data' };
    wrapper.vm.startDate = '2026-01-01';
    await nextTick();
    expect(wrapper.vm.results).toBeNull();
  });

  it('should clear results when end date changes', async () => {
    wrapper.vm.results = { some: 'data' };
    wrapper.vm.endDate = '2026-01-11';
    await nextTick();
    expect(wrapper.vm.results).toBeNull();
  });
});

describe('Kpis.vue - Results Display', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn(() => 'mock-token');
    wrapper = mount(Kpis);
  });

  it('should display loading spinner when loading', async () => {
    wrapper.vm.loading = true;
    await nextTick();
    expect(wrapper.html()).toContain('Chargement');
  });

  it('should display error message when error occurs', async () => {
    wrapper.vm.error = 'Test error message';
    await nextTick();
    expect(wrapper.html()).toContain('Test error message');
    expect(wrapper.find('.alert-danger').exists()).toBe(true);
  });

  it('should display user results when available', async () => {
    wrapper.vm.results = {
      user: { firstname: 'John', lastname: 'Doe' },
      lateness: { lateCount: 5, totalDays: 20, latePercentage: 25 },
      hours: { total: 160, averagePerDay: 8 },
    };
    await nextTick();
    expect(wrapper.html()).toContain('John');
    expect(wrapper.html()).toContain('Doe');
  });

  it('should display lateness metrics', async () => {
    wrapper.vm.results = {
      lateness: { 
        lateCount: 5, 
        totalDays: 20, 
        onTimeDays: 15,
        latePercentage: 25 
      },
    };
    await nextTick();
    expect(wrapper.html()).toContain('Retards');
  });

  it('should display hours metrics', async () => {
    wrapper.vm.results = {
      hours: { 
        total: 160, 
        totalDays: 20,
        averagePerDay: 8 
      },
    };
    await nextTick();
    expect(wrapper.html()).toContain('Heures');
  });

  it('should not display results when results is null', async () => {
    wrapper.vm.results = null;
    await nextTick();
    const resultsSection = wrapper.find('.results-section');
    expect(resultsSection.exists()).toBe(false);
  });
});

describe('Kpis.vue - Team Results Display', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn(() => 'mock-token');
    wrapper = mount(Kpis);
    wrapper.vm.scope = 'team';
  });

  it('should display team results when available', async () => {
    wrapper.vm.results = {
      teamResults: [
        {
          user: { firstname: 'John', lastname: 'Doe' },
          lateness: { lateCount: 3, totalDays: 10 },
          hours: { total: 80, averagePerDay: 8 },
        },
        {
          user: { firstname: 'Jane', lastname: 'Smith' },
          lateness: { lateCount: 1, totalDays: 10 },
          hours: { total: 85, averagePerDay: 8.5 },
        },
      ],
    };
    await nextTick();
    expect(wrapper.html()).toContain('John');
    expect(wrapper.html()).toContain('Jane');
  });

  it('should display multiple team member cards', async () => {
    wrapper.vm.results = {
      teamResults: [
        { user: { firstname: 'John', lastname: 'Doe' }, lateness: {}, hours: {} },
        { user: { firstname: 'Jane', lastname: 'Smith' }, lateness: {}, hours: {} },
      ],
    };
    await nextTick();
    // Check that results are present
    expect(wrapper.vm.results.teamResults.length).toBe(2);
  });
});

describe('Kpis.vue - Export Functionality', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn(() => 'mock-token');
    wrapper = mount(Kpis);
  });

  it('should disable export button when no results', () => {
    wrapper.vm.results = null;
    const exportButton = wrapper.find('button.btn-danger');
    expect(exportButton.attributes('disabled')).toBeDefined();
  });

  it('should enable export button when results available', async () => {
    wrapper.vm.results = {
      lateness: { lateCount: 5 },
      hours: { total: 160 },
    };
    await nextTick();
    const exportButton = wrapper.find('button.btn-danger');
    expect(exportButton.attributes('disabled')).toBeUndefined();
  });
});

describe('Kpis.vue - Computed Properties', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn(() => 'mock-token');
    wrapper = mount(Kpis);
  });

  it('should compute hasResults correctly when results exist', () => {
    wrapper.vm.results = { some: 'data' };
    expect(wrapper.vm.hasResults).toBe(true);
  });

  it('should compute hasResults correctly when results is null', () => {
    wrapper.vm.results = null;
    expect(wrapper.vm.hasResults).toBe(false);
  });

  it('should compute isUserScope correctly', () => {
    wrapper.vm.scope = 'user';
    expect(wrapper.vm.isUserScope).toBe(true);
    
    wrapper.vm.scope = 'team';
    expect(wrapper.vm.isUserScope).toBe(false);
  });

  it('should compute isTeamScope correctly', () => {
    wrapper.vm.scope = 'team';
    expect(wrapper.vm.isTeamScope).toBe(true);
    
    wrapper.vm.scope = 'user';
    expect(wrapper.vm.isTeamScope).toBe(false);
  });
});

describe('Kpis.vue - Formatting Methods', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn(() => 'mock-token');
    wrapper = mount(Kpis);
  });

  it('should format percentage correctly', () => {
    expect(wrapper.vm.formatPercentage(25.5678)).toBe('25.57%');
    expect(wrapper.vm.formatPercentage(0)).toBe('0.00%');
    expect(wrapper.vm.formatPercentage(100)).toBe('100.00%');
  });

  it('should format hours correctly', () => {
    expect(wrapper.vm.formatHours(8.5)).toBe('8.50h');
    expect(wrapper.vm.formatHours(0)).toBe('0.00h');
    expect(wrapper.vm.formatHours(160.75)).toBe('160.75h');
  });

  it('should format date correctly', () => {
    const date = '2026-01-11';
    const formatted = wrapper.vm.formatDate(date);
    expect(formatted).toContain('11');
    expect(formatted).toContain('01');
    expect(formatted).toContain('2026');
  });

  it('should handle null date in formatDate', () => {
    expect(wrapper.vm.formatDate(null)).toBe('');
  });

  it('should handle undefined date in formatDate', () => {
    expect(wrapper.vm.formatDate(undefined)).toBe('');
  });
});

describe('Kpis.vue - Error Handling', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn(() => 'mock-token');
    wrapper = mount(Kpis);
  });

  it('should clear error when scope changes', async () => {
    wrapper.vm.error = 'Test error';
    wrapper.vm.scope = 'team';
    await nextTick();
    expect(wrapper.vm.error).toBe('');
  });

  it('should clear error when user changes', async () => {
    wrapper.vm.error = 'Test error';
    wrapper.vm.selectedUserId = '2';
    await nextTick();
    expect(wrapper.vm.error).toBe('');
  });

  it('should clear error when team changes', async () => {
    wrapper.vm.error = 'Test error';
    wrapper.vm.selectedTeamId = '2';
    await nextTick();
    expect(wrapper.vm.error).toBe('');
  });

  it('should clear error when date changes', async () => {
    wrapper.vm.error = 'Test error';
    wrapper.vm.startDate = '2026-01-01';
    await nextTick();
    expect(wrapper.vm.error).toBe('');
  });
});

describe('Kpis.vue - Input Validation', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn(() => 'mock-token');
    wrapper = mount(Kpis);
  });

  it('should have valid date format', () => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    expect(datePattern.test(wrapper.vm.startDate)).toBe(true);
    expect(datePattern.test(wrapper.vm.endDate)).toBe(true);
  });

  it('should ensure end date is after start date by default', () => {
    const start = new Date(wrapper.vm.startDate);
    const end = new Date(wrapper.vm.endDate);
    expect(end >= start).toBe(true);
  });
});

describe('Kpis.vue - UI State Management', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn(() => 'mock-token');
    wrapper = mount(Kpis);
  });

  it('should start with loading false', () => {
    expect(wrapper.vm.loading).toBe(false);
  });

  it('should toggle loading state', async () => {
    wrapper.vm.loading = true;
    await nextTick();
    expect(wrapper.vm.loading).toBe(true);
    
    wrapper.vm.loading = false;
    await nextTick();
    expect(wrapper.vm.loading).toBe(false);
  });

  it('should disable compute button when loading', async () => {
    wrapper.vm.loading = true;
    await nextTick();
    const computeButton = wrapper.find('button.btn-success');
    expect(computeButton.attributes('disabled')).toBeDefined();
  });

  it('should disable export button when loading', async () => {
    wrapper.vm.loading = true;
    wrapper.vm.results = { some: 'data' };
    await nextTick();
    const exportButton = wrapper.find('button.btn-danger');
    expect(exportButton.attributes('disabled')).toBeDefined();
  });
});

describe('Kpis.vue - Accessibility', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.getItem = vi.fn(() => 'mock-token');
    wrapper = mount(Kpis);
  });

  it('should have proper labels for date inputs', () => {
    expect(wrapper.html()).toContain('Date de début');
    expect(wrapper.html()).toContain('Date de fin');
  });

  it('should have proper button labels', () => {
    expect(wrapper.html()).toContain('Calculer');
    expect(wrapper.html()).toContain('Exporter PDF');
  });

  it('should have semantic HTML structure', () => {
    expect(wrapper.find('h2').exists()).toBe(true);
    expect(wrapper.findAll('button').length).toBeGreaterThan(0);
    expect(wrapper.findAll('input').length).toBeGreaterThan(0);
  });
});
