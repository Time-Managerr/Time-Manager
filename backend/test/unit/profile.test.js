import request from "supertest";
import { app } from "../../app.js";

let token; // on stockera ici le JWT obtenu au login

describe("Auth Profile - Token JWT", () => {
  //  Étape 1 : login avant de tester le profil
  beforeAll(async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "eldjsalim@gmail.com", // 👉 à adapter selon un user existant
        password: "Password1!",        // 👉 le bon mot de passe correspondant
      });

    // on s’assure que le token existe bien
    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body).toHaveProperty("token");

    token = loginResponse.body.token;
  });

  //  Test 1 : accès autorisé avec token valide
  it("should return user profile when token is valid", async () => {
    const response = await request(app)
      .get("/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("firstname");
    expect(response.body).toHaveProperty("lastname");
  });

  //  Test 2 : refus sans token
  it("should return 401 if no token is provided", async () => {
    const response = await request(app).get("/auth/profile");
    expect(response.statusCode).toBe(401);
  });

  //  Test 3 : refus avec token invalide
  it("should return 403 if token is invalid", async () => {
    const response = await request(app)
      .get("/auth/profile")
      .set("Authorization", "Bearer faketoken123");

    expect([401, 403]).toContain(response.statusCode);
  });
});
