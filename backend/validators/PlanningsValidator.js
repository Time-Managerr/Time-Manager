import { z } from "zod";

const PlanningsValidator = z.object({
  userId: z
    .number({
      required_error: "L'identifiant de l'utilisateur est requis",
      invalid_type_error: "L'identifiant de l'utilisateur doit être un nombre",
    })
    .int()
    .positive("L'identifiant de l'utilisateur doit être positif"),

  date: z
    .string({
      required_error: "La date du planning est requise",
      invalid_type_error: "La date doit être une date valide",
    })
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "La date doit être une date valide",
    })
    .transform((val) => new Date(val)),

  startTime: z
    .string({
      required_error: "L'heure de début est requise",
      invalid_type_error: "L'heure de début doit être une date valide",
    })
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "L'heure de début doit être une date valide",
    })
    .transform((val) => new Date(val)),

  endTime: z
    .string({
      required_error: "L'heure de fin est requise",
      invalid_type_error: "L'heure de fin doit être une date valide",
    })
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "L'heure de fin doit être une date valide",
    })
    .transform((val) => new Date(val)),

})
.refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: "L'heure de fin doit être postérieure à l'heure de début",
    path: ["endTime"],
  }
);

export default PlanningsValidator;