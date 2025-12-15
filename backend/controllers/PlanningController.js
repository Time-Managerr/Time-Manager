// backend/controllers/PlanningController.js
const getPlanning = (req, res) => {
  // Pour l’instant, renvoie juste un JSON de test
  res.json({ message: "Planning OK", data: [] });
};

const createPlanning = (req, res) => {
  // Idem, simple réponse de test
  res.status(201).json({ message: "Planning created (fake)", body: req.body });
};

export default {
  getPlanning,
  createPlanning,
};
