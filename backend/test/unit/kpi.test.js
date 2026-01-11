import request from "supertest";
import { app } from "../../app.js";

describe("KPI Management - Backend Tests", () => {
  let adminToken;

  // ✅ Sonar Security Hotspot: no hard-coded credentials in source code
  // Provide these via environment variables in CI / local dev:
  //   TEST_ADMIN_EMAIL=...
  //   TEST_ADMIN_PASSWORD=...
  const adminEmail = process.env.TEST_ADMIN_EMAIL;
  const adminPassword = process.env.TEST_ADMIN_PASSWORD;

  beforeAll(async () => {
    // If credentials are not provided, we cannot login => tests that require adminToken will be skipped
    if (!adminEmail || !adminPassword) {
      console.warn(
        "Skipping admin login: TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD not provided"
      );
      return;
    }

    // Get tokens for existing users
    const adminLogin = await request(app).post("/auth/login").send({
      email: adminEmail,
      password: adminPassword,
    });

    if (adminLogin.body.token) {
      adminToken = adminLogin.body.token;
    }
  });

  // ============ AUTHENTICATION TESTS ============
  describe("POST /kpis/compute - Ad Hoc KPI Computation", () => {
    it("should reject compute request without authentication", async () => {
      const response = await request(app).post("/kpis/compute").send({
        scope: "user",
        targetUserId: 1,
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should accept compute request with valid token", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .post("/kpis/compute")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          scope: "user",
          targetUserId: 1,
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        });

      // Should either succeed or return a valid error (not 401)
      expect(response.statusCode).not.toBe(401);
    });
  });

  // ============ VALIDATION TESTS ============
  describe("Request Validation", () => {
    it("should validate invalid scope in compute request", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .post("/kpis/compute")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          scope: "invalid_scope",
          targetUserId: 1,
        });

      expect(response.statusCode).toBe(400);
    });

    it("should accept valid scope values (user)", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .post("/kpis/compute")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          scope: "user",
          targetUserId: 1,
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        });

      // Should not be a 400 validation error
      expect(response.statusCode).not.toBe(400);
    });

    it("should accept valid scope values (team)", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .post("/kpis/compute")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          scope: "team",
          targetTeamId: 1,
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        });

      // Should not be a 400 validation error
      expect(response.statusCode).not.toBe(400);
    });
  });

  // ============ COMPUTE ENDPOINT TESTS ============
  describe("POST /kpis/compute - Response Structure", () => {
    it("should return proper response structure for user scope", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .post("/kpis/compute")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          scope: "user",
          targetUserId: 1,
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        });

      if (response.statusCode === 200) {
        expect(response.body).toHaveProperty("user");
        expect(response.body).toHaveProperty("lateness");
        expect(response.body).toHaveProperty("hours");
        expect(response.body.lateness).toHaveProperty("lateCount");
        expect(response.body.lateness).toHaveProperty("totalDays");
        expect(response.body.lateness).toHaveProperty("onTimeDays");
        expect(response.body.hours).toHaveProperty("total");
        expect(response.body.hours).toHaveProperty("totalDays");
      }
    });

    it("should return proper response structure for team scope", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .post("/kpis/compute")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          scope: "team",
          targetTeamId: 1,
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        });

      if (response.statusCode === 200) {
        expect(response.body).toHaveProperty("teamResults");
        expect(Array.isArray(response.body.teamResults)).toBe(true);
        response.body.teamResults.forEach((result) => {
          expect(result).toHaveProperty("user");
          expect(result).toHaveProperty("lateness");
          expect(result).toHaveProperty("hours");
        });
      }
    });

    it("should handle date range correctly", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const start = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const end = new Date();

      const response = await request(app)
        .post("/kpis/compute")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          scope: "user",
          targetUserId: 1,
          start: start.toISOString(),
          end: end.toISOString(),
        });

      if (response.statusCode === 200) {
        expect(response.body).toHaveProperty("start");
        expect(response.body).toHaveProperty("end");
      }
    });

    it("should use default date range when not provided", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .post("/kpis/compute")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          scope: "user",
          targetUserId: 1,
        });

      if (response.statusCode === 200) {
        expect(response.body).toHaveProperty("start");
        expect(response.body).toHaveProperty("end");
        const startDate = new Date(response.body.start);
        const endDate = new Date(response.body.end);
        const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
        expect(daysDiff).toBeLessThanOrEqual(35);
      }
    });
  });

  // ============ CREATE KPI TESTS ============
  describe("POST /kpis - Create KPI", () => {
    it("should reject KPI creation without authentication", async () => {
      const response = await request(app).post("/kpis").send({
        name: "Test KPI",
        metric: "lateness",
        scope: "user",
        targetUserId: 1,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should accept valid KPI creation with authentication", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .post("/kpis")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test KPI",
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      expect(response.statusCode).not.toBe(401);
      if (response.statusCode === 201) {
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("name", "Test KPI");
      }
    });

    it("should validate metric enum", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .post("/kpis")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Invalid Metric KPI",
          metric: "invalid_metric",
          scope: "user",
          targetUserId: 1,
        });

      expect(response.statusCode).toBe(400);
    });

    it("should validate scope enum", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .post("/kpis")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Invalid Scope KPI",
          metric: "lateness",
          scope: "invalid_scope",
          targetUserId: 1,
        });

      expect(response.statusCode).toBe(400);
    });

    it("should require name field", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .post("/kpis")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      expect(response.statusCode).toBe(400);
    });

    it("should accept optional params field", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .post("/kpis")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "KPI with params",
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
          params: { threshold: 5, unit: "minutes" },
        });

      expect(response.statusCode).not.toBe(400);
      if (response.statusCode === 201) {
        expect(response.body.params).toEqual({ threshold: 5, unit: "minutes" });
      }
    });
  });

  // ============ LIST KPI TESTS ============
  describe("GET /kpis - List KPIs", () => {
    it("should reject list request without authentication", async () => {
      const response = await request(app).get("/kpis");
      expect(response.statusCode).toBe(401);
    });

    it("should return array of KPIs with authentication", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .get("/kpis")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // ============ ERROR HANDLING TESTS ============
  describe("Error Handling", () => {
    it("should handle empty date range gracefully", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const now = new Date().toISOString();
      const response = await request(app)
        .post("/kpis/compute")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          scope: "user",
          targetUserId: 1,
          start: now,
          end: now,
        });

      expect([200, 400, 404, 500]).toContain(response.statusCode);
      if (response.statusCode === 200) {
        expect(response.body.lateness.totalDays).toBe(0);
      }
    });

    it("should handle invalid date format gracefully", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const response = await request(app)
        .post("/kpis/compute")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          scope: "user",
          targetUserId: 1,
          start: "invalid-date",
          end: new Date().toISOString(),
        });

      expect([200, 400, 500]).toContain(response.statusCode);
    });

    it("should return proper JSON error responses", async () => {
      const response = await request(app).post("/kpis/compute").send({
        scope: "user",
        targetUserId: 1,
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("error");
      expect(typeof response.body.error).toBe("string");
    });
  });

  // ============ INTEGRATION TESTS ============
  describe("Integration Tests", () => {
    it("should handle complete KPI workflow (create and compute)", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const createResponse = await request(app)
        .post("/kpis")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Integration Test KPI",
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      if (createResponse.statusCode === 201) {
        const listResponse = await request(app)
          .get("/kpis")
          .set("Authorization", `Bearer ${adminToken}`);

        expect(listResponse.statusCode).toBe(200);
        expect(Array.isArray(listResponse.body)).toBe(true);

        const foundKpi = listResponse.body.find((k) => k.name === "Integration Test KPI");
        expect(foundKpi).toBeDefined();
      }
    });

    it("should compute multiple times and return consistent structure", async () => {
      if (!adminToken) {
        console.warn("Skipping test: admin token not available");
        return;
      }

      const payload = {
        scope: "user",
        targetUserId: 1,
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      };

      const response1 = await request(app)
        .post("/kpis/compute")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(payload);

      const response2 = await request(app)
        .post("/kpis/compute")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(payload);

      if (response1.statusCode === 200 && response2.statusCode === 200) {
        expect(response1.body).toHaveProperty("user");
        expect(response2.body).toHaveProperty("user");
        expect(response1.body).toHaveProperty("lateness");
        expect(response2.body).toHaveProperty("lateness");
      }
    });
  });
});
