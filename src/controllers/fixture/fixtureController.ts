import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prismaClient';
import AppError from '../../utils/AppError';
import {updateTournamentStandings, updateCleanSheet} from '../leaderboard/leaderboardController';

// Create a new fixture
export const createFixture = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { tournamentId, homeTeamId, awayTeamId, date, status } = req.body;

    // Validate required fields
    if (!tournamentId || !homeTeamId || !awayTeamId || !date ||!status) {
      return res.status(400).json({ message: "Tournament ID, home team ID, away team ID, and date are required" });
    }

    // Check if tournament exists and user is admin
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { adminId: true }
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Verify user is the tournament admin
    if (tournament.adminId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to create fixtures for this tournament" });
    }

    // Check if teams exist and are part of the tournament
    const tournamentTeams = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        teams: {
          select: { id: true }
        }
      }
    });

    if (!tournamentTeams) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const teamIds = tournamentTeams.teams.map(team => team.id);
    
    if (!teamIds.includes(homeTeamId)) {
      return res.status(400).json({ message: "Home team is not part of this tournament" });
    }
    
    if (!teamIds.includes(awayTeamId)) {
      return res.status(400).json({ message: "Away team is not part of this tournament" });
    }

    // Create fixture
    const fixture = await prisma.fixture.create({
      data: {
        tournament: {
          connect: { id: tournamentId }
        },
        homeTeam: {
          connect: { id: homeTeamId }
        },
        awayTeam: {
          connect: { id: awayTeamId }
        },
        date: new Date(date),
        status: status,
      }
    });

    return res.status(201).json(fixture);
  } catch (error) {
    console.error("Error creating fixture:", error);
    return next(new AppError('Failed to create fixture', 500));
  }
};

// Get all fixtures
export const getAllFixtures = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fixtures = await prisma.fixture.findMany({
      include: {
        tournament: {
          select: {
            id: true,
            name: true
          }
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            members: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    phoneNumber: true,
                } 
            },
            lineups: {
              include: {
                players: {
                  include: {
                    player: {
                      select: {
                        id: true,
                        name: true,
                        image: true,
                        primaryPosition: true
                      }
                    }
                  }
                }
              } 
            }
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            members: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    phoneNumber: true,
                }
            },
            lineups: {
              include: {
                players: {
                  include: {
                    player: {
                      select: {
                        id: true,
                        name: true,
                        image: true,
                        primaryPosition: true
                      }
                    }
                  }
                }
              } 
            }
          }
        }
      }
    });

    return res.status(200).json(fixtures);
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return next(new AppError('Failed to fetch fixtures', 500));
  }
};

// Get fixture by ID
export const getFixtureById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // First, get the fixture to obtain the tournamentId
    const fixtureBasic = await prisma.fixture.findUnique({
      where: { id },
      select: { tournamentId: true }
    });

    if (!fixtureBasic) {
      return res.status(404).json({ message: "Fixture not found" });
    }

    const tournamentId = fixtureBasic.tournamentId;

    const fixture = await prisma.fixture.findUnique({
      where: { id },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            adminId: true
          }
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            members: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    phoneNumber: true,
                } 
            },
            lineups: {
              where: {
               fixtureId: id, 
              },
              include: {
                players: {
                  select: {
                    id: true,
                    isOnField: true, // <-- Add this line
                    jerseyNumber: true,
                    player: {
                      select: {
                        id: true,
                        name: true,
                        image: true,
                        primaryPosition: true,
                        PlayerTournamentStats: {
                          where: {
                            tournamentId: tournamentId
                          },
                          select: {
                            jerseyNumber: true
                          }
                        }
                      }
                    }
                  }
                }
              } 
            }
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            members: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    phoneNumber: true,
                } 
            },
            lineups: {
              where:{
               fixtureId: id,
              },
              include: {
                players: {
                  select: {
                    id: true,
                    isOnField: true, // <-- Add this line
                    player: {
                      select: {
                        id: true,
                        name: true,
                        image: true,
                        primaryPosition: true,
                        PlayerTournamentStats: {
                          where: {
                            tournamentId: tournamentId
                          },
                          select: {
                            jerseyNumber: true
                          }
                        }
                      }
                    }
                  }
                }
              } 
            }
          }
        },
        events: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }

    return res.status(200).json(fixture);
  } catch (error) {
    console.error("Error fetching fixture:", error);
    return next(new AppError('Failed to fetch fixture', 500));
  }
};

// Update fixture
export const updateFixture = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { date, status, homeScore, awayScore } = req.body;

    // Check if fixture exists
    const fixture = await prisma.fixture.findUnique({
      where: { id },
      include: {
        tournament: {
          select: { adminId: true }
        }
      }
    });

    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }

    // Verify user is the tournament admin
    if (fixture.tournament.adminId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to update this fixture" });
    }

    // Update fixture
    const updatedFixture = await prisma.fixture.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        status: status || undefined,
        homeScore: homeScore !== undefined ? homeScore : undefined,
        awayScore: awayScore !== undefined ? awayScore : undefined
      }
    });

    // If fixture is marked as FULL_TIME, update standings and clean sheets
    if (status === 'FULL_TIME') {
      // Get the latest fixture data to ensure we have the most current scores
      // (which might have been updated through match events)
      const currentFixture = await prisma.fixture.findUnique({
        where: { id }
      });

      if (currentFixture && currentFixture.homeScore !== null && currentFixture.awayScore !== null) {
        await updateTournamentStandings(id);

        // Check for clean sheets using the latest scores
        if (currentFixture.homeScore === 0) {
          await updateCleanSheet(id, fixture.awayTeamId);
        }
        if (currentFixture.awayScore === 0) {
          await updateCleanSheet(id, fixture.homeTeamId);
        }
      }
    }

    return res.status(200).json(updatedFixture);
  } catch (error) {
    console.error("Error updating fixture:", error);
    return next(new AppError('Failed to update fixture', 500));
  }
};

// Delete fixture
export const deleteFixture = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    // Check if fixture exists
    const fixture = await prisma.fixture.findUnique({
      where: { id },
      include: {
        tournament: {
          select: { adminId: true }
        }
      }
    });

    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }

    // Verify user is the tournament admin
    if (fixture.tournament.adminId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to delete this fixture" });
    }

    // Get the fixture with all related data
    const fixtureWithData = await prisma.fixture.findUnique({
      where: { id },
      include: {
        tournament: true,
        homeTeam: true,
        awayTeam: true,
        events: {
          include: {
            player: true
          }
        }
      }
    });

    if (!fixtureWithData) {
      return res.status(404).json({ message: "Fixture not found" });
    }

    // Revert tournament standings
    if (fixtureWithData.status === 'FULL_TIME') {
      // Update tournament standings for both teams
      await prisma.tournamentStanding.updateMany({
        where: {
          tournamentId: fixtureWithData.tournamentId,
          teamId: {
            in: [fixtureWithData.homeTeamId, fixtureWithData.awayTeamId]
          }
        },
        data: {
          played: { decrement: 1 }
        }
      });

      // Update home team standings
      if (fixtureWithData.homeScore !== null && fixtureWithData.awayScore !== null) {
        const homeTeamStanding = await prisma.tournamentStanding.findFirst({
          where: {
            tournamentId: fixtureWithData.tournamentId,
            teamId: fixtureWithData.homeTeamId
          }
        });

        if (homeTeamStanding) {
          await prisma.tournamentStanding.update({
            where: { id: homeTeamStanding.id },
            data: {
              goalsFor: { decrement: fixtureWithData.homeScore },
              goalsAgainst: { decrement: fixtureWithData.awayScore },
              points: {
                decrement: fixtureWithData.homeScore > fixtureWithData.awayScore ? 3 :
                          fixtureWithData.homeScore === fixtureWithData.awayScore ? 1 : 0
              },
              won: fixtureWithData.homeScore > fixtureWithData.awayScore ? { decrement: 1 } : undefined,
              drawn: fixtureWithData.homeScore === fixtureWithData.awayScore ? { decrement: 1 } : undefined,
              lost: fixtureWithData.homeScore < fixtureWithData.awayScore ? { decrement: 1 } : undefined,
              goalDifference: { decrement: fixtureWithData.homeScore - fixtureWithData.awayScore }
            }
          });
        }

        // Update away team standings
        const awayTeamStanding = await prisma.tournamentStanding.findFirst({
          where: {
            tournamentId: fixtureWithData.tournamentId,
            teamId: fixtureWithData.awayTeamId
          }
        });

        if (awayTeamStanding) {
          await prisma.tournamentStanding.update({
            where: { id: awayTeamStanding.id },
            data: {
              goalsFor: { decrement: fixtureWithData.awayScore },
              goalsAgainst: { decrement: fixtureWithData.homeScore },
              points: {
                decrement: fixtureWithData.awayScore > fixtureWithData.homeScore ? 3 :
                          fixtureWithData.awayScore === fixtureWithData.homeScore ? 1 : 0
              },
              won: fixtureWithData.awayScore > fixtureWithData.homeScore ? { decrement: 1 } : undefined,
              drawn: fixtureWithData.awayScore === fixtureWithData.homeScore ? { decrement: 1 } : undefined,
              lost: fixtureWithData.awayScore < fixtureWithData.homeScore ? { decrement: 1 } : undefined,
              goalDifference: { decrement: fixtureWithData.awayScore - fixtureWithData.homeScore }
            }
          });
        }
      }
    }

    // Get all lineups for this fixture
    const lineups = await prisma.lineup.findMany({
      where: { fixtureId: id },
      include: {
        players: true
      }
    });

    // Get all match events for this fixture
    const matchEvents = await prisma.matchEvent.findMany({
      where: { fixtureId: id },
      include: {
        player: true
      }
    });

    // Create a map to track goals, assists, and saves per player
    const playerEventCounts = new Map();
    matchEvents.forEach(event => {
      if (!event.playerId) return;
      
      if (!playerEventCounts.has(event.playerId)) {
        playerEventCounts.set(event.playerId, {
          goals: 0,
          assists: 0,
          saves: 0
        });
      }
      
      const counts = playerEventCounts.get(event.playerId);
      switch (event.type) {
        case 'GOAL':
          counts.goals++;
          break;
        case 'ASSIST':
          counts.assists++;
          break;
        case 'SAVE':
          counts.saves++;
          break;
      }
    });

    // Revert player tournament stats and leaderboard entries
    for (const lineup of lineups) {
      for (const playerStat of lineup.players) {
        // Revert player's total matches played
        await prisma.user.update({
          where: { id: playerStat.playerId },
          data: {
            matchesPlayed: { decrement: 1 }
          }
        });

        // Revert tournament stats
        await prisma.playerTournamentStats.updateMany({
          where: {
            playerId: playerStat.playerId,
            tournamentId: fixtureWithData.tournamentId
          },
          data: {
            matchesPlayed: { decrement: 1 },
            minutesPlayed: { decrement: playerStat.minutesPlayed || 0 }
          }
        });

        // Get the event counts for this player
        const eventCounts = playerEventCounts.get(playerStat.playerId) || { goals: 0, assists: 0, saves: 0 };

        // Revert leaderboard entries
        const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
          where: {
            tournamentId: fixtureWithData.tournamentId,
            playerId: playerStat.playerId,
            teamId: lineup.teamId
          }
        });

        if (leaderboardEntry) {
          await prisma.leaderboardEntry.update({
            where: { id: leaderboardEntry.id },
            data: {
              goals: { decrement: eventCounts.goals },
              assists: { decrement: eventCounts.assists },
              saves: { decrement: eventCounts.saves },
              yellowCards: { decrement: playerStat.yellowCards || 0 },
              redCards: { decrement: playerStat.redCards || 0 },
              penaltys: { decrement: playerStat.penaltysGoals || 0 }
            }
          });
        }
      }
    }

    // Delete all player stats associated with these lineups
    for (const lineup of lineups) {
      await prisma.playerStats.deleteMany({
        where: { lineupId: lineup.id }
      });
    }

    // Delete all lineups associated with this fixture
    await prisma.lineup.deleteMany({
      where: { fixtureId: id }
    });

    // Delete all match events associated with this fixture
    await prisma.matchEvent.deleteMany({
      where: { fixtureId: id }
    });

    // Delete fixture
    await prisma.fixture.delete({
      where: { id }
    });

    return res.status(200).json({ message: "Fixture and all related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting fixture:", error);
    return next(new AppError('Failed to delete fixture', 500));
  }
};

// Get fixtures by tournament ID
export const getFixturesByTournament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tournamentId } = req.params;

    const fixtures = await prisma.fixture.findMany({
      where: {
        tournamentId
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            members: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    phoneNumber: true,
                }
            },
            lineups: {
              include: {
                players: {
                  include: {
                    player: {
                      select: {
                        id: true,
                        name: true,
                        image: true,
                        primaryPosition: true
                      }
                    }
                  }
                }
              }
            }
          },
          
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            members: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    phoneNumber: true,
                } 
            },
            lineups: {
              include: {
                players: {
                  include: {
                    player: {
                      select: {
                        id: true,
                        name: true,
                        image: true,
                        primaryPosition: true
                      }
                    }
                  }
                }
              } 
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return res.status(200).json(fixtures);
  } catch (error) {
    console.error("Error fetching tournament fixtures:", error);
    return next(new AppError('Failed to fetch tournament fixtures', 500));
  }
};

// Create a fixture container with subfixtures
export const createFixtureContainer = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { tournamentId, matchType, subfixtures } = req.body;

    // Validate required fields
    if (!tournamentId || !matchType || !subfixtures || !Array.isArray(subfixtures) || subfixtures.length === 0) {
      return res.status(400).json({ 
        message: "Tournament ID, match type, and at least one subfixture are required" 
      });
    }

    // Check if tournament exists and user is admin
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { adminId: true }
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Verify user is the tournament admin
    if (tournament.adminId !== req.user.id) {
      return res.status(403).json({ 
        message: "You don't have permission to create fixtures for this tournament" 
      });
    }

    // Get tournament teams for validation
    const tournamentTeams = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        teams: {
          select: { id: true }
        }
      }
    });

    if (!tournamentTeams) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const teamIds = tournamentTeams.teams.map(team => team.id);
    
    // Validate all teams in subfixtures
    for (const subfixture of subfixtures) {
      const { homeTeam, awayTeam } = subfixture;
      
      if (!teamIds.includes(homeTeam)) {
        return res.status(400).json({ 
          message: `Team with ID ${homeTeam} is not part of this tournament` 
        });
      }
      
      if (!teamIds.includes(awayTeam)) {
        return res.status(400).json({ 
          message: `Team with ID ${awayTeam} is not part of this tournament` 
        });
      }
    }

    // Create fixture container with subfixtures in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create the fixture container
      const fixtureContainer = await prisma.fixtureContainer.create({
        data: {
          tournamentId,
          matchType,
        }
      });
    
      // Create all subfixtures
      const createdSubfixtures = await Promise.all(
        subfixtures.map(async (subfixture) => {
          const { homeTeam, awayTeam, matchDate, time, status, venue } = subfixture;
          
          // Use unchecked create input when providing containerId
          return prisma.fixture.create({
            data: {
              containerId: fixtureContainer.id,
              tournamentId: tournamentId,
              homeTeamId: homeTeam,       
              awayTeamId: awayTeam,       
              date: new Date(matchDate),
              time: time || null,
              venue: venue || null,
              status: status || 'scheduled',
            }
          });
        })
      );
    
      return {
        container: fixtureContainer,
        subfixtures: createdSubfixtures
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating fixture container:", error);
    return next(new AppError('Failed to create fixture container', 500));
  }
};

// Get fixture container by ID with all subfixtures
export const getFixtureContainerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const fixtureContainer = await prisma.fixtureContainer.findUnique({
      where: { id },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            adminId: true
          }
        },
        subfixtures: {
          include: {
            homeTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
                members: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        phoneNumber: true,
                    } 
                },
                lineups: {
                  include: {
                    players: {
                      include: {
                        player: {
                          select: {
                            id: true,
                            name: true,
                            image: true,
                            primaryPosition: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
                members: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        phoneNumber: true,
                    } 
                },
                lineups: {
                  include: {
                    players: {
                      include: {
                        player: {
                          select: {
                            id: true,
                            name: true,
                            image: true,
                            primaryPosition: true
                          }
                        }
                      }
                    }
                  } 
                }
              }
            }
          }
        }
      }
    });

    if (!fixtureContainer) {
      return res.status(404).json({ message: "Fixture container not found" });
    }

    return res.status(200).json(fixtureContainer);
  } catch (error) {
    console.error("Error fetching fixture container:", error);
    return next(new AppError('Failed to fetch fixture container', 500));
  }
};

// Get all fixture containers for a tournament
export const getFixtureContainersByTournament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tournamentId } = req.params;

    const fixtureContainers = await prisma.fixtureContainer.findMany({
      where: {
        tournamentId
      },
      include: {
        subfixtures: {
          include: {
            homeTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
                members: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        phoneNumber: true,
                    }
                },
                lineups: {
                  include: {
                    players: {
                      include: {
                        player: {
                          select: {
                            id: true,
                            name: true,
                            image: true,
                            primaryPosition: true
                          }
                        }
                      }
                    }
                  } 
                }
              }
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
                members: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        phoneNumber: true,
                    } 
                },
                lineups: {
                  include: {
                    players: {
                      include: {
                        player: {
                          select: {
                            id: true,
                            name: true,
                            image: true,
                            primaryPosition: true
                          }
                        }
                      }
                    }
                  } 
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return res.status(200).json(fixtureContainers);
  } catch (error) {
    console.error("Error fetching tournament fixture containers:", error);
    return next(new AppError('Failed to fetch tournament fixture containers', 500));
  }
};

// Add subfixture to existing container
export const addSubfixtureToContainer = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { containerId } = req.params;
    const { homeTeam, awayTeam, matchDate, time, status, venue } = req.body;

    // Check if container exists
    const container = await prisma.fixtureContainer.findUnique({
      where: { id: containerId },
      include: {
        tournament: {
          select: { 
            id: true,
            adminId: true,
            teams: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (!container) {
      return res.status(404).json({ message: "Fixture container not found" });
    }

    // Verify user is the tournament admin
    if (container.tournament.adminId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to add fixtures to this container" });
    }

    // Validate teams are part of the tournament
    const teamIds = container.tournament.teams.map(team => team.id);
    
    if (!teamIds.includes(homeTeam)) {
      return res.status(400).json({ message: `Team with ID ${homeTeam} is not part of this tournament` });
    }
    
    if (!teamIds.includes(awayTeam)) {
      return res.status(400).json({ message: `Team with ID ${awayTeam} is not part of this tournament` });
    }

    // Create new subfixture
    const newSubfixture = await prisma.fixture.create({
      data: {
        containerId: containerId,
        tournamentId: container.tournament.id,
        homeTeamId: homeTeam,
        awayTeamId: awayTeam,
        date: new Date(matchDate),
        time: time || null,
        venue: venue || null,
        status: status || 'scheduled',
      }
    });

    return res.status(201).json(newSubfixture);
  } catch (error) {
    console.error("Error adding subfixture to container:", error);
    return next(new AppError('Failed to add subfixture to container', 500));
  }
};

// Update subfixture by ID
export const updateSubfixture = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { subfixtureid } = req.params;
    const { homeTeam, awayTeam, matchDate, time, status, venue, homeScore, awayScore } = req.body;

    // Check if subfixture exists
    const subfixture = await prisma.fixture.findUnique({
      where: { id: subfixtureid },
      include: {
        container: {
          include: {
            tournament: {
              select: { 
                adminId: true,
                teams: {
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    if (!subfixture) {
      return res.status(404).json({ message: "Subfixture not found" });
    }

    // Verify user is the tournament admin
    if (subfixture.container?.tournament.adminId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to update this subfixture" });
    }

    // Validate teams if they are being updated
    let updateData: any = {};
    
    if (homeTeam || awayTeam) {
      const teamIds = subfixture.container?.tournament.teams.map(team => team.id) || [];
      
      if (homeTeam && !teamIds.includes(homeTeam)) {
        return res.status(400).json({ message: `Team with ID ${homeTeam} is not part of this tournament` });
      }
      
      if (awayTeam && !teamIds.includes(awayTeam)) {
        return res.status(400).json({ message: `Team with ID ${awayTeam} is not part of this tournament` });
      }
      
      if (homeTeam) updateData.homeTeamId = homeTeam;
      if (awayTeam) updateData.awayTeamId = awayTeam;
    }

    // Add other update fields
    if (matchDate) updateData.date = new Date(matchDate);
    if (time !== undefined) updateData.time = time;
    if (venue !== undefined) updateData.venue = venue;
    if (status) updateData.status = status;
    if (homeScore !== undefined) updateData.homeScore = homeScore;
    if (awayScore !== undefined) updateData.awayScore = awayScore;

    // Update subfixture
    const updatedSubfixture = await prisma.fixture.update({
      where: { id: subfixtureid },
      data: updateData
    });

    return res.status(200).json(updatedSubfixture);
  } catch (error) {
    console.error("Error updating subfixture:", error);
    return next(new AppError('Failed to update subfixture', 500));
  }
};

// Delete subfixture from container
export const deleteSubfixture = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { subfixtureid } = req.params;
    const { containerId } = req.body;

    // Check if subfixture exists
    const subfixture = await prisma.fixture.findUnique({
      where: { 
        id: subfixtureid,
        containerId: containerId
      },
      include: {
        container: {
          include: {
            tournament: {
              select: { adminId: true }
            }
          }
        }
      }
    });

    if (!subfixture) {
      return res.status(404).json({ message: "Subfixture not found in the specified container" });
    }

    // Verify user is the tournament admin
    if (subfixture.container?.tournament.adminId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to delete this subfixture" });
    }

    // Delete subfixture
    await prisma.fixture.delete({
      where: { id: subfixtureid }
    });

    return res.status(200).json({ message: "Subfixture deleted successfully" });
  } catch (error) {
    console.error("Error deleting subfixture:", error);
    return next(new AppError('Failed to delete subfixture', 500));
  }
};

// Delete all subfixtures from a container
export const deleteAllSubfixturesFromContainer = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { containerId } = req.params;

    // Check if container exists
    const container = await prisma.fixtureContainer.findUnique({
      where: { id: containerId },
      include: {
        tournament: {
          select: { adminId: true }
        }
      }
    });

    if (!container) {
      return res.status(404).json({ message: "Fixture container not found" });
    }

    // Verify user is the tournament admin
    if (container.tournament.adminId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to delete subfixtures from this container" });
    }

    // Delete all subfixtures in the container
    await prisma.fixture.deleteMany({
      where: { containerId: containerId }
    });

    return res.status(200).json({ message: "All subfixtures deleted successfully from the container" });
  } catch (error) {
    console.error("Error deleting subfixtures from container:", error);
    return next(new AppError('Failed to delete subfixtures from container', 500));
  }
};
