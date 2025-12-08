import { z } from "zod";

const ClocksValidator = z.object({
  userId: z
    .number({
      required_error: "L'identifiant de l'utilisateur est requis",
      invalid_type_error: "L'identifiant de l'utilisateur doit être un nombre",
    })
    .int()
    .positive("L'identifiant de l'utilisateur doit être positif"),

  clockIn: z
    .string({
      required_error: "L'heure de début (clockIn) est requise",
      invalid_type_error: "L'heure de début doit être une date valide",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "L'heure de début doit être une date ISO valide",
    })
    .transform((val) => new Date(val)),

  clockOut: z
    .string({
      invalid_type_error: "L'heure de fin (clockOut) doit être une date valide",
    })
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "L'heure de fin doit être une date ISO valide",
    })
    .transform((val) => (val ? new Date(val) : null)),

  hoursWorked: z
    .number({
      invalid_type_error: "Le nombre d'heures travaillées doit être un nombre",
    })
    .optional(),
});

export default ClocksValidator;
