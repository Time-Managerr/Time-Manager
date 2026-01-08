import { z } from "zod";

const ReportsValidator = z.object({
  kpi: z
    .string({
      required_error: "Le KPI est requis",
      invalid_type_error: "Le KPI doit être une chaîne de caractères",
    })
    .min(1, "Le KPI est requis")
    .max(255, "Le KPI est trop long"),

  startDate: z
    .string({
      required_error: "La date de début est requise",
      invalid_type_error: "La date de début doit être une date valide",
    })
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "La date de début doit être une date valide",
    }),

  endDate: z
    .string({
      required_error: "La date de fin est requise",
      invalid_type_error: "La date de fin doit être une date valide",
    })
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "La date de fin doit être une date valide",
    }),

  userId: z
    .number({
      required_error: "L'identifiant de l'utilisateur est requis",
      invalid_type_error: "L'identifiant de l'utilisateur doit être un nombre",
    })
    .int()
    .positive("L'identifiant de l'utilisateur doit être positif"),

  teamId: z
    .number({
      required_error: "L'identifiant de l'équipe est requis",
      invalid_type_error: "L'identifiant de l'équipe doit être un nombre",
    })
    .int()
    .positive("L'identifiant de l'équipe doit être positif"),
})
.refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["endDate"],
  }
);

export default ReportsValidator;
