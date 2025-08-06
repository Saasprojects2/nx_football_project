import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/AppError";
import { prisma } from "../../prismaClient";
import { createTournamentSchema } from "../../validations/tournamentValidator";

// Update the Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

//create a new tournament
export const createTournament = async (req: AuthenticatedRequest, res: Response, next: NextFunction)  => {

    try {
        
        if(!req.user){
            return res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
        }
        const validatedData = createTournamentSchema.parse(req.body);
        const { name, description, startDate, endDate, logo } = validatedData;

        if(!name || !startDate){
            return res.status(400).json({
                status: "error",
                message: "Name and startDate are required", 
            })
        }

        const tournament = await prisma.tournament.create({
            data: {
                name,
                description,
                logo,
                startDate,
                endDate,
                admin: {
                    connect: {
                        id: req.user.id,
                    }
                }
            }
        });

        return res.status(201).json({
            status: "success",
            message: "Tournament created successfully",
            data: tournament,   
        })
    }
    catch (error) {
        console.log("Error creating tournament: ", error);
        return next(new AppError("Internal server error", 500));       
    }
};


//get all tournaments
export const getAllTournaments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const tournaments = await prisma.tournament.findMany({
            include: {
              admin: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              teams: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                  description: true
                }
              },
              fixtures: {
               include: {
                homeTeam: {
                  select: {
                    id: true,
                    name: true,
                    logo: true
                  }
                },
                awayTeam: {
                  select: {
                    id: true,
                    name: true,
                    logo: true
                  }
                }
               } 
              }
            }
          });

          return res.status(200).json({
            status: "success",  
            data: tournaments,   
          })
      
    }
    catch (error) {
        console.log("Error getting tournaments: ", error);
        return next(new AppError("Internal server error", 500));
    } 
}

// Get past tournaments (tournaments with endDate in the past)
export const getPastTournaments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const currentDate = new Date();
        
        const tournaments = await prisma.tournament.findMany({
            where: {
                endDate: {
                    lt: currentDate
                }
            },
            include: {
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                teams: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        description: true
                    }
                },
                fixtures: {
                    include: {
                        homeTeam: {
                            select: {
                                id: true,
                                name: true,
                                logo: true
                            }
                        },
                        awayTeam: {
                            select: {
                                id: true,
                                name: true,
                                logo: true
                            }
                        }
                    }
                }
            }
        });

        return res.status(200).json({
            status: "success",
            data: tournaments,
        });
    } catch (error) {
        console.log("Error getting past tournaments: ", error);
        return next(new AppError("Internal server error", 500));
    }
};

// Get current tournaments (tournaments with startDate in the past and endDate in the future)
export const getCurrentTournaments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const currentDate = new Date();
        
        const tournaments = await prisma.tournament.findMany({
            where: {
                startDate: {
                    lte: currentDate
                },
                endDate: {
                    gte: currentDate
                }
            },
            include: {
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                teams: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        description: true
                    }
                },
                fixtures: {
                    include: {
                        homeTeam: {
                            select: {
                                id: true,
                                name: true,
                                logo: true
                            }
                        },
                        awayTeam: {
                            select: {
                                id: true,
                                name: true,
                                logo: true
                            }
                        }
                    }
                }
            }
        });

        return res.status(200).json({
            status: "success",
            data: tournaments,
        });
    } catch (error) {
        console.log("Error getting current tournaments: ", error);
        return next(new AppError("Internal server error", 500));
    }
};

// Get future tournaments (tournaments with startDate in the future)
export const getFutureTournaments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const currentDate = new Date();
        
        const tournaments = await prisma.tournament.findMany({
            where: {
                startDate: {
                    gt: currentDate
                }
            },
            include: {
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                teams: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        description: true
                    }
                },
                fixtures: {
                    include: {
                        homeTeam: {
                            select: {
                                id: true,
                                name: true,
                                logo: true
                            }
                        },
                        awayTeam: {
                            select: {
                                id: true,
                                name: true,
                                logo: true
                            }
                        }
                    }
                }
            }
        });

        return res.status(200).json({
            status: "success",
            data: tournaments,
        });
    } catch (error) {
        console.log("Error getting future tournaments: ", error);
        return next(new AppError("Internal server error", 500));
    }
};


//get a tournament by id
export const getTournamentById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
     const { id } = req.params;

     if(!id){
        return res.status(400).json({
            status: "error",
            message: "Tournament id is required",
        })
     }

     const tournament = await prisma.tournament.findUnique({
        where: { id },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          teams: {
            select: {
              id: true,
              name: true,
              logo: true,
              description: true
            }
          },
          fixtures: {
            include: {
              homeTeam: true,
              awayTeam: true
            }
          }
        }
      });
      
  
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      return res.status(200).json({
        status: "success",
        data: tournament, 
      })
    }
    catch (error) {
        console.log("Error getting tournament: ", error);
        return next(new AppError("Internal server error", 500));
    }
}

// Update a tournament
export const updateTournament = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
     if(!req.user){
        return res.status(401).json({
            status: "error",
            message: "Unauthorized",
        });
     }
     const { id } = req.params;
     const validatedData = createTournamentSchema.parse(req.body);
     const { name, description, startDate, endDate, logo } = validatedData;

     // Check if tournament exists and user is admin
    const tournament = await prisma.tournament.findUnique({
        where: { id },
        select: { adminId: true }
      });
  
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
  
      // Verify user is the tournament admin
      if (tournament.adminId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this tournament" });
      }
  
      // Update tournament
      const updatedTournament = await prisma.tournament.update({
        where: { id },
        data: {
          name,
          description,
          logo,
          startDate,
          endDate
        }
      });
  
      return res.status(200).json(updatedTournament);
    }
    catch (error) {
        console.log("Error updating tournament: ", error);
        return next(new AppError("Internal server error", 500));
    }
}

// Delete a tournament
export const deleteTournament = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }
    
        const { id } = req.params;
    
        // Check if tournament exists and user is admin
        const tournament = await prisma.tournament.findUnique({
          where: { id },
          select: { 
            adminId: true,
            fixtures: {
              select: {
                id: true
              }
            }
          }
        });
    
        if (!tournament) {
          return res.status(404).json({ message: "Tournament not found" });
        }
    
        // Verify user is the tournament admin
        if (tournament.adminId !== req.user.id) {
          return res.status(403).json({ message: "You don't have permission to delete this tournament" });
        }
        
        // Get all fixture IDs for this tournament
        const fixtureIds = tournament.fixtures.map(fixture => fixture.id);
        
        // Use a transaction to ensure all related data is deleted properly
        await prisma.$transaction(async (tx) => {
          // 1. First delete player stats related to fixtures in this tournament
          if (fixtureIds.length > 0) {
            await tx.playerStats.deleteMany({
              where: {
                lineup: {
                  fixtureId: {
                    in: fixtureIds
                  }
                }
              }
            });
            
            // 2. Now delete lineups related to fixtures in this tournament
            await tx.lineup.deleteMany({
              where: {
                fixtureId: {
                  in: fixtureIds
                }
              }
            });
            
            // 3. Delete match events related to fixtures in this tournament
            await tx.matchEvent.deleteMany({
              where: {
                fixtureId: {
                  in: fixtureIds
                }
              }
            });
          }
          
          // 4. Delete player tournament stats for this tournament
          await tx.playerTournamentStats.deleteMany({
            where: {
              tournamentId: id
            }
          });
          
          // 5. Delete tournament standings for this tournament
          await tx.tournamentStanding.deleteMany({
            where: {
              tournamentId: id
            }
          });
          
          // 6. Delete leaderboard entries for this tournament
          await tx.leaderboardEntry.deleteMany({
            where: {
              tournamentId: id
            }
          });
          
          // 7. Delete fixtures related to this tournament
          await tx.fixture.deleteMany({
            where: {
              tournamentId: id
            }
          });
          
          // 8. Delete fixture containers for this tournament
          await tx.fixtureContainer.deleteMany({
            where: {
              tournamentId: id
            }
          });
          
          // 9. Delete player stats directly related to this tournament
          await tx.playerStats.deleteMany({
            where: {
              tournamentId: id
            }
          });
          
          // 10. Finally delete the tournament itself
          await tx.tournament.delete({
            where: { id }
          });
        });
    
        return res.status(200).json({ message: "Tournament and all related data deleted successfully" });
      } catch (error) {
        console.error("Error deleting tournament:", error);
        return next(new AppError('Failed to delete tournament', 500));
      }
}


// Add team to tournament
export const addTeamToTournament = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const { tournamentId, teamId } = req.body;
  
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
        return res.status(403).json({ message: "You don't have permission to add teams to this tournament" });
      }
  
      // Check if team exists
      const team = await prisma.team.findUnique({
        where: { id: teamId }
      });
  
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
  
      // Add team to tournament
      const tour = await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          teams: {
            connect: { id: teamId }
          }
        }
      });
  
      return res.status(200).json({ message: "Team added to tournament successfully" ,tour});
    } catch (error) {
      console.error("Error adding team to tournament:", error);
      return next(new AppError('Failed to add team to tournament', 500));
    }
  };




// Remove team from tournament
export const removeTeamFromTournament = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const { tournamentId, teamId } = req.params;
  
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
        return res.status(403).json({ message: "You don't have permission to remove teams from this tournament" });
      }
  
      // Remove team from tournament
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          teams: {
            disconnect: { id: teamId }
          }
        }
      });
  
      return res.status(200).json({ message: "Team removed from tournament successfully" });
    } catch (error) {
      console.error("Error removing team from tournament:", error);
      return next(new AppError('Failed to remove team from tournament', 500));
    }
  };
  
  // Get tournaments created by current user
  export const getMyTournaments = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const tournaments = await prisma.tournament.findMany({
        where: {
          adminId: req.user.id
        },
        include: {
          teams: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          },
          fixtures: {
            select: {
              id: true,
              date: true,
              status: true,
              homeTeam: {
                select: {
                  id: true,
                  name: true,
                  logo: true
                }
              },
              awayTeam: {
                select: {
                  id: true,
                  name: true,
                  logo: true
                }
              }
            }
          }
        }
      });
  
      return res.status(200).json(tournaments);
    } catch (error) {
      console.error("Error fetching user tournaments:", error);
      return next(new AppError('Failed to fetch user tournaments', 500));
    }
  };