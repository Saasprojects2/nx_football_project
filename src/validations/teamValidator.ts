import { z } from 'zod';

export const createTeamSchema = z.object({ 
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(2, 'Description must be at least 2 characters').optional(),
    logo: z.string().optional(),
    abbreviation: z.string().optional()
})