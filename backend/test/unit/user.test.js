import request from "supertest";
import { app } from "../../app.js";

let authToken;
let createdUserId;

describe("Users CRUD - full coverage", () => {

  beforeAll(async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({
        email: "eldjsalim@gmail.com",
        password: "Password1!",
      });

    authToken = loginRes.body.token;
    expect(authToken).toBeDefined();
  });

  it("should create a new user", async () => {
    const response = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: "testuser@example.com",
        password: "Password1!",
        name: "Test User",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");

    createdUserId = response.body.id;
  });

  it("should get all users", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should get a user by id", async () => {
    const response = await request(app)
      .get(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", createdUserId);
  });

  it("should update a user", async () => {
    const response = await request(app)
      .put(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Updated User",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("name", "Updated User");
  });

  it("should fail to update non-existent user", async () => {
    const response = await request(app)
      .put("/users/999999")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Ghost",
      });

    expect([404, 400]).toContain(response.statusCode);
  });

  it("should delete a user", async () => {
    const response = await request(app)
      .delete(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(204);
  });

  it("should fail to get deleted user", async () => {
    const response = await request(app)
      .get(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(404);
  });

  it("should fail without authentication", async () => {
    const response = await request(app)
      .get("/users");

    expect(response.statusCode).toBe(401);
  });

});
j