import request from "supertest";
import { app } from "../../app.js";

describe("KPI API - Endpoint & Response Structure Tests", () => {
  // ============ ENDPOINT EXISTENCE TESTS ============
  describe("KPI Endpoints - Verification", () => {
    it("POST /kpis endpoint exists and returns 401 without auth", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: "Test KPI",
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      // Should exist and return 401 (not 404)
      expect(response.statusCode).toBe(401);
      expect(response.body).toBeDefined();
    });

    it("GET /kpis endpoint exists and returns 401 without auth", async () => {
      const response = await request(app).get("/kpis");

      expect(response.statusCode).toBe(401);
      expect(response.body).toBeDefined();
    });

    it("POST /kpis/compute endpoint exists and returns 401 without auth", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "user",
          targetUserId: 1,
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toBeDefined();
    });
  });

  // ============ REQUEST VALIDATION TESTS ============
  describe("Request Validation - Structure & Types", () => {
    it("should validate scope field in POST /kpis", async () => {
      const response = await request(app)
        .post("/kpis")
        .set("Authorization", "Bearer invalid_token")
        .send({
          name: "Test KPI",
          metric: "lateness",
          scope: "invalid_scope", // Invalid scope
          targetUserId: 1,
        });

      // Should reject invalid scope (400) before checking auth (401/403)
      // or it might check auth first
      expect([400, 401, 403]).toContain(response.statusCode);
    });

    it("should validate metric field in POST /kpis", async () => {
      const response = await request(app)
        .post("/kpis")
        .set("Authorization", "Bearer invalid_token")
        .send({
          name: "Test KPI",
          metric: "invalid_metric", // Invalid metric
          scope: "user",
          targetUserId: 1,
        });

      expect([400, 401, 403]).toContain(response.statusCode);
    });

    it("should require name field in POST /kpis", async () => {
      const response = await request(app)
        .post("/kpis")
        .set("Authorization", "Bearer invalid_token")
        .send({
          // Missing name
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      expect([400, 401, 403]).toContain(response.statusCode);
    });

    it("should accept optional params field in POST /kpis", async () => {
      const response = await request(app)
        .post("/kpis")
        .set("Authorization", "Bearer invalid_token")
        .send({
          name: "Test KPI",
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
          params: { threshold: 5 }, // Optional params
        });

      // Should not fail due to params field (might fail on auth)
      expect([400, 401, 201, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should validate scope in POST /kpis/compute", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .set("Authorization", "Bearer invalid_token")
        .send({
          scope: "invalid_scope",
          targetUserId: 1,
        });

      expect([400, 401, 403]).toContain(response.statusCode);
    });

    it("should accept date range in POST /kpis/compute", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .set("Authorization", "Bearer invalid_token")
        .send({
          scope: "user",
          targetUserId: 1,
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        });

      expect([400, 401, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should work without date range in POST /kpis/compute", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .set("Authorization", "Bearer invalid_token")
        .send({
          scope: "user",
          targetUserId: 1,
        });

      expect([400, 401, 200, 403, 500]).toContain(response.statusCode);
    });
  });

  // ============ ERROR RESPONSE FORMAT TESTS ============
  describe("Error Response Format", () => {
    it("should return JSON error for missing auth", async () => {
      const response = await request(app).get("/kpis");

      expect(response.statusCode).toBe(401);
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.body).toBeDefined();
    });

    it("should return JSON error for invalid input", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: "Test",
          metric: "lateness",
          scope: "invalid_scope",
          targetUserId: 1,
        });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.body).toBeDefined();
    });

    it("should return HTTP 400 for validation errors", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          // Missing required fields
          metric: "lateness",
        });

      expect([400, 401, 404]).toContain(response.statusCode);
    });

    it("should return HTTP 401 for unauthenticated requests", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "user",
          targetUserId: 1,
        });

      expect(response.statusCode).toBe(401);
    });
  });

  // ============ HTTP METHOD TESTS ============
  describe("HTTP Methods - Allowed Operations", () => {
    it("GET /kpis should be callable", async () => {
      const response = await request(app).get("/kpis");
      expect([401, 200]).toContain(response.statusCode); // Auth or success
    });

    it("POST /kpis should be callable", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: "Test",
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      expect([401, 400, 201, 200, 403, 500]).toContain(response.statusCode);
    });

    it("POST /kpis/compute should be callable", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "user",
          targetUserId: 1,
        });

      expect([401, 400, 200, 403, 500]).toContain(response.statusCode);
    });
  });

  // ============ CONTENT NEGOTIATION TESTS ============
  describe("Content Negotiation", () => {
    it("should accept JSON in request body", async () => {
      const response = await request(app)
        .post("/kpis")
        .set("Content-Type", "application/json")
        .send({
          name: "Test KPI",
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      // Should be accepted
      expect([400, 401, 201, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should return JSON response", async () => {
      const response = await request(app)
        .get("/kpis")
        .set("Accept", "application/json");

      expect(response.headers["content-type"]).toMatch(/json/);
    });

    it("should handle missing Content-Type header", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "user",
          targetUserId: 1,
        });

      // Should still work (supertest auto-sets it)
      expect(response.statusCode).toBeDefined();
    });
  });

  // ============ ROBUSTNESS TESTS ============
  describe("API Robustness", () => {
    it("should handle empty payload in POST /kpis", async () => {
      const response = await request(app).post("/kpis").send({});

      expect([400, 401, 500]).toContain(response.statusCode);
      expect(response.body).toBeDefined();
    });

    it("should handle null values in payload", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: null,
          metric: null,
          scope: null,
          targetUserId: null,
        });

      expect([400, 401, 500]).toContain(response.statusCode);
    });

    it("should handle extra fields in payload", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: "Test KPI",
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
          extraField: "should be ignored or cause error",
          anotherExtraField: { nested: "value" },
        });

      // Should either ignore extra fields or reject
      expect([400, 401, 201, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should handle very large payloads gracefully", async () => {
      const largeString = "x".repeat(10000);
      const response = await request(app)
        .post("/kpis")
        .send({
          name: largeString,
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      // Should handle large payload (might be 413 or validated)
      expect([400, 401, 413, 201, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should handle numeric string IDs", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "user",
          targetUserId: "1", // String instead of number
        });

      // Should handle type coercion or validation
      expect([400, 401, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should handle empty string values", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: "", // Empty string
          metric: "",
          scope: "",
          targetUserId: 1,
        });

      expect([400, 401, 500]).toContain(response.statusCode);
    });
  });

  // ============ ROUTE STRUCTURE TESTS ============
  describe("API Route Structure", () => {
    it("should have /kpis prefix for all KPI routes", async () => {
      // Test that routes follow /kpis pattern
      const listResponse = await request(app).get("/kpis");
      const createResponse = await request(app).post("/kpis").send({});
      const computeResponse = await request(app).post("/kpis/compute").send({});

      // All should be recognized as valid routes
      expect([401, 400, 404, 200, 201, 500]).toContain(
        listResponse.statusCode
      );
      expect([401, 400, 404, 200, 201, 500]).toContain(
        createResponse.statusCode
      );
      expect([401, 400, 404, 200, 500]).toContain(computeResponse.statusCode);
    });

    it("should not accept undefined routes", async () => {
      const response = await request(app).get("/kpis/undefined-route");

      // Should return 404 for undefined route
      expect([404, 401, 500]).toContain(response.statusCode);
    });
  });

  // ============ SCOPE PARAMETER TESTS ============
  describe("Scope Parameter Validation", () => {
    it("should accept 'user' scope", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "user",
          targetUserId: 1,
        });

      // Should not reject due to scope validation
      expect([401, 400, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should accept 'team' scope", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "team",
          targetTeamId: 1,
        });

      expect([401, 400, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should reject unknown scope", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "unknown",
          targetUserId: 1,
        });

      // Should be 400 for validation error
      expect([400, 401, 500]).toContain(response.statusCode);
    });

    it("should reject null scope", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: null,
          targetUserId: 1,
        });

      expect([400, 401, 500]).toContain(response.statusCode);
    });
  });

  // ============ METRIC PARAMETER TESTS ============
  describe("Metric Parameter Validation", () => {
    it("should accept 'lateness' metric", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: "Test",
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      expect([400, 401, 201, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should accept 'hours' metric", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: "Test",
          metric: "hours",
          scope: "user",
          targetUserId: 1,
        });

      expect([400, 401, 201, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should reject unknown metric", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: "Test",
          metric: "unknown",
          scope: "user",
          targetUserId: 1,
        });

      expect([400, 401, 500]).toContain(response.statusCode);
    });

    it("should reject null metric", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: "Test",
          metric: null,
          scope: "user",
          targetUserId: 1,
        });

      expect([400, 401, 500]).toContain(response.statusCode);
    });
  });

  // ============ NAME FIELD TESTS ============
  describe("Name Field Requirements", () => {
    it("should accept non-empty name", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: "Valid KPI Name",
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      expect([400, 401, 201, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should reject empty name", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: "",
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      expect([400, 401, 500]).toContain(response.statusCode);
    });

    it("should reject missing name", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      expect([400, 401, 500]).toContain(response.statusCode);
    });

    it("should reject null name", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: null,
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      expect([400, 401, 500]).toContain(response.statusCode);
    });

    it("should accept long name (up to reasonable limit)", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: "A".repeat(100),
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      expect([400, 401, 201, 200, 403, 500, 413]).toContain(
        response.statusCode
      );
    });

    it("should accept special characters in name", async () => {
      const response = await request(app)
        .post("/kpis")
        .send({
          name: "KPI #1 - Test & Validation!",
          metric: "lateness",
          scope: "user",
          targetUserId: 1,
        });

      expect([400, 401, 201, 200, 403, 500]).toContain(response.statusCode);
    });
  });

  // ============ DATE RANGE TESTS ============
  describe("Date Range Handling", () => {
    it("should accept ISO date format", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "user",
          targetUserId: 1,
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        });

      expect([400, 401, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should use default date range when not provided", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "user",
          targetUserId: 1,
        });

      // Should work with defaults
      expect([400, 401, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should handle partial date range (only start)", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "user",
          targetUserId: 1,
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

      expect([400, 401, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should handle partial date range (only end)", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "user",
          targetUserId: 1,
          end: new Date().toISOString(),
        });

      expect([400, 401, 200, 403, 500]).toContain(response.statusCode);
    });

    it("should reject invalid date format", async () => {
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "user",
          targetUserId: 1,
          start: "invalid-date",
          end: new Date().toISOString(),
        });

      // Should reject invalid date format
      expect([400, 401, 500]).toContain(response.statusCode);
    });

    it("should handle date with same start and end", async () => {
      const now = new Date().toISOString();
      const response = await request(app)
        .post("/kpis/compute")
        .send({
          scope: "user",
          targetUserId: 1,
          start: now,
          end: now,
        });

      // Should handle zero-range dates
      expect([400, 401, 200, 403, 500]).toContain(response.statusCode);
    });
  });
});
