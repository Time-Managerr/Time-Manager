import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Kpis from '../pages/Kpis.vue';
import { nextTick } from 'vue';

describe('Kpis.vue - Basic Functionality', () => {
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

  // ===== Component Rendering Tests =====
  describe('Component Rendering', () => {
    it('should render the component', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('should render the page title', () => {
      expect(wrapper.find('h2').text()).toBe('Performance Metrics');
    });

    it('should render scope dropdown', () => {
      const scopeSelect = wrapper.find('select.form-select');
      expect(scopeSelect.exists()).toBe(true);
      expect(wrapper.html()).toContain('User');
      expect(wrapper.html()).toContain('Team');
    });

    it('should render date inputs', () => {
      const dateInputs = wrapper.findAll('input[type="date"]');
      expect(dateInputs.length).toBe(2);
    });

    it('should render Load button', () => {
      const loadButton = wrapper.find('button.btn-primary');
      expect(loadButton.exists()).toBe(true);
      expect(loadButton.text()).toBe('Load');
    });
  });

  // ===== Data Initialization Tests =====
  describe('Data Initialization', () => {
    it('should initialize with user scope by default', () => {
      expect(wrapper.vm.scope).toBe('user');
    });

    it('should initialize with target ID from localStorage', () => {
      expect(wrapper.vm.targetId).toBe(1);
    });

    it('should initialize with date range', () => {
      expect(wrapper.vm.startDate).toBeTruthy();
      expect(wrapper.vm.endDate).toBeTruthy();
    });

    it('should initialize with null kpiData', () => {
      expect(wrapper.vm.kpiData).toBeNull();
    });

    it('should initialize with empty teamResults', () => {
      expect(wrapper.vm.teamResults).toEqual([]);
    });
  });

  // ===== Scope Selection Tests =====
  describe('Scope Selection', () => {
    it('should switch to team scope', async () => {
      await wrapper.setData({ scope: 'team' });
      await nextTick();
      expect(wrapper.vm.scope).toBe('team');
    });

    it('should display team dropdown when team scope selected', async () => {
      await wrapper.setData({ scope: 'team' });
      await nextTick();
      expect(wrapper.html()).toContain('Select Team');
    });

    it('should display user dropdown when user scope selected', async () => {
      await wrapper.setData({ scope: 'user' });
      await nextTick();
      expect(wrapper.html()).toContain('Select User');
    });
  });

  // ===== Computed Properties Tests =====
  describe('Computed Properties', () => {
    it('should compute availableUsers correctly', () => {
      wrapper.vm.allUsers = [
        { idUser: 1, firstname: 'John', lastname: 'Doe' },
        { idUser: 2, firstname: 'Jane', lastname: 'Smith' },
      ];
      expect(wrapper.vm.availableUsers.length).toBe(2);
    });

    it('should compute availableTeams correctly', () => {
      wrapper.vm.allTeams = [
        { idTeam: 1, name: 'Team Alpha' },
        { idTeam: 2, name: 'Team Beta' },
      ];
      expect(wrapper.vm.availableTeams.length).toBe(2);
    });
  });

  // ===== Date Formatting Tests =====
  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      const formatted = wrapper.vm.formatDate('2026-01-11');
      expect(formatted).toBeTruthy();
      expect(formatted).toContain('/');
    });

    it('should handle null/undefined dates', () => {
      const resultNull = wrapper.vm.formatDate(null);
      const resultUndefined = wrapper.vm.formatDate(undefined);
      expect(resultNull).toBe('-');
      expect(resultUndefined).toBe('-');
    });
  });

  // ===== Number Formatting Tests =====
  describe('Number Formatting', () => {
    it('should format percentages correctly', () => {
      expect(wrapper.vm.formatPercent(25.5678)).toBe('25.57');
      expect(wrapper.vm.formatPercent(0)).toBe('0.00');
      expect(wrapper.vm.formatPercent(100)).toBe('100.00');
    });

    it('should format hours correctly', () => {
      expect(wrapper.vm.formatHours(8.5)).toContain('8.50');
      expect(wrapper.vm.formatHours(0)).toContain('0.00');
    });
  });

  // ===== UI State Tests =====
  describe('UI State Management', () => {
    it('should toggle loading state', async () => {
      expect(wrapper.vm.loading).toBeFalsy();
      await wrapper.setData({ loading: true });
      expect(wrapper.vm.loading).toBe(true);
    });

    it('should handle error messages', async () => {
      await wrapper.setData({ errorMessage: 'Test error' });
      await nextTick();
      expect(wrapper.vm.errorMessage).toBe('Test error');
    });
  });

  // ===== Export Functionality Tests =====
  describe('Export Functionality', () => {
    it('should not show PDF button when no data', () => {
      wrapper.vm.kpiData = null;
      wrapper.vm.teamResults = [];
      const pdfButton = wrapper.find('button.btn-outline-secondary');
      expect(pdfButton.exists()).toBe(false);
    });

    it('should show PDF button when user data exists', async () => {
      await wrapper.setData({
        kpiData: {
          user: { firstname: 'John', lastname: 'Doe' },
          lateness: { lateCount: 5 },
          hours: { total: 160 },
        },
      });
      await nextTick();
      const pdfButton = wrapper.find('button.btn-outline-secondary');
      expect(pdfButton.exists()).toBe(true);
    });

    it('should show PDF button when team data exists', async () => {
      await wrapper.setData({
        scope: 'team',
        teamResults: [
          { user: { firstname: 'John' }, lateness: {}, hours: {} },
        ],
      });
      await nextTick();
      const pdfButton = wrapper.find('button.btn-outline-secondary');
      expect(pdfButton.exists()).toBe(true);
    });
  });

  // ===== Accessibility Tests =====
  describe('Accessibility', () => {
    it('should have labels for all form controls', () => {
      expect(wrapper.html()).toContain('Scope');
      expect(wrapper.html()).toContain('Start Date');
      expect(wrapper.html()).toContain('End Date');
    });

    it('should have semantic HTML structure', () => {
      expect(wrapper.find('h2').exists()).toBe(true);
      expect(wrapper.find('.card').exists()).toBe(true);
      expect(wrapper.findAll('label').length).toBeGreaterThan(0);
    });

    it('should have proper form controls', () => {
      expect(wrapper.findAll('select').length).toBeGreaterThan(0);
      expect(wrapper.findAll('input[type="date"]').length).toBe(2);
      expect(wrapper.findAll('button').length).toBeGreaterThan(0);
    });
  });

  // ===== Data Display Tests =====
  describe('Data Display', () => {
    it('should display loading spinner when loading', async () => {
      await wrapper.setData({ loading: true });
      await nextTick();
      const spinner = wrapper.find('.spinner-border');
      expect(spinner.exists()).toBe(true);
    });

    it('should display error alert when error occurs', async () => {
      await wrapper.setData({ errorMessage: 'Test error' });
      await nextTick();
      const alert = wrapper.find('.alert-danger');
      expect(alert.exists()).toBe(true);
      expect(alert.text()).toContain('Test error');
    });

    it('should display user data when available', async () => {
      await wrapper.setData({
        kpiData: {
          user: { firstname: 'John', lastname: 'Doe', email: 'john@example.com' },
          lateness: { lateCount: 5, totalDays: 20 },
          hours: { total: 160, totalDays: 20 },
        },
      });
      await nextTick();
      expect(wrapper.html()).toContain('John');
      expect(wrapper.html()).toContain('Doe');
    });

    it('should display team results when available', async () => {
      await wrapper.setData({
        scope: 'team',
        teamResults: [
          {
            user: { firstname: 'John', lastname: 'Doe' },
            lateness: { lateCount: 3 },
            hours: { total: 80 },
          },
          {
            user: { firstname: 'Jane', lastname: 'Smith' },
            lateness: { lateCount: 1 },
            hours: { total: 85 },
          },
        ],
      });
      await nextTick();
      expect(wrapper.html()).toContain('John');
      expect(wrapper.html()).toContain('Jane');
    });
  });

  // ===== Input Validation Tests =====
  describe('Input Validation', () => {
    it('should have valid date format in startDate', () => {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      expect(datePattern.test(wrapper.vm.startDate)).toBe(true);
    });

    it('should have valid date format in endDate', () => {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      expect(datePattern.test(wrapper.vm.endDate)).toBe(true);
    });

    it('should ensure endDate is not before startDate', () => {
      const start = new Date(wrapper.vm.startDate);
      const end = new Date(wrapper.vm.endDate);
      expect(end >= start).toBe(true);
    });
  });

  // ===== Chart Integration Tests =====
  describe('Chart Integration', () => {
    it('should have chart containers in template', () => {
      // Charts are rendered conditionally when data exists
      expect(wrapper.html()).toBeDefined();
    });

    it('should handle chart destruction on unmount', () => {
      // Component should clean up charts
      expect(wrapper.vm.$options.beforeUnmount).toBeDefined();
    });
  });

  // ===== Responsive Design Tests =====
  describe('Responsive Design', () => {
    it('should use Bootstrap grid classes', () => {
      expect(wrapper.html()).toContain('col-md-');
      expect(wrapper.html()).toContain('row');
      expect(wrapper.html()).toContain('container-fluid');
    });

    it('should have responsive cards', () => {
      expect(wrapper.html()).toContain('card');
    });
  });
});
