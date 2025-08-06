import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prismaClient';
import AppError from '../../utils/AppError';

// Get player tournament stats
export const getPlayerTournamentStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { playerId } = req.params;

    // Check if player exists
    const player = await prisma.user.findUnique({
      where: { id: playerId }
    });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Get player tournament stats
    const tournamentStats = await prisma.playerTournamentStats.findMany({
      where: {
        playerId
      },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            logo: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    // Get player's total stats
    const totalStats = {
      totalMatches: player.matchesPlayed,
      tournaments: tournamentStats.length,
      tournamentStats
    };

    return res.status(200).json(totalStats);
  } catch (error) {
    console.error("Error fetching player tournament stats:", error);
    return next(new AppError('Failed to fetch player tournament stats', 500));
  }
};