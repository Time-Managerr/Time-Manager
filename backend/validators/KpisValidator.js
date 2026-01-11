import { z } from 'zod';

const KpisValidator = z.object({
  name: z.string().min(1),
  metric: z.enum(['lateness', 'hours', 'custom']),
  scope: z.enum(['user', 'team']),
  targetUserId: z.number().int().positive().optional(),
  targetTeamId: z.number().int().positive().optional(),
  params: z.any().optional(),
});

export default KpisValidator;
