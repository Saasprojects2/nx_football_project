import { Request, Response, NextFunction } from "express";
import { prisma } from "../../prismaClient";
import AppError from "../../utils/AppError";
import { createTeamSchema } from "../../validations/teamValidator";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

//create a new team
export const createTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validationData = createTeamSchema.safeParse(req.body);
    if (!validationData.success) {
      throw new AppError("Invalid input data", 400);
    }
    const { name, description, logo, abbreviation } = validationData.data;

    if (!name) {
      return res.status(400).json({ message: "Missing required name" });
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        logo,
        abbreviation,
        manager: {
          connect: { id: req.user.id },
        },
        members: {
          connect: { id: req.user.id }, // Add the creator as a member too
        },
      },
    });
    return res.status(201).json({
      message: "Team created successfully",
      data: team,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    return next(new AppError("Failed to create team", 500));
  }
};

//get all teams
export const getAllTeams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            image: true,
          },
        },
        tournaments: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        // Only include fixtures where this team is home or away
        homeFixtures: {
          select: {
            id: true,
            date: true,
            time: true,
            venue: true,
            status: true,
            homeTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            homeScore: true,
            awayScore: true,
            homepenaltyScore: true,
            awaypenaltyScore: true,
          },
        },
        awayFixtures: {
          select: {
            id: true,
            date: true,
            time: true,
            venue: true,
            status: true,
            homeTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            homeScore: true,
            awayScore: true,
            homepenaltyScore: true,
            awaypenaltyScore: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Teams fetched successfully",
      data: teams,
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return next(new AppError("Failed to fetch teams", 500));
  }
};

//get team by id
export const getTeamById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            image: true,
            primaryPosition: true,
            preferredFoot: true,
            playerStats: {
              select: {
                id: true,
                playerId: true,
                assists: true,
                goals: true,
                yellowCards: true,
                redCards: true,
                isOnField: true,
              },
            },
          },
        },
        tournaments: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        homeFixtures: {
          select: {
            id: true,
            date: true,
            time: true,
            venue: true,
            status: true,
            homeTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            homeScore: true,
            awayScore: true,
            homepenaltyScore: true,
            awaypenaltyScore: true,
          },
        },
        awayFixtures: {
          select: {
            id: true,
            date: true,
            time: true,
            venue: true,
            status: true,
            homeTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            homeScore: true,
            awayScore: true,
            homepenaltyScore: true,
            awaypenaltyScore: true,
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    return res.status(200).json({
      message: "Team fetched successfully",
      data: team,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return next(new AppError("Failed to fetch team", 500));
  }
};

//update team
export const updateTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { name, description, logo } = req.body;

    // Check if team exists and user is manager
    const team = await prisma.team.findUnique({
      where: { id },
      select: { managerId: true },
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Verify user is the team manager
    if (team.managerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update this team" });
    }

    // Update team
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        name,
        description,
        logo,
      },
    });

    return res.status(200).json(updatedTeam);
  } catch (error) {
    console.error("Error updating team:", error);
    return next(new AppError("Failed to update team", 500));
  }
};

//delete team
export const deleteTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    // Check if team exists and user is manager
    const team = await prisma.team.findUnique({
      where: { id },
      select: { managerId: true },
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    // Verify user is the team manager
    if (team.managerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this team" });
    }

    // Delete team
    const deletedTeam = await prisma.team.delete({
      where: { id },
    });
    return res.status(200).json({
      message: "Team deleted successfully",
      data: deletedTeam,
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    return next(new AppError("Failed to delete team", 500));
  }
};

// Add players to the team by phone number
export const addPlayersToTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { teamId, phoneNumber } = req.body;

    // Check if team exists and user is manager
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { managerId: true },
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Verify user is the team manager
    if (team.managerId !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to add players to this team",
      });
    }

    // Find user by phone number
    const player = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Check if player is already a team member
    const teamWithMembers = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });
    const isPlayerAlreadyMember =
      teamWithMembers?.members.some((member) => member.id === player.id) ||
      false;

    if (isPlayerAlreadyMember) {
      return res
        .status(400)
        .json({ message: "Player is already a member of this team" });
    }

    // Add player to team
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          connect: { id: player.id },
        },
      },
      include: {
        members: true,
      },
    });

    return res.status(200).json({
      message: "Players added to team successfully",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("Error adding players to team:", error);
    return next(new AppError("Failed to add players to team", 500));
  }
};

//Remove players from the team
export const removePlayersFromTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { teamId, playerId } = req.params;

    // Check if team exists and user is manager
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { managerId: true },
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Verify user is the team manager
    if (team.managerId !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to remove players from this team",
      });
    }

    // Remove player from team
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          disconnect: { id: playerId },
        },
      },
    });

    return res.status(200).json({
      message: "Players removed from team successfully",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("Error removing players from team:", error);
    return next(new AppError("Failed to remove players from team", 500));
  }
};

//get teams managed by current user
export const getMyTeams = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const teams = await prisma.team.findMany({
      where: {
        managerId: req.user.id,
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            image: true,
            primaryPosition: true,
          },
        },
        tournaments: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Teams fetched successfully",
      data: teams,
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return next(new AppError("Failed to fetch teams", 500));
  }
};

// Get teams where current user is a player
export const getPlayerTeams = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            id: req.user.id,
          },
        },
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        tournaments: {
          select: {
            id: true,
            name: true,
            logo: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Teams fetched successfully",
      data: teams,
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return next(new AppError("Failed to fetch teams", 500));
  }
};
