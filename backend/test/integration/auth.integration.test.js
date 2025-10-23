import request from "supertest";
import { app } from "../../app.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Auth Integration - Full Flow", () => {
  const testUser = {
    firstname: "Integration",
    lastname: "User",
    email: "integration@test.com",
    password: "Password1!",
    phone: "0600000000",
    profile: "employee",
  };

  beforeAll(async () => {
    //  Nettoyage de l'utilisateur de test avant les tests
    await prisma.users.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1 Register success
  it("should register successfully with valid data", async () => {
    const res = await request(app).post("/auth/register").send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe(testUser.email);
  });

  // 2️Register duplicate email
  it("should fail if email is already used", async () => {
    const res = await request(app).post("/auth/register").send(testUser);

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("error", "Cet email est déjà utilisé.");
  });

  //  Login success
  it("should login successfully with correct credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");

    // Stocker le token pour les tests suivants
    globalThis.token = res.body.token;
  });

  //  Login with wrong password
  it("should fail login with wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: "WrongPassword!",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Mot de passe incorrect.");
  });

  // Access profile with valid token
  it("should access profile with valid JWT", async () => {
    const res = await request(app)
      .get("/auth/profile")
      .set("Authorization", `Bearer ${globalThis.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("email", testUser.email);
  });

  // Access profile without token
  it("should reject profile access without token", async () => {
    const res = await request(app).get("/auth/profile");

    expect(res.statusCode).toBe(401); // ⚠️ Ajusté à 401 selon ton middleware
    expect(res.body).toHaveProperty("error", "Token manquant.");
  });

  //  Access profile with invalid token
  it("should reject profile access with invalid token", async () => {
    const res = await request(app)
      .get("/auth/profile")
      .set("Authorization", "Bearer invalid.token.test");

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Token invalide ou expiré.");
  });
});
