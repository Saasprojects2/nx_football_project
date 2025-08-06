import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prismaClient';
import AppError from '../../utils/AppError';

// Create a match event
export const createMatchEvent = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { fixtureId, type, minute, playerId, minutesPlayed, substitutePlayerId, position, outcome, goalkeeperId, teamId } = req.body;

    // Validate required fields
    if (!fixtureId || !type) {
      return res.status(400).json({ message: "Fixture ID, event type, and minute are required" });
    }

    // Additional validation for substitution events
    if (type === 'SUBSTITUTION' && (!playerId || !substitutePlayerId)) {
      return res.status(400).json({ message: "Both player coming on and player going off are required for substitutions" });
    }

    // Additional validation for offside events
    if (type === 'OFFSIDE' && !teamId) {
      return res.status(400).json({ message: "Team ID is required for offside events" });
    }

    // Additional validation for own goal events
    if (type === 'OWN_GOAL' && !playerId) {
      return res.status(400).json({ message: "Player ID is required for own goal events" });
    }

    // Check if fixture exists
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
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
      return res.status(403).json({ message: "You don't have permission to add events to this fixture" });
    }

    // For substitution events, fetch player details to include in metadata
    let substitutionMetadata;
    let penaltyMetadata;
    
    if (type === 'SUBSTITUTION' && playerId && substitutePlayerId) {
      // Parse existing metadata if present
      let metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
      
      // Fetch player details regardless of metadata format
      const playerComingOff = await prisma.user.findUnique({
        where: { id: playerId },
        select: { id: true, name: true, image: true }
      });
      
      const playerComingOn = await prisma.user.findUnique({
        where: { id: substitutePlayerId },
        select: { id: true, name: true, image: true }
      });

      // Handle both old and new metadata formats
      if (Object.keys(metadata).length <= 2) {
        // Old format: just substitutePlayerId and position
        metadata = {
          substitutePlayerId,
          substitutePlayer: playerComingOn,
          replacedPlayerId: playerId,
          replacedPlayer: playerComingOff,
          position: metadata.position || position,
          playerOffName: playerComingOff?.name,
          playerOnName: playerComingOn?.name
        };
      } else {
        // New format: ensure all required fields are present
        metadata = {
          ...metadata,
          substitutePlayerId,
          replacedPlayerId: playerId,
          position: metadata.position || position,
          playerOffName: metadata.playerOffName || playerComingOff?.name,
          playerOnName: metadata.playerOnName || playerComingOn?.name,
          replacedPlayer: metadata.replacedPlayer || playerComingOff,
          substitutePlayer: metadata.substitutePlayer || playerComingOn
        };
      }

      substitutionMetadata = JSON.stringify(metadata);
    } else if (type === 'PENALTY' && playerId) {
      // Get player details
      const player = await prisma.user.findUnique({
        where: { id: playerId },
        select: { name: true, image: true }
      });

      // Get goalkeeper details if provided
      let goalkeeperDetails = null;
      if (goalkeeperId) {
        const goalkeeper = await prisma.user.findUnique({
          where: { id: goalkeeperId },
          select: { name: true, image: true }
        });
        goalkeeperDetails = {
          id: goalkeeperId,
          name: goalkeeper?.name,
          image: goalkeeper?.image
        };
      }

      penaltyMetadata = JSON.stringify({
        goalkeeperId: goalkeeperId || null,
        playerName: player?.name || null,
        playerImage: player?.image || null,
        goalkeeper: goalkeeperDetails
      });
    }

    // Create match event
    const matchEvent = await prisma.matchEvent.create({
      data: {
        fixture: {
          connect: { id: fixtureId }
        },
        type,
        minute,
        player: playerId ? {
          connect: { id: playerId }
        } : undefined,
        metadata: type === 'SUBSTITUTION' ? substitutionMetadata : 
          (type === 'PENALTY' ? penaltyMetadata : 
          (type === 'OFFSIDE' ? JSON.stringify({ teamId }) : undefined))
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Handle own goal event
    if (type === 'OWN_GOAL' && playerId) {
      // Find player in lineup
      const playerLineup = await prisma.playerStats.findFirst({
        where: {
          playerId,
          lineup: {
            fixtureId
          }
        },
        include: {
          lineup: true
        }
      });

      if (playerLineup) {
        // Update player stats
        await prisma.playerStats.update({
          where: { id: playerLineup.id },
          data: {
            goals: { increment: 1 }
          }
        });

        // Get current fixture data to ensure we have the latest scores
        const currentFixture = await prisma.fixture.findUnique({
          where: { id: fixtureId }
        });

        // Initialize scores if they're null
        const currentHomeScore = currentFixture?.homeScore ?? 0;
        const currentAwayScore = currentFixture?.awayScore ?? 0;

        // For own goals, we need to increment the opposing team's score
        if (playerLineup.lineup.teamId === fixture.homeTeamId) {
          // Home team player scored own goal - increment away team score
          await prisma.fixture.update({
            where: { id: fixtureId },
            data: {
              awayScore: currentAwayScore + 1
            }
          });
        } else if (playerLineup.lineup.teamId === fixture.awayTeamId) {
          // Away team player scored own goal - increment home team score
          await prisma.fixture.update({
            where: { id: fixtureId },
            data: {
              homeScore: currentHomeScore + 1
            }
          });
        }

        // Update leaderboard
        const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
          where: {
            tournamentId: fixture.tournamentId,
            playerId,
            teamId: playerLineup.lineup.teamId
          }
        });

        if (leaderboardEntry) {
          await prisma.leaderboardEntry.update({
            where: { id: leaderboardEntry.id },
            data: {
              goals: { increment: 1 }
            }
          });
        } else {
          await prisma.leaderboardEntry.create({
            data: {
              tournament: {
                connect: { id: fixture.tournamentId }
              },
              player: {
                connect: { id: playerId }
              },
              team: {
                connect: { id: playerLineup.lineup.teamId }
              },
              goals: 1
            }
          });
        }
      }
    }

    // Process the response to include parsed metadata
    let response = {
      ...matchEvent,
      metadata: matchEvent.metadata ? JSON.parse(matchEvent.metadata as string) : undefined
    };

    // Add substitution details if it's a substitution event
    if (type === 'SUBSTITUTION' && playerId && substitutePlayerId) {
      const playerComingOff = await prisma.user.findUnique({
        where: { id: playerId },
        select: { id: true, name: true, image: true }
      });
      
      const playerComingOn = await prisma.user.findUnique({
        where: { id: substitutePlayerId },
        select: { id: true, name: true, image: true }
      });

      response = {
        ...response,
        metadata: {
          playerOff: playerComingOff,
          playerOn: playerComingOn,
          position: position,
          playerOffName: playerComingOff?.name,
          playerOnName: playerComingOn?.name
        }
      };
    }

    // Handle substitution event
    if (type === 'SUBSTITUTION' && playerId && substitutePlayerId) {
      // Find both players in lineup
      const playerLineup = await prisma.playerStats.findFirst({
        where: {
          playerId,
          lineup: {
            fixtureId
          }
        },
        include: {
          lineup: true
        }
      });

      const substitutePlayerLineup = await prisma.playerStats.findFirst({
        where: {
          playerId: substitutePlayerId,
          lineup: {
            fixtureId
          }
        },
        include: {
          lineup: true
        }
      });

      if (playerLineup && substitutePlayerLineup) {
        // Update player stats for player going off
        await prisma.playerStats.update({
          where: { id: playerLineup.id },
          data: {
            isOnField: false,
            minutesPlayed: minute 
          }
        });

        // Update player stats for player coming on
        await prisma.playerStats.update({
          where: { id: substitutePlayerLineup.id },
          data: {
            isOnField: true,
            position: position || substitutePlayerLineup.position
          }
        });

      }
    }
    // If it's a goal event, update player stats and leaderboard
    if (type === 'GOAL' && playerId) {
      // Find player in lineup
      const playerLineup = await prisma.playerStats.findFirst({
        where: {
          playerId,
          lineup: {
            fixtureId
          }
        },
        include: {
          lineup: true
        }
      });

      if (playerLineup) {
        // Update player stats
        await prisma.playerStats.update({
          where: { id: playerLineup.id },
          data: {
            goals: { increment: 1 }
          }
        });

        // Get current fixture data to ensure we have the latest scores
        const currentFixture = await prisma.fixture.findUnique({
          where: { id: fixtureId }
        });

        // Initialize scores if they're null
        const currentHomeScore = currentFixture?.homeScore ?? 0;
        const currentAwayScore = currentFixture?.awayScore ?? 0;

        if (playerLineup.lineup.teamId === fixture.homeTeamId) {
          // Home team scored - update with the new score
          await prisma.fixture.update({
            where: { id: fixtureId },
            data: {
              homeScore: currentHomeScore + 1
            }
          });
        } else if (playerLineup.lineup.teamId === fixture.awayTeamId) {
          // Away team scored - update with the new score
          await prisma.fixture.update({
            where: { id: fixtureId },
            data: {
              awayScore: currentAwayScore + 1
            }
          });
        }

        // Update leaderboard
        const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
          where: {
            tournamentId: fixture.tournamentId,
            playerId,
            teamId: playerLineup.lineup.teamId
          }
        });

        if (leaderboardEntry) {
          await prisma.leaderboardEntry.update({
            where: { id: leaderboardEntry.id },
            data: {
              goals: { increment: 1 }
            }
          });
        } else {
          await prisma.leaderboardEntry.create({
            data: {
              tournament: {
                connect: { id: fixture.tournamentId }
              },
              player: {
                connect: { id: playerId }
              },
              team: {
                connect: { id: playerLineup.lineup.teamId }
              },
              goals: 1
            }
          });
        }
      }
    }

    // If it's a save event, update leaderboard for saves
    if (type === 'SAVE' && playerId) {

      const player = await prisma.playerStats.findFirst({
        where: { 
          playerId,
          lineup: {
            fixtureId 
          }
         },
        select: { position: true }
      });
      if (!player || player.position !== 'GOALKEEPER') {
        return res.status(400).json({ message: "Only goalkeepers can have save events" });
      }

      const playerLineup = await prisma.playerStats.findFirst({
        where: {
          playerId,
          lineup: {
            fixtureId
          }
        },
        include: {
          lineup: true
        }
      });

      if (playerLineup) {
        // Update leaderboard
        if (minutesPlayed) {
          await prisma.playerStats.update({
            where: { id: playerLineup.id },
            data: {
              minutesPlayed
            }
          });

          // Update tournament stats
          await prisma.playerTournamentStats.upsert({
            where: {
              playerId_tournamentId: {
                playerId,
                tournamentId: fixture.tournamentId
              }
            },
            update: {
              minutesPlayed
            },
            create: {
              player: { connect: { id: playerId } },
              tournament: { connect: { id: fixture.tournamentId } },
              matchesPlayed: 1,
              minutesPlayed
            }
          });
        }
        const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
          where: {
            tournamentId: fixture.tournamentId,
            playerId,
            teamId: playerLineup.lineup.teamId
          }
        });

        if (leaderboardEntry) {
          await prisma.leaderboardEntry.update({
            where: { id: leaderboardEntry.id },
            data: {
              saves: { increment: 1 }
            }
          });
        } else {
          await prisma.leaderboardEntry.create({
            data: {
              tournament: {
                connect: { id: fixture.tournamentId }
              },
              player: {
                connect: { id: playerId }
              },
              team: {
                connect: { id: playerLineup.lineup.teamId }
              },
              saves: 1
            }
          });
        }
      }
    }
        // Update player stats for assists
    if (type === 'ASSIST' && playerId) {

        const playerLineup = await prisma.playerStats.findFirst({
            where: {
              playerId,
              lineup: {
                fixtureId
              }
            },
            include: {
              lineup: true
            }
          });

          if (playerLineup) {
            // Update player stats
            await prisma.playerStats.update({
              where: { id: playerLineup.id },
              data: {
                assists: { increment: 1 }
              }
            });

            const assistLeaderboardEntry = await prisma.leaderboardEntry.findFirst({
              where: {
                tournamentId: fixture.tournamentId,
                playerId,
                teamId: playerLineup.lineup.teamId
              } 
            })
            if (assistLeaderboardEntry) {
              await prisma.leaderboardEntry.update({
                where: { id: assistLeaderboardEntry.id },
                data: {
                  assists: { increment: 1 }
                }
              }) 
            }else {
              await prisma.leaderboardEntry.create({
                data: {
                  tournament: {
                    connect: { id: fixture.tournamentId }
                  },
                  player: {
                    connect: { id: playerId }
                  },
                  team: {
                    connect: { id: playerLineup.lineup.teamId }
                  },
                  assists: 1
                }
              });
            }

            
          }

        }

        // Update player stats for yellow cards
    if ((type === 'YELLOW_CARD') && playerId) {

        const playerLineup = await prisma.playerStats.findFirst({
          where: {
            playerId,
            lineup: {
              fixtureId
            }
          },
          include: {
            lineup: true
          }
        });

        if (playerLineup) {
          // Update player stats
          await prisma.playerStats.update({
            where: { id: playerLineup.id },
            data: {
              yellowCards: { increment: 1 }
            }
          });

          // Update leaderboard
          const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
            where: {
              tournamentId: fixture.tournamentId,
              playerId,
              teamId: playerLineup.lineup.teamId
            }
          });

          if (leaderboardEntry) {
            await prisma.leaderboardEntry.update({
              where: { id: leaderboardEntry.id },
              data: {
                yellowCards: { increment: 1 }
              }
            });
          } else {
            await prisma.leaderboardEntry.create({
              data: {
                tournament: {
                  connect: { id: fixture.tournamentId }
                },
                player: {
                  connect: { id: playerId }
                },
                team: {
                  connect: { id: playerLineup.lineup.teamId }
                },
                yellowCards: 1
              }
            });
          }
      }  
    }
    // Update player stats for red cards
    if ((type === 'RED_CARD') && playerId) {

      const playerLineup = await prisma.playerStats.findFirst({
        where: {
          playerId,
          lineup: {
            fixtureId
          }
        },
        include: {
          lineup: true
        }
      });

      if (playerLineup) {
        // Update player stats
        await prisma.playerStats.update({
          where: { id: playerLineup.id },
          data: {
            redCards: { increment: 1 }
          }
        });

        // Update leaderboard
        const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
          where: {
            tournamentId: fixture.tournamentId,
            playerId,
            teamId: playerLineup.lineup.teamId
          }
        });

        if (leaderboardEntry) {
          await prisma.leaderboardEntry.update({
            where: { id: leaderboardEntry.id },
            data: {
              redCards: { increment: 1 }
            }
          });
        } else {
          await prisma.leaderboardEntry.create({
            data: {
              tournament: {
                connect: { id: fixture.tournamentId }
              },
              player: {
                connect: { id: playerId }
              },
              team: {
                connect: { id: playerLineup.lineup.teamId }
              },
              redCards: 1
            }
          });
        }
      }  
    }

    //update corners and corners taken
    if ((type === 'CORNER') && playerId) {

      const playerLineup = await prisma.playerStats.findFirst({
        where: {
          playerId,
          lineup: {
            fixtureId,
          }
        },
        include: {
          lineup: true
        }
      })

      if (playerLineup) {
        // Update leaderboard stats
        const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
          where: {
            tournamentId: fixture.tournamentId,
            playerId,
            teamId: playerLineup.lineup.teamId
          }
        })

        if (leaderboardEntry) {
          await prisma.leaderboardEntry.update({
            where: { id: leaderboardEntry.id },
            data: {
              corners: { increment: 1 }
            }
          }) 
        }else{
          await prisma.leaderboardEntry.create({
            data: {
              tournament: {
                connect: { id: fixture.tournamentId }
              },
              player: {
                connect: { id: playerId }
              },
              team: {
                connect: { id: playerLineup.lineup.teamId }
              },
              corners: 1
            } 
          })
        }
      }
    }

    //update foul taken
    if ((type === 'FOUL') && playerId) {

      const playerLineup = await prisma.playerStats.findFirst({
        where: {
          playerId,
          lineup: {
            fixtureId,
          }
        },
        include: {
          lineup: true
        }
      })

      if (playerLineup) {
        // Update leaderboard stats
        const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
          where: {
            tournamentId: fixture.tournamentId,
            playerId,
            teamId: playerLineup.lineup.teamId
          }
        })

        if (leaderboardEntry) {
          await prisma.leaderboardEntry.update({
            where: { id: leaderboardEntry.id },
            data: {
              fouls: { increment: 1 }
            }
          }) 
        }else{
          await prisma.leaderboardEntry.create({
            data: {
              tournament: {
                connect: { id: fixture.tournamentId }
              },
              player: {
                connect: { id: playerId }
              },
              team: {
                connect: { id: playerLineup.lineup.teamId }
              },
              fouls: 1
            } 
          })
        }
      }
    }

    //update penalty taken

    if ((type === 'PENALTY') && playerId) {

      if (!fixtureId || !playerId || !outcome) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate outcome
      if (!['SCORED', 'MISSED', 'SAVED'].includes(outcome)) {
        return res.status(400).json({ message: "Invalid penalty outcome" });
      }

      // Get player details to include name in metadata
      const player = await prisma.user.findUnique({
        where: { id: playerId },
        select: { name: true, image: true }
      });

      // Get goalkeeper details if provided
      let goalkeeperName = null;
      let goalkeeperImage = null;
      if (goalkeeperId) {
        const goalkeeper = await prisma.user.findUnique({
          where: { id: goalkeeperId },
          select: { name: true, image: true }
        });
        if (goalkeeper) {
          goalkeeperName = goalkeeper.name;
          goalkeeperImage = goalkeeper.image;
        }
      }

      // Create match event directly without storing in penaltyEvent variable
      await prisma.matchEvent.create({
        data: {
          fixtureId,
          type: 'PENALTY',
          playerId,
          minute,
          penaltyOutcome: outcome,
          metadata: JSON.stringify({
            goalkeeperId: goalkeeperId || null,
            playerName: player?.name || null,
            playerImage: player?.image || null,
            goalkeeperName: goalkeeperName,
            goalkeeperImage: goalkeeperImage
          })
        }
      });

      // If penalty was scored, update the score in the fixture
      if (outcome === 'SCORED') {
        // Get the fixture to determine which team scored
        const fixture = await prisma.fixture.findUnique({
          where: { id: fixtureId },
          include: {
            homeTeam: {
              include: { members: true }
            },
            awayTeam: {
              include: { members: true }
            }
          }
        });
        
        if (!fixture) {
          return res.status(404).json({ message: "Fixture not found" });
        }
        
        // Determine if player is from home or away team
        const isHomeTeamPlayer = fixture.homeTeam.members.some(member => member.id === playerId);
        
        // Update the appropriate score
        await prisma.fixture.update({
          where: { id: fixtureId },
          data: {
            homepenaltyScore: isHomeTeamPlayer ? { increment: 1 } : undefined,
            awaypenaltyScore: !isHomeTeamPlayer ? { increment: 1 } : undefined
          }
        });
        
        // Update player stats and leaderboard
        await prisma.playerStats.updateMany({
          where: {
            playerId,
            lineup: {
              fixtureId
            }
          },
          data: {
            penaltysGoals: { increment: 1 }
          }
        });
        
      }

      const playerLineup = await prisma.playerStats.findFirst({
        where: {
          playerId,
          lineup: {
            fixtureId,
          }
        },
        include: {
          lineup: true
        }
      })

      if (playerLineup) {
        // Update leaderboard stats
        const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
          where: {
            tournamentId: fixture.tournamentId,
            playerId,
            teamId: playerLineup.lineup.teamId
          }
        })

        if (leaderboardEntry) {
          await prisma.leaderboardEntry.update({
            where: { id: leaderboardEntry.id },
            data: {
              penaltys: { increment: 1 }
            }
          }) 
        }else{
          await prisma.leaderboardEntry.create({
            data: {
              tournament: {
                connect: { id: fixture.tournamentId }
              },
              player: {
                connect: { id: playerId }
              },
              team: {
                connect: { id: playerLineup.lineup.teamId }
              },
              penaltys: 1
            } 
          })
        }
      }
    }


    return res.status(201).json(response);
  } catch (error) {
    console.error("Error creating match event:", error);
    return next(new AppError('Failed to create match event', 500));
  }
};

// Get match events by fixture
export const getMatchEventsByFixture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fixtureId } = req.params;

    const matchEvents = await prisma.matchEvent.findMany({
      where: {
        fixtureId
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Process substitution events to include both players' details
    const processedEvents = await Promise.all(matchEvents.map(async event => {
      if (event.metadata && typeof event.metadata === 'string') {
        try {
          let metadata = JSON.parse(event.metadata);
          
          if (event.type === 'SUBSTITUTION') {
            // Fetch complete player details from database
            const playerComingOff = await prisma.user.findUnique({
              where: { id: event.playerId || '' },
              select: { 
                id: true, 
                name: true, 
                image: true,
                phoneNumber: true
              }
            });
            
            const playerComingOn = await prisma.user.findUnique({
              where: { id: metadata.substitutePlayerId },
              select: { 
                id: true, 
                name: true, 
                image: true,
                phoneNumber: true
              }
            });

            // Get player stats from the lineup
            const playerOffStats = await prisma.playerStats.findFirst({
              where: {
                playerId: event.playerId || undefined,
                lineup: { fixtureId }
              },
              select: {
                position: true,
                jerseyNumber: true,
                goals: true,
                penaltysGoals: true,
                assists: true,
                yellowCards: true,
                redCards: true,
                minutesPlayed: true,
                isOnField: true
              }
            });

            const playerOnStats = await prisma.playerStats.findFirst({
              where: {
                playerId: metadata.substitutePlayerId || undefined,
                lineup: { fixtureId }
              },
              select: {
                position: true,
                jerseyNumber: true,
                goals: true,
                penaltysGoals: true,
                assists: true,
                yellowCards: true,
                redCards: true,
                minutesPlayed: true,
                isOnField: true
              }
            });

            // Create complete metadata with player details
            metadata = {
              substitutePlayerId: metadata.substitutePlayerId,
              substitutePlayer: {
                ...playerComingOn,
                position: playerOnStats?.position || "DEFENDER",
                jerseyNumber: playerOnStats?.jerseyNumber || "0",
                isSub: true,
                isGoalkeeper: playerOnStats?.position === "GOALKEEPER",
                goals: playerOnStats?.goals || 0,
                fouls: 0,
                yellowCards: playerOnStats?.yellowCards || 0,
                redCards: playerOnStats?.redCards || 0,
                assists: playerOnStats?.assists || 0,
                saves: 0,
                shotsOnTarget: 0,
                isOnField: false,
                expanded: false,
                selectedStat: null,
                isBeingSubstituted: false,
                penaltyScored: null
              },
              replacedPlayerId: event.playerId,
              replacedPlayer: {
                ...playerComingOff,
                position: playerOffStats?.position || "DEFENDER",
                jerseyNumber: playerOffStats?.jerseyNumber || "0",
                isSub: false,
                isGoalkeeper: playerOffStats?.position === "GOALKEEPER",
                goals: playerOffStats?.goals || 0,
                fouls: 0,
                yellowCards: playerOffStats?.yellowCards || 0,
                redCards: playerOffStats?.redCards || 0,
                assists: playerOffStats?.assists || 0,
                saves: 0,
                shotsOnTarget: 0,
                isOnField: true,
                expanded: true,
                selectedStat: null,
                isBeingSubstituted: true,
                penaltyScored: null
              },
              position: metadata.position || playerOffStats?.position || "DEFENDER",
              playerOffName: playerComingOff?.name,
              playerOnName: playerComingOn?.name
            };

            return {
              ...event,
              metadata: JSON.stringify(metadata),
              substitutionDetails: {
                playerOff: metadata.replacedPlayer,
                playerOn: metadata.substitutePlayer,
                position: metadata.position,
                playerOffName: metadata.playerOffName,
                playerOnName: metadata.playerOnName
              }
            };
          } else if (event.type === 'PENALTY') {
            return {
              ...event,
              metadata,
              penaltyDetails: {
                player: metadata.playerName,
                playerImage: metadata.playerImage,
                goalkeeper: metadata.goalkeeper,
                outcome: event.penaltyOutcome
              }
            };
          }
          
          // For other event types with metadata
          return {
            ...event,
            metadata
          };
        } catch (error) {
          console.error("Error processing event:", error);
          return event;
        }
      }
      
      return event;
    }));

    return res.status(200).json({
      matchEvents,
      processedEvents
    });
  } catch (error) {
    console.error("Error fetching match events:", error);
    return next(new AppError('Failed to fetch match events', 500));
  }
};

// Delete match event
export const deleteMatchEvent = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    // Find match event
    const matchEvent = await prisma.matchEvent.findUnique({
      where: { id },
      include: {
        fixture: {
          include: {
            tournament: {
              select: { adminId: true }
            }
          }
        }
      }
    });

    if (!matchEvent) {
      return res.status(404).json({ message: "Match event not found" });
    }

    // Verify user is the tournament admin
    if (matchEvent.fixture.tournament.adminId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to delete events from this fixture" });
    }

    // If it's a goal event, update fixture score and player stats
    if (matchEvent.type === 'GOAL' && matchEvent.playerId) {
      // Find player in lineup
      const playerLineup = await prisma.playerStats.findFirst({
        where: {
          playerId: matchEvent.playerId,
          lineup: {
            fixtureId: matchEvent.fixtureId
          }
        },
        include: {
          lineup: true
        }
      });

      if (playerLineup) {
        // Update player stats
        await prisma.playerStats.update({
          where: { id: playerLineup.id },
          data: {
            goals: { decrement: 1 }
          }
        });

        // Update leaderboard
        const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
          where: {
            tournamentId: matchEvent.fixture.tournamentId,
            playerId: matchEvent.playerId,
            teamId: playerLineup.lineup.teamId
          }
        });

        if (leaderboardEntry) {
          await prisma.leaderboardEntry.update({
            where: { id: leaderboardEntry.id },
            data: {
              goals: { decrement: 1 }
            }
          });
        }

        // Update fixture score
        if (playerLineup.lineup.teamId === matchEvent.fixture.homeTeamId) {
          await prisma.fixture.update({
            where: { id: matchEvent.fixtureId },
            data: {
              homeScore: { decrement: 1 }
            }
          });
        } else {
          await prisma.fixture.update({
            where: { id: matchEvent.fixtureId },
            data: {
              awayScore: { decrement: 1 }
            }
          });
        }
      }
    }

    // Delete match event
    await prisma.matchEvent.delete({
      where: { id }
    });

    return res.status(200).json({ message: "Match event deleted successfully" });
  } catch (error) {
    console.error("Error deleting match event:", error);
    return next(new AppError('Failed to delete match event', 500));
  }
};

// ... existing code ...

// Reset all match events for a fixture
export const resetMatchEventsByFixture = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { fixtureId } = req.params;

    // Check if fixture exists
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
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
      return res.status(403).json({ message: "You don't have permission to reset events for this fixture" });
    }

    // Get all match events for the fixture
    const matchEvents = await prisma.matchEvent.findMany({
      where: { fixtureId },
      include: {
        player: true
      }
    });

    // Process each event to revert its effects
    for (const event of matchEvents) {
      if (event.type === 'GOAL' && event.playerId) {
        // Find player in lineup
        const playerLineup = await prisma.playerStats.findFirst({
          where: {
            playerId: event.playerId,
            lineup: {
              fixtureId
            }
          },
          include: {
            lineup: true
          }
        });

        if (playerLineup) {
          // Update player stats
          await prisma.playerStats.update({
            where: { id: playerLineup.id },
            data: {
              goals: { decrement: 1 }
            }
          });

          // Update leaderboard
          const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
            where: {
              tournamentId: fixture.tournamentId,
              playerId: event.playerId,
              teamId: playerLineup.lineup.teamId
            }
          });

          if (leaderboardEntry && leaderboardEntry.goals > 0) {
            await prisma.leaderboardEntry.update({
              where: { id: leaderboardEntry.id },
              data: {
                goals: { decrement: 1 }
              }
            });
          }
        }
      } else if (event.type === 'ASSIST' && event.playerId) {
        const playerLineup = await prisma.playerStats.findFirst({
          where: {
            playerId: event.playerId,
            lineup: { fixtureId }
          },
          include: { lineup: true }
        });

        if (playerLineup) {
          // Update player stats
          await prisma.playerStats.update({
            where: { id: playerLineup.id },
            data: {
              assists: { decrement: 1 }
            }
          });

          // Update leaderboard
          const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
            where: {
              tournamentId: fixture.tournamentId,
              playerId: event.playerId,
              teamId: playerLineup.lineup.teamId
            }
          });

          if (leaderboardEntry && leaderboardEntry.assists > 0) {
            await prisma.leaderboardEntry.update({
              where: { id: leaderboardEntry.id },
              data: {
                assists: { decrement: 1 }
              }
            });
          }
        }
      } else if (event.type === 'SAVE' && event.playerId) {
        const playerLineup = await prisma.playerStats.findFirst({
          where: {
            playerId: event.playerId,
            lineup: { fixtureId }
          },
          include: { lineup: true }
        });

        if (playerLineup) {
          // Update leaderboard
          const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
            where: {
              tournamentId: fixture.tournamentId,
              playerId: event.playerId,
              teamId: playerLineup.lineup.teamId
            }
          });

          if (leaderboardEntry && leaderboardEntry.saves > 0) {
            await prisma.leaderboardEntry.update({
              where: { id: leaderboardEntry.id },
              data: {
                saves: { decrement: 1 }
              }
            });
          }
        }
      } else if (event.type === 'YELLOW_CARD' && event.playerId) {
        const playerLineup = await prisma.playerStats.findFirst({
          where: {
            playerId: event.playerId,
            lineup: { fixtureId }
          },
          include: { lineup: true }
        });

        if (playerLineup) {
          // Update player stats
          await prisma.playerStats.update({
            where: { id: playerLineup.id },
            data: {
              yellowCards: { decrement: 1 }
            }
          });

          // Update leaderboard
          const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
            where: {
              tournamentId: fixture.tournamentId,
              playerId: event.playerId,
              teamId: playerLineup.lineup.teamId
            }
          });

          if (leaderboardEntry && leaderboardEntry.yellowCards > 0) {
            await prisma.leaderboardEntry.update({
              where: { id: leaderboardEntry.id },
              data: {
                yellowCards: { decrement: 1 }
              }
            });
          }
        }
      } else if (event.type === 'RED_CARD' && event.playerId) {
        const playerLineup = await prisma.playerStats.findFirst({
          where: {
            playerId: event.playerId,
            lineup: { fixtureId }
          },
          include: { lineup: true }
        });

        if (playerLineup) {
          // Update player stats
          await prisma.playerStats.update({
            where: { id: playerLineup.id },
            data: {
              redCards: { decrement: 1 }
            }
          });

          // Update leaderboard
          const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
            where: {
              tournamentId: fixture.tournamentId,
              playerId: event.playerId,
              teamId: playerLineup.lineup.teamId
            }
          });

          if (leaderboardEntry && leaderboardEntry.redCards > 0) {
            await prisma.leaderboardEntry.update({
              where: { id: leaderboardEntry.id },
              data: {
                redCards: { decrement: 1 }
              }
            });
          }
        }
      } else if (event.type === 'CORNER' && event.playerId) {
        const playerLineup = await prisma.playerStats.findFirst({
          where: {
            playerId: event.playerId,
            lineup: { fixtureId }
          },
          include: { lineup: true }
        });

        if (playerLineup) {
          // Update leaderboard
          const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
            where: {
              tournamentId: fixture.tournamentId,
              playerId: event.playerId,
              teamId: playerLineup.lineup.teamId
            }
          });

          if (leaderboardEntry && leaderboardEntry.corners > 0) {
            await prisma.leaderboardEntry.update({
              where: { id: leaderboardEntry.id },
              data: {
                corners: { decrement: 1 }
              }
            });
          }
        }
      } else if (event.type === 'FOUL' && event.playerId) {
        const playerLineup = await prisma.playerStats.findFirst({
          where: {
            playerId: event.playerId,
            lineup: { fixtureId }
          },
          include: { lineup: true }
        });

        if (playerLineup) {
          // Update leaderboard
          const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
            where: {
              tournamentId: fixture.tournamentId,
              playerId: event.playerId,
              teamId: playerLineup.lineup.teamId
            }
          });

          if (leaderboardEntry && leaderboardEntry.fouls > 0) {
            await prisma.leaderboardEntry.update({
              where: { id: leaderboardEntry.id },
              data: {
                fouls: { decrement: 1 }
              }
            });
          }
        }
      } else if (event.type === 'PENALTY' && event.playerId) {
        const playerLineup = await prisma.playerStats.findFirst({
          where: {
            playerId: event.playerId,
            lineup: { fixtureId }
          },
          include: { lineup: true }
        });

        if (playerLineup) {
          // Update leaderboard
          const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
            where: {
              tournamentId: fixture.tournamentId,
              playerId: event.playerId,
              teamId: playerLineup.lineup.teamId
            }
          });

          if (leaderboardEntry && leaderboardEntry.penaltys > 0) {
            await prisma.leaderboardEntry.update({
              where: { id: leaderboardEntry.id },
              data: {
                penaltys: { decrement: 1 }
              }
            });
          }
        }
      }
    }

    // Reset fixture scores
    await prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        homeScore: 0,
        awayScore: 0
      }
    });

    // Delete all match events for the fixture
    await prisma.matchEvent.deleteMany({
      where: { fixtureId }
    });

    return res.status(200).json({ 
      message: "All match events have been reset for this fixture",
      count: matchEvents.length
    });
  } catch (error) {
    console.error("Error resetting match events:", error);
    return next(new AppError('Failed to reset match events', 500));
  }
};