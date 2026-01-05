import { z } from "zod";

const TeamsValidator = z.object({
  // Le nom de l'équipe est obligatoire et doit avoir au moins 2 caractères
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères"),

  // La description est optionnelle
  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional()
    .nullable(),

  // managerId : on utilise coerce pour transformer une string en number automatiquement
  managerId: z.coerce
    .number({ 
      required_error: "Un manager est obligatoire",
      invalid_type_error: "L'ID du manager doit être un nombre" 
    })
    .int()
    .positive(),

  // members : un tableau d'IDs d'utilisateurs
  // .optional().default([]) permet de ne rien envoyer si l'équipe est vide au départ
  members: z
    .array(
      z.coerce.number().int().positive()
    )
    .optional()
    .default([]),
});

export default TeamsValidator;