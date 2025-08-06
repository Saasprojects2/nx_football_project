import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prismaClient';
import AppError from '../../utils/AppError';

// Create or update lineup for a team in a fixture
export const createOrUpdateLineup = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { fixtureId, teamId, players } = req.body;

    // Validate required fields
    if (!fixtureId || !teamId || !players || !Array.isArray(players)) {
      return res.status(400).json({ message: "Fixture ID, team ID, and players array are required" });
    }

    // Check if players array exceeds maximum limit
    if (players.length > 25) {
      return res.status(400).json({ message: "Maximum 25 players can be added to a lineup" });
    }

    // Check if fixture exists
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        tournament: {
          select: { adminId: true, id: true }
        }
      }
    });

    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }

    // Verify user is the tournament admin
    if (fixture.tournament.adminId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to manage lineups for this fixture" });
    }

    // Check if team is part of the fixture
    if (fixture.homeTeamId !== teamId && fixture.awayTeamId !== teamId) {
      return res.status(400).json({ message: "Team is not part of this fixture" });
    }

    // Get the opposing team ID
    const opposingTeamId = fixture.homeTeamId === teamId ? fixture.awayTeamId : fixture.homeTeamId;

    // Check if any player is already in the opposing team's lineup
    const opposingLineup = await prisma.lineup.findFirst({
      where: {
        fixtureId,
        teamId: opposingTeamId
      },
      include: {
        players: {
          select: {
            playerId: true
          }
        }
      }
    });

    if (opposingLineup) {
      const opposingPlayerIds = opposingLineup.players.map(p => p.playerId);
      const duplicatePlayers = players.filter(p => opposingPlayerIds.includes(p.playerId));
      
      if (duplicatePlayers.length > 0) {
        return res.status(400).json({ 
          message: "Some players are already in the opposing team's lineup",
          players: duplicatePlayers.map(p => p.playerId)
        });
      }
    }

    // Find existing lineup or create new one
    let lineup = await prisma.lineup.findFirst({
      where: {
        fixtureId,
        teamId
      },
      include: {
        players: true
      }
    });

    if (lineup) {
      // Get current players in lineup
      const currentPlayerIds = lineup.players.map(p => p.playerId);
      
      // Reset isPlaying status and decrement matchesPlayed for removed players
      for (const playerId of currentPlayerIds) {
        if (!players.some(p => p.playerId === playerId)) {
          await prisma.user.update({
            where: { id: playerId },
            data: {
              isPlaying: false,
              matchesPlayed: {
                decrement: 1
              }
            }
          });
          
          // Update player tournament stats
          const playerTournamentStat = await prisma.playerTournamentStats.findFirst({
            where: {
              playerId,
              tournamentId: fixture.tournamentId
            }
          });
          
          if (playerTournamentStat && playerTournamentStat.matchesPlayed > 0) {
            await prisma.playerTournamentStats.update({
              where: { id: playerTournamentStat.id },
              data: {
                matchesPlayed: {
                  decrement: 1
                }
              }
            });
          }
        }
      }
      
      // Delete existing player stats for this lineup
      await prisma.playerStats.deleteMany({
        where: {
          lineupId: lineup.id
        }
      });
    } else {
      // Create a new lineup and assign it to the lineup variable
      lineup = await prisma.lineup.create({
        data: {
          fixture: {
            connect: { id: fixtureId }
          },
          team: {
            connect: { id: teamId }
          }
        },
        include: {
          players: true
        }
      });
    }

    // Create player stats for each player in the lineup
    const playerStats = await Promise.all(
      players.map(async (player: any) => {
        // Update player's isPlaying status and increment matchesPlayed
        await prisma.user.update({
          where: { id: player.playerId },
          data: {
            isPlaying: true,
            matchesPlayed: {
              increment: 1
            }
          }
        });
        
        // Update or create player tournament stats with jersey number
        const playerTournamentStats = await prisma.playerTournamentStats.upsert({
          where: {
            playerId_tournamentId: {
              playerId: player.playerId,
              tournamentId: fixture.tournamentId
            }
          },
          update: {
            matchesPlayed: {
              increment: 1
            },
            // Update jersey number if provided
            jerseyNumber: player.jerseyNumber || undefined
          },
          create: {
            player: {
              connect: { id: player.playerId }
            },
            tournament: {
              connect: { id: fixture.tournamentId }
            },
            matchesPlayed: 1,
            minutesPlayed: 0,
            jerseyNumber: player.jerseyNumber || null
          }
        });

        let isOnField = true;
        
        // Create player stats with jersey number
        return prisma.playerStats.create({
          data: {
            player: {
              connect: { id: player.playerId }
            },
            lineup: {
              connect: { id: lineup!.id }
            },
            tournament: fixture.tournamentId ? {
              connect: { id: fixture.tournamentId }
            } : undefined,
            position: player.position,
            isStarting: player.isStarting || false,
            isOnField: isOnField,
            jerseyNumber: player.jerseyNumber || playerTournamentStats.jerseyNumber || null
          }
        });
      })
    );

    return res.status(200).json({
      message: "Lineup updated successfully",
      lineup: {
        ...lineup,
        players: playerStats
      }
    });
  } catch (error) {
    console.error("Error updating lineup:", error);
    return next(new AppError('Failed to update lineup', 500));
  }
};

// Add a new function to add a single player to lineup
export const addPlayerToLineup = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { lineupId, playerId, position, isStarting, jerseyNumber } = req.body;

    // Check if lineup exists
    const lineup = await prisma.lineup.findUnique({
      where: { id: lineupId },
      include: {
        fixture: {
          include: {
            tournament: true
          }
        },
        players: true,
        team: {
          select: {
            id: true
          }
        }
      }
    });

    if (!lineup) {
      return res.status(404).json({ message: "Lineup not found" });
    }

    // Check if user is tournament admin
    if (lineup.fixture.tournament.adminId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to add players to this lineup" });
    }
    
    // Get the opposing team ID
    const opposingTeamId = lineup.fixture.homeTeamId === lineup.team.id 
      ? lineup.fixture.awayTeamId 
      : lineup.fixture.homeTeamId;
    
    // Check if player is already in the opposing team's lineup
    const opposingLineup = await prisma.lineup.findFirst({
      where: {
        fixtureId: lineup.fixture.id,
        teamId: opposingTeamId
      },
      include: {
        players: {
          where: {
            playerId: playerId
          }
        }
      }
    });
    
    if (opposingLineup && opposingLineup.players.length > 0) {
      return res.status(400).json({ 
        message: "This player is already in the opposing team's lineup"
      });
    }

    // Check if player exists
    const player = await prisma.user.findUnique({
      where: { id: playerId }
    });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Check if player is already in lineup
    const existingPlayer = lineup.players.find(p => p.playerId === playerId);
    if (existingPlayer) {
      return res.status(400).json({ message: "Player is already in this lineup" });
    }

    // Check if lineup already has 25 players
    if (lineup.players.length >= 25) {
      return res.status(400).json({ message: "Lineup already has maximum 25 players" });
    }

    // Determine isOnField value based on position and eventType
    // let isOnField = true;
    // if (
    //   (position && position.toUpperCase() === "SUBSTITUTE") ||
    //   (position && position.toUpperCase() === "ST" ) ||
    //   (position && position.toUpperCase() === "SUBSTITUTION")
    // ) {
    //   isOnField = false;
    // }

    let isOnField = true;

    // Check if player already has a jersey number in this tournament
    const existingPlayerTournamentStats = await prisma.playerTournamentStats.findUnique({
      where: {
        playerId_tournamentId: {
          playerId,
          tournamentId: lineup.fixture.tournamentId
        }
      }
    });

    // If jersey number is provided, check if it's already taken by another player
    if (jerseyNumber) {
      const existingJerseyNumber = await prisma.playerTournamentStats.findFirst({
        where: {
          tournamentId: lineup.fixture.tournamentId,
          jerseyNumber: jerseyNumber,
          playerId: { not: playerId }
        }
      });

      if (existingJerseyNumber) {
        return res.status(400).json({ 
          message: `Jersey number ${jerseyNumber} is already taken by another player in this tournament` 
        });
      }
    }

    // Update or create player tournament stats with jersey number
    await prisma.playerTournamentStats.upsert({
      where: {
        playerId_tournamentId: {
          playerId,
          tournamentId: lineup.fixture.tournamentId
        }
      },
      update: {
        matchesPlayed: {
          increment: 1
        },
        jerseyNumber: jerseyNumber || undefined
      },
      create: {
        player: {
          connect: { id: playerId }
        },
        tournament: {
          connect: { id: lineup.fixture.tournamentId }
        },
        matchesPlayed: 1,
        minutesPlayed: 0,
        jerseyNumber: jerseyNumber || null
      }
    });

    // Add player to lineup with jersey number
    const playerStat = await prisma.playerStats.create({
      data: {
        lineup: {
          connect: { id: lineupId }
        },
        player: {
          connect: { id: playerId }
        },
        tournament: lineup.fixture.tournamentId ? {
          connect: { id: lineup.fixture.tournamentId }
        } : undefined,
        position,
        isStarting: isStarting || false,
        isOnField: isOnField,
        jerseyNumber: jerseyNumber || existingPlayerTournamentStats?.jerseyNumber || null
      }
    });

    // Update player's isPlaying status
    await prisma.user.update({
      where: { id: playerId },
      data: {
        isPlaying: true,
        matchesPlayed: {
          increment: 1
        }
      }
    });

    // Update or create player tournament stats
    await prisma.playerTournamentStats.upsert({
      where: {
        playerId_tournamentId: {
          playerId,
          tournamentId: lineup.fixture.tournamentId
        }
      },
      update: {
        matchesPlayed: {
          increment: 1
        }
      },
      create: {
        player: {
          connect: { id: playerId }
        },
        tournament: {
          connect: { id: lineup.fixture.tournamentId }
        },
        matchesPlayed: 1,
        minutesPlayed: 0
      }
    });

    return res.status(201).json(playerStat);
  } catch (error) {
    console.error("Error adding player to lineup:", error);
    return next(new AppError('Failed to add player to lineup', 500));
  }
};

// Add a function to remove a player from lineup
export const removePlayerFromLineup = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    // Check if player stat exists
    const playerStat = await prisma.playerStats.findUnique({
      where: { id },
      include: {
        lineup: {
          include: {
            fixture: {
              include: {
                tournament: true
              }
            }
          }
        }
      }
    });

    if (!playerStat) {
      return res.status(404).json({ message: "Player stat not found" });
    }

    // Check if user is tournament admin
    if (playerStat.lineup.fixture.tournament.adminId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to remove players from this lineup" });
    }

    // Update player's isPlaying status
    await prisma.user.update({
      where: { id: playerStat.playerId },
      data: {
        isPlaying: false,
        matchesPlayed: {
          decrement: 1
        }
      }
    });

    // Update player tournament stats
    const playerTournamentStat = await prisma.playerTournamentStats.findFirst({
      where: {
        playerId: playerStat.playerId,
        tournamentId: playerStat.lineup.fixture.tournamentId
      }
    });

    if (playerTournamentStat && playerTournamentStat.matchesPlayed > 0) {
      await prisma.playerTournamentStats.update({
        where: { id: playerTournamentStat.id },
        data: {
          matchesPlayed: {
            decrement: 1
          }
        }
      });
    }

    // Delete player stat
    await prisma.playerStats.delete({
      where: { id }
    });

    return res.status(200).json({ message: "Player removed from lineup successfully" });
  } catch (error) {
    console.error("Error removing player from lineup:", error);
    return next(new AppError('Failed to remove player from lineup', 500));
  }
};

// Get lineup by fixture and team
export const getLineup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fixtureId, teamId } = req.params;

    // First get the fixture to get the tournament ID
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: { tournamentId: true }
    });

    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }

    // Make sure we're only getting the lineup for this specific fixture and team
    const lineup = await prisma.lineup.findFirst({
      where: {
        fixtureId,
        teamId
      },
      include: {
        players: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                image: true,
                primaryPosition: true,
                preferredFoot: true,
                PlayerTournamentStats: {
                  where: {
                    tournamentId: fixture.tournamentId
                  },
                  select: {
                    id: true,
                    jerseyNumber: true,
                    matchesPlayed: true,
                    minutesPlayed: true,
                  }
                },
                // Only include player stats for this specific lineup
                playerStats: {
                  where: {
                    lineup: {
                      fixtureId,
                      teamId
                    }
                  },
                  select: {
                    id: true,
                    minutesPlayed: true,
                    jerseyNumber: true,
                  }
                },
              }
            }
          }
        }
      }
    });

    if (!lineup) {
      // If no lineup exists, return an empty lineup structure
      return res.status(200).json({
        id: null,
        fixtureId,
        teamId,
        players: []
      });
    }

    return res.status(200).json(lineup);
  } catch (error) {
    console.error("Error fetching lineup:", error);
    return next(new AppError('Failed to fetch lineup', 500));
  }
};

// Update player stats
export const updatePlayerStats = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { minutesPlayed, goals, assists, yellowCards, redCards } = req.body;

    // Find player stats
    const playerStats = await prisma.playerStats.findUnique({
      where: { id },
      include: {
        lineup: {
          include: {
            fixture: {
              include: {
                tournament: {
                  select: { adminId: true }
                }
              }
            }
          }
        }
      }
    });

    if (!playerStats) {
      return res.status(404).json({ message: "Player stats not found" });
    }

    // Verify user is the tournament admin
    if (playerStats.lineup.fixture.tournament.adminId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to update player stats for this fixture" });
    }

    // Update player stats
    const updatedPlayerStats = await prisma.playerStats.update({
      where: { id },
      data: {
        minutesPlayed: minutesPlayed !== undefined ? minutesPlayed : undefined,
        goals: goals !== undefined ? goals : undefined,
        assists: assists !== undefined ? assists : undefined,
        yellowCards: yellowCards !== undefined ? yellowCards : undefined,
        redCards: redCards !== undefined ? redCards : undefined
      }
    });

    // Update leaderboard entry for this player in the tournament
    if (goals !== undefined || assists !== undefined) {
      const tournamentId = playerStats.lineup.fixture.tournamentId;
      const playerId = playerStats.playerId;
      const teamId = playerStats.lineup.teamId;

      // Find existing leaderboard entry or create new one
      const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
        where: {
          tournamentId,
          playerId,
          teamId
        }
      });

      if (leaderboardEntry) {
        // Update existing entry
        await prisma.leaderboardEntry.update({
          where: { id: leaderboardEntry.id },
          data: {
            goals: goals !== undefined ? leaderboardEntry.goals + (goals - playerStats.goals) : undefined
          }
        });
      } else {
        // Create new entry
        await prisma.leaderboardEntry.create({
          data: {
            tournament: {
              connect: { id: tournamentId }
            },
            player: {
              connect: { id: playerId }
            },
            team: {
              connect: { id: teamId }
            },
            goals: goals || 0
          }
        });
      }
    }

    return res.status(200).json(updatedPlayerStats);
  } catch (error) {
    console.error("Error updating player stats:", error);
    return next(new AppError('Failed to update player stats', 500));
  }
};