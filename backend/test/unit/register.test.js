import request from "supertest";
import { app } from "../../app.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Auth Register - full coverage", () => {
  beforeAll(async () => {
    // Supprime l'utilisateur de test s'il existe déjà
    await prisma.users.deleteMany({
      where: { email: "newuser@test.com" },
    });
  });

  it("should register successfully with valid data", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        firstname: "Test",
        lastname: "User",
        email: "newuser@test.com",
        password: "Password1!",
        phone: "0600000000",
        profile: "employee",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe("newuser@test.com");
  });

  it("should fail if email is already used", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        firstname: "Dup",
        lastname: "User",
        email: "newuser@test.com", // même email que le précédent
        password: "Password1!",
      });

    expect(response.statusCode).toBe(409);
    expect(response.body).toHaveProperty("error");
  });

  it("should fail if password is too weak", async () => {
  const response = await request(app)
    .post("/auth/register")
    .send({
      firstname: "Weak",
      lastname: "User",
      email: "weak@test.com",
      password: "123",
      phone: "0600000000",
    });

  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("error");
});

});
