import { z } from "zod";

const TeamUserValidator = z.object({
  // teamId : doit être un nombre entier positif
  teamId: z.coerce
    .number({ required_error: "L'ID de l'équipe est requis" })
    .int()
    .positive(),

  // userId : doit être un nombre entier positif
  userId: z.coerce
    .number({ required_error: "L'ID de l'utilisateur est requis" })
    .int()
    .positive(),
});

export default TeamUserValidator;