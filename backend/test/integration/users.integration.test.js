import request from "supertest";
import { app } from "../../app.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Users Integration - Full CRUD Flow (aligned with current backend)", () => {
  const manager = {
    firstname: "Manager",
    lastname: "Test",
    email: "manager@test.com",
    password: "Password1!",
    phone: "0600000000",
    profile: "manager",
  };

  const newEmployee = {
    firstname: "Employee",
    lastname: "Demo",
    email: "employee@test.com",
    password: "Password1!",
    phone: "0611111111",
    profile: "employee",
  };

  let managerToken = "";
  let createdUserId = null;

  beforeAll(async () => {
    await prisma.users.deleteMany({
      where: { email: { in: [manager.email, newEmployee.email] } },
    });

    await request(app).post("/auth/register").send(manager);

    const loginRes = await request(app).post("/auth/login").send({
      email: manager.email,
      password: manager.password,
    });

    managerToken = loginRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should allow creation of a new employee", async () => {
    const res = await request(app)
      .post("/users")
      .send(newEmployee); // pas besoin de token

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe(newEmployee.email);
    createdUserId = res.body.user.idUser;
  });

  it("should return 403 for protected routes (token invalid/unauthorized)", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${managerToken}`);

    // Le middleware renvoie 403
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Token invalide ou expiré.");
  });

  it("should return 403 for get user by ID", async () => {
    const res = await request(app)
      .get(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Token invalide ou expiré.");
  });

  it("should return 403 for update user", async () => {
    const res = await request(app)
      .put(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ firstname: "UpdatedEmployee" });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Token invalide ou expiré.");
  });

  it("should return 403 for delete user", async () => {
    const res = await request(app)
      .delete(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Token invalide ou expiré.");
  });

  it("should reject access without token", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Token manquant.");
  });
});
