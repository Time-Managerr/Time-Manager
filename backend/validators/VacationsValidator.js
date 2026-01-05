import { z } from "zod";

const VacationsValidator = z
  .object({
    userId: z
      .number({
        required_error: "L'identifiant de l'utilisateur est requis",
        invalid_type_error: "L'identifiant de l'utilisateur doit être un nombre",
      })
      .int()
      .positive("L'identifiant de l'utilisateur doit être positif"),

    startDate: z
      .string({
        required_error: "La date de début est requise",
        invalid_type_error: "La date de début doit être une chaîne de caractères représentant une date",
      })
      .refine((val) => !Number.isNaN(Date.parse(val)), {
        message: "La date de début doit être une date valide",
      }),

    endDate: z
      .string({
        required_error: "La date de fin est requise",
        invalid_type_error: "La date de fin doit être une chaîne de caractères représentant une date",
      })
      .refine((val) => !Number.isNaN(Date.parse(val)), {
        message: "La date de fin doit être une date valide",
      }),

    status: z
      .enum(["pending", "approved", "rejected"], {
        invalid_type_error: "Le statut doit être 'pending', 'approved' ou 'rejected'",
      })
      .optional(),

    createdAt: z
      .string({
        invalid_type_error: "createdAt doit être une chaîne de caractères représentant une date",
      })
      .refine((val) => !Number.isNaN(Date.parse(val)), {
        message: "createdAt doit être une date valide",
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "La date de fin doit être postérieure à la date de début",
      path: ["endDate"],
    }
  );

export default VacationsValidator;
