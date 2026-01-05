import request from "supertest";
import { app } from "../../app.js";

describe("Auth Login - full coverage", () => {

  it("should login successfully with valid credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "eldjsalim@gmail.com",
        password: "Password1!",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
  });

  it("should fail to login with wrong password", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "eldjsalim@gmail.com",
        password: "WrongPassword!",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("error");
  });

  it("should fail to login with non-existent email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "userinexistant@example.com",
        password: "Password1!",
      });

    // Certaines API renvoient 404 (user not found), d’autres 401
    expect([401, 404]).toContain(response.statusCode);
    expect(response.body).toHaveProperty("error");
  });

  it("should fail if email is missing", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        password: "Password1!",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should fail if password is missing", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "eldjsalim@gmail.com",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should fail if email format is invalid", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "not-an-email",
        password: "Password1!",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

});
