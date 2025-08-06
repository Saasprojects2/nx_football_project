import { Request, Response, NextFunction } from "express";
import { prisma } from "../../prismaClient";
import AppError from "../../utils/AppError";

// Get tournament leaderboard
export const getTournamentLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tournamentId } = req.params;

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Get leaderboard entries
    const leaderboard = await prisma.leaderboardEntry.findMany({
      where: {
        tournamentId,
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            image: true,
            primaryPosition: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: {
        goals: "desc",
      },
    });

    // Fetch player tournament stats for players in this tournament
    const playerTournamentStats = await prisma.playerTournamentStats.findMany({
      where: {
        tournamentId: tournamentId,
      },
      select: {
        playerId: true,
        matchesPlayed: true,
      },
    });

    const playerMatchesMap = new Map();
    playerTournamentStats.forEach((stats: any) => {
      playerMatchesMap.set(stats.playerId, stats.matchesPlayed);
    });

    // Map leaderboard entries to include matchesPlayed
    const formattedLeaderboard = leaderboard.map((entry: any) => ({
      ...entry,
      matchesPlayed: playerMatchesMap.get(entry.playerId) || 0,
    }));

    return res.status(200).json(formattedLeaderboard);
  } catch (error) {
    console.error("Error fetching tournament leaderboard:", error);
    return next(new AppError("Failed to fetch tournament leaderboard", 500));
  }
};

// Get top scorers across all tournaments
export const getTopScorers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allEntries = await prisma.leaderboardEntry.findMany({
      include: {
        player: {
          select: {
            id: true,
            name: true,
            image: true,
            primaryPosition: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        tournament: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    // Fetch player tournament stats separately to get matches played
    const playerTournamentStats = await prisma.playerTournamentStats.findMany({
      select: {
        playerId: true,
        matchesPlayed: true,
      },
    });

    const playerMatchesMap = new Map();
    playerTournamentStats.forEach((stats: any) => {
      playerMatchesMap.set(
        stats.playerId,
        (playerMatchesMap.get(stats.playerId) || 0) + stats.matchesPlayed
      );
    });

    // Group entries by player and aggregate stats
    const playerStatsMap = new Map();

    allEntries.forEach((entry: any) => {
      if (!playerStatsMap.has(entry.playerId)) {
        playerStatsMap.set(entry.playerId, {
          playerId: entry.playerId,
          player: entry.player,
          totalGoals: 0,
          totalAssists: 0,
          totalSaves: 0,
          totalCleanSheets: 0,
          totalMatches: 0, // Initialize totalMatches
          tournaments: new Set(),
          teams: new Map(),
          // Store the most recent team and tournament for display
          latestTeam: entry.team,
          latestTournament: entry.tournament,
        });
      }

      const playerStats = playerStatsMap.get(entry.playerId);
      playerStats.totalGoals += entry.goals || 0;
      playerStats.totalAssists += entry.assists || 0;
      playerStats.totalSaves += entry.saves || 0;
      playerStats.totalCleanSheets += entry.cleanSheets || 0;
      playerStats.totalMatches = playerMatchesMap.get(entry.playerId) || 0; // Assign totalMatches from the map
      playerStats.tournaments.add(entry.tournamentId);

      // Track teams the player has played for
      if (!playerStats.teams.has(entry.teamId)) {
        playerStats.teams.set(entry.teamId, entry.team);
      }

      // Update latest team and tournament if this entry is more recent
      if (
        !playerStats.latestEntryDate ||
        new Date(entry.updatedAt) > playerStats.latestEntryDate
      ) {
        playerStats.latestEntryDate = new Date(entry.updatedAt);
        playerStats.latestTeam = entry.team;
        playerStats.latestTournament = entry.tournament;
      }
    });

    // Convert map to array and sort by total goals
    const aggregatedStats = Array.from(playerStatsMap.values())
      .map((stats) => ({
        playerId: stats.playerId,
        player: stats.player,
        goals: stats.totalGoals,
        assists: stats.totalAssists,
        saves: stats.totalSaves,
        cleanSheets: stats.totalCleanSheets,
        matches: stats.totalMatches,
        tournamentCount: stats.tournaments.size,
        team: stats.latestTeam, // Use the most recent team
        tournament: stats.latestTournament, // Use the most recent tournament
        teamsPlayed: Array.from(stats.teams.values()),
      }))
      .filter((stats) => stats.goals > 0) // Only include players with at least 1 goal
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10); // Take top 10

    return res.status(200).json(aggregatedStats);
  } catch (error) {
    console.error("Error fetching top scorers:", error);
    return next(new AppError("Failed to fetch top scorers", 500));
  }
};

// Get top assisters across all tournaments
export const getTopAssists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allEntries = await prisma.leaderboardEntry.findMany({
      include: {
        player: {
          select: {
            id: true,
            name: true,
            image: true,
            primaryPosition: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        tournament: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    // Fetch player tournament stats separately to get matches played
    const playerTournamentStats = await prisma.playerTournamentStats.findMany({
      select: {
        playerId: true,
        matchesPlayed: true,
      },
    });

    const playerMatchesMap = new Map();
    playerTournamentStats.forEach((stats: any) => {
      playerMatchesMap.set(
        stats.playerId,
        (playerMatchesMap.get(stats.playerId) || 0) + stats.matchesPlayed
      );
    });

    // Group entries by player and aggregate stats
    const playerStatsMap = new Map();

    allEntries.forEach((entry: any) => {
      if (!playerStatsMap.has(entry.playerId)) {
        playerStatsMap.set(entry.playerId, {
          playerId: entry.playerId,
          player: entry.player,
          totalGoals: 0,
          totalAssists: 0,
          totalSaves: 0,
          totalCleanSheets: 0,
          totalMatches: 0, // Initialize totalMatches
          tournaments: new Set(),
          teams: new Map(),
          // Store the most recent team and tournament for display
          latestTeam: entry.team,
          latestTournament: entry.tournament,
        });
      }

      const playerStats = playerStatsMap.get(entry.playerId);
      playerStats.totalGoals += entry.goals || 0;
      playerStats.totalAssists += entry.assists || 0;
      playerStats.totalSaves += entry.saves || 0;
      playerStats.totalCleanSheets += entry.cleanSheets || 0;
      playerStats.totalMatches = playerMatchesMap.get(entry.playerId) || 0; // Assign totalMatches from the map
      playerStats.tournaments.add(entry.tournamentId);

      // Track teams the player has played for
      if (!playerStats.teams.has(entry.teamId)) {
        playerStats.teams.set(entry.teamId, entry.team);
      }

      // Update latest team and tournament if this entry is more recent
      if (
        !playerStats.latestEntryDate ||
        new Date(entry.updatedAt) > playerStats.latestEntryDate
      ) {
        playerStats.latestEntryDate = new Date(entry.updatedAt);
        playerStats.latestTeam = entry.team;
        playerStats.latestTournament = entry.tournament;
      }
    });

    // Convert map to array and sort by total assists
    const aggregatedStats = Array.from(playerStatsMap.values())
      .map((stats) => ({
        playerId: stats.playerId,
        player: stats.player,
        goals: stats.totalGoals,
        assists: stats.totalAssists,
        saves: stats.totalSaves,
        cleanSheets: stats.totalCleanSheets,
        matches: stats.totalMatches,
        tournamentCount: stats.tournaments.size,
        team: stats.latestTeam, // Use the most recent team
        tournament: stats.latestTournament, // Use the most recent tournament
        teamsPlayed: Array.from(stats.teams.values()),
      }))
      .filter((stats) => stats.assists > 0) // Only include players with at least 1 assist
      .sort((a, b) => b.assists - a.assists)
      .slice(0, 10); // Take top 10

    return res.status(200).json(aggregatedStats);
  } catch (error) {
    console.error("Error fetching top assisters:", error);
    return next(new AppError("Failed to fetch top assisters", 500));
  }
};

// Get top saves across all tournaments
export const getTopSave = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allEntries = await prisma.leaderboardEntry.findMany({
      include: {
        player: {
          select: {
            id: true,
            name: true,
            image: true,
            primaryPosition: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        tournament: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    // Fetch player tournament stats separately to get matches played
    const playerTournamentStats = await prisma.playerTournamentStats.findMany({
      select: {
        playerId: true,
        matchesPlayed: true,
      },
    });

    const playerMatchesMap = new Map();
    playerTournamentStats.forEach((stats: any) => {
      playerMatchesMap.set(
        stats.playerId,
        (playerMatchesMap.get(stats.playerId) || 0) + stats.matchesPlayed
      );
    });

    // Group entries by player and aggregate stats
    const playerStatsMap = new Map();

    allEntries.forEach((entry: any) => {
      if (!playerStatsMap.has(entry.playerId)) {
        playerStatsMap.set(entry.playerId, {
          playerId: entry.playerId,
          player: entry.player,
          totalGoals: 0,
          totalAssists: 0,
          totalSaves: 0,
          totalCleanSheets: 0,
          totalMatches: 0, // Initialize totalMatches
          tournaments: new Set(),
          teams: new Map(),
          // Store the most recent team and tournament for display
          latestTeam: entry.team,
          latestTournament: entry.tournament,
        });
      }

      const playerStats = playerStatsMap.get(entry.playerId);
      playerStats.totalGoals += entry.goals || 0;
      playerStats.totalAssists += entry.assists || 0;
      playerStats.totalSaves += entry.saves || 0;
      playerStats.totalCleanSheets += entry.cleanSheets || 0;
      playerStats.totalMatches = playerMatchesMap.get(entry.playerId) || 0; // Assign totalMatches from the map
      playerStats.tournaments.add(entry.tournamentId);

      // Track teams the player has played for
      if (!playerStats.teams.has(entry.teamId)) {
        playerStats.teams.set(entry.teamId, entry.team);
      }

      // Update latest team and tournament if this entry is more recent
      if (
        !playerStats.latestEntryDate ||
        new Date(entry.updatedAt) > playerStats.latestEntryDate
      ) {
        playerStats.latestEntryDate = new Date(entry.updatedAt);
        playerStats.latestTeam = entry.team;
        playerStats.latestTournament = entry.tournament;
      }
    });

    // Convert map to array and sort by total saves
    const aggregatedStats = Array.from(playerStatsMap.values())
      .map((stats) => ({
        playerId: stats.playerId,
        player: stats.player,
        goals: stats.totalGoals,
        assists: stats.totalAssists,
        saves: stats.totalSaves,
        cleanSheets: stats.totalCleanSheets,
        matches: stats.totalMatches,
        tournamentCount: stats.tournaments.size,
        team: stats.latestTeam, // Use the most recent team
        tournament: stats.latestTournament, // Use the most recent tournament
        teamsPlayed: Array.from(stats.teams.values()),
      }))
      .filter((stats) => stats.saves > 0) // Only include players with at least 1 save
      .sort((a, b) => b.saves - a.saves)
      .slice(0, 10); // Take top 10

    return res.status(200).json(aggregatedStats);
  } catch (error) {
    console.error("Error fetching top goalkeepers:", error);
    return next(new AppError("Failed to fetch top goalkeepers", 500));
  }
};

// Get player tournament stats
export const getPlayerTournamentStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { playerId, tournamentId } = req.params;

    const stats = await prisma.leaderboardEntry.findFirst({
      where: {
        playerId,
        tournamentId,
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            image: true,
            primaryPosition: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        tournament: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!stats) {
      return res
        .status(404)
        .json({ message: "Player stats not found for this tournament" });
    }

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching player tournament stats:", error);
    return next(new AppError("Failed to fetch player tournament stats", 500));
  }
};

// Get player stats across all tournaments
export const getPlayerAllStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { playerId } = req.params;

    const stats = await prisma.leaderboardEntry.findMany({
      where: {
        playerId,
      },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    // Calculate total stats
    const totalStats = {
      goals: stats.reduce((sum: any, entry: any) => sum + entry.goals, 0),
      saves: stats.reduce((sum: any, entry: any) => sum + entry.saves, 0),
      tournaments: stats.length,
    };

    return res.status(200).json({
      tournamentStats: stats,
      totalStats,
    });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return next(new AppError("Failed to fetch player stats", 500));
  }
};

// Get golden boot leaderboard (top goal scorers)
export const getGoldenBootLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tournamentId } = req.params;

    const leaderboard = await prisma.leaderboardEntry.findMany({
      where: {
        tournamentId,
        goals: {
          gt: 0,
        },
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: [{ goals: "desc" }, { assists: "desc" }],
      take: 10,
    });

    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching golden boot leaderboard:", error);
    return next(new AppError("Failed to fetch golden boot leaderboard", 500));
  }
};

// Get assists leaderboard
export const getAssistsLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tournamentId } = req.params;

    const leaderboard = await prisma.leaderboardEntry.findMany({
      where: {
        tournamentId,
        assists: {
          gt: 0,
        },
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: {
        assists: "desc",
      },
      take: 10,
    });

    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching assists leaderboard:", error);
    return next(new AppError("Failed to fetch assists leaderboard", 500));
  }
};

// Get golden glove leaderboard (clean sheets)
export const getGoldenGloveLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tournamentId } = req.params;

    const leaderboard = await prisma.leaderboardEntry.findMany({
      where: {
        tournamentId,
        cleanSheets: {
          gt: 0,
        },
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            image: true,
            primaryPosition: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: {
        cleanSheets: "desc",
      },
      take: 10,
    });

    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching golden glove leaderboard:", error);
    return next(new AppError("Failed to fetch golden glove leaderboard", 500));
  }
};

// Get all tournament awards (Golden Boot, Assists, Golden Glove)
export const getTournamentAwards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tournamentId } = req.params;

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const goldenBootPromise = prisma.leaderboardEntry.findMany({
      where: {
        tournamentId,
        goals: { gt: 0 },
      },
      include: {
        player: {
          select: { id: true, name: true, image: true },
        },
        team: {
          select: { id: true, name: true, logo: true },
        },
      },
      orderBy: [{ goals: "desc" }, { assists: "desc" }],
      take: 10,
    });

    const assistsLeaderboardPromise = prisma.leaderboardEntry.findMany({
      where: {
        tournamentId,
        assists: { gt: 0 },
      },
      include: {
        player: {
          select: { id: true, name: true, image: true },
        },
        team: {
          select: { id: true, name: true, logo: true },
        },
      },
      orderBy: [{ assists: "desc" }, { goals: "desc" }],
      take: 10,
    });

    const goldenGloveLeaderboardPromise = prisma.leaderboardEntry.findMany({
      where: {
        tournamentId,
      },
      include: {
        player: {
          select: { id: true, name: true, image: true, primaryPosition: true },
        },
        team: {
          select: { id: true, name: true, logo: true },
        },
      },
      orderBy: [{ cleanSheets: "desc" }, { saves: "desc" }],
      take: 10,
    });

    const playerTournamentStatsPromise = prisma.playerTournamentStats.findMany({
      where: {
        tournamentId: tournamentId,
      },
      select: {
        playerId: true,
        matchesPlayed: true,
      },
    });

    const [goldenBoot, assistsLeaderboard, goldenGlove, playerTournamentStats] =
      await Promise.all([
        goldenBootPromise,
        assistsLeaderboardPromise,
        goldenGloveLeaderboardPromise,
        playerTournamentStatsPromise,
      ]);

    const playerMatchesMap = new Map();
    playerTournamentStats.forEach((stats: any) => {
      playerMatchesMap.set(stats.playerId, stats.matchesPlayed);
    });

    const formatLeaderboard = (leaderboard: any[]) => {
      return leaderboard.map((entry: any) => ({
        ...entry,
        matchesPlayed: playerMatchesMap.get(entry.playerId) || 0,
      }));
    };

    return res.status(200).json({
      goldenBoot: formatLeaderboard(goldenBoot),
      assistsLeaderboard: formatLeaderboard(assistsLeaderboard),
      goldenGlove: formatLeaderboard(goldenGlove),
    });
  } catch (error) {
    console.error("Error fetching tournament awards:", error);
    return next(new AppError("Failed to fetch tournament awards", 500));
  }
};

// Get tournament standings (points table)
export const getTournamentStandings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tournamentId } = req.params;

    const standings = await prisma.tournamentStanding.findMany({
      where: {
        tournamentId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: [
        { points: "desc" },
        { goalDifference: "desc" },
        { goalsFor: "desc" },
      ],
    });

    return res.status(200).json(standings);
  } catch (error) {
    console.error("Error fetching tournament standings:", error);
    return next(new AppError("Failed to fetch tournament standings", 500));
  }
};

// Update tournament standings after a fixture is completed
export const updateTournamentStandings = async (fixtureId: string) => {
  try {
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        tournament: true,
        homeTeam: true,
        awayTeam: true,
        lineups: {
          include: {
            players: {
              select: {
                playerId: true,
                isStarting: true, // To consider only starting players if needed
              },
            },
          },
        },
      },
    });

    if (
      !fixture ||
      fixture.status !== "FULL_TIME" ||
      fixture.homeScore === null ||
      fixture.awayScore === null
    ) {
      return;
    }

    const tournamentId = fixture.tournamentId;
    const homeTeamId = fixture.homeTeamId;
    const awayTeamId = fixture.awayTeamId;
    const homeScore = fixture.homeScore;
    const awayScore = fixture.awayScore;

    // Check if match ended in a draw and went to penalties
    const isDraw = homeScore === awayScore;
    let homePenaltyWin = false;
    let awayPenaltyWin = false;

    if (
      isDraw &&
      fixture.homepenaltyScore !== undefined &&
      fixture.awaypenaltyScore !== undefined
    ) {
      homePenaltyWin = fixture.homepenaltyScore > fixture.awaypenaltyScore;
      awayPenaltyWin = fixture.homepenaltyScore < fixture.awaypenaltyScore;
      console.log(
        `Match ended in a draw. Penalties: Home ${fixture.homepenaltyScore}-${fixture.awaypenaltyScore} Away. Home win: ${homePenaltyWin}, Away win: ${awayPenaltyWin}`
      );
    }

    // Update home team standings
    await updateTeamStanding(
      tournamentId,
      homeTeamId,
      homeScore,
      awayScore,
      homePenaltyWin,
      awayPenaltyWin
    );

    // Update away team standings
    await updateTeamStanding(
      tournamentId,
      awayTeamId,
      awayScore,
      homeScore,
      awayPenaltyWin,
      homePenaltyWin
    );

    // Update matches played for all players in the fixture
    const playerIdsInFixture = new Set<string>();
    for (const lineup of fixture.lineups) {
      for (const playerStats of lineup.players) {
        playerIdsInFixture.add(playerStats.playerId);
      }
    }

    for (const playerId of playerIdsInFixture) {
      console.log(
        `Attempting to update stats for player: ${playerId} in tournament: ${fixture.tournamentId}`
      );
      try {
        const upsertResult = await prisma.playerTournamentStats.upsert({
          where: {
            playerId_tournamentId: {
              playerId: playerId,
              tournamentId: fixture.tournamentId,
            },
          },
          update: {
            matchesPlayed: { increment: 1 },
          },
          create: {
            playerId: playerId,
            tournamentId: fixture.tournamentId,
            matchesPlayed: 1,
          },
        });
        console.log(`Upsert successful for player ${playerId}:`, upsertResult);
      } catch (upsertError) {
        console.error(
          `Error during upsert for player ${playerId}:`,
          upsertError
        );
      }
    }

    console.log(
      "Tournament standings and player match stats updated, including penalty shootout results if applicable"
    );
  } catch (error) {
    console.error("Error updating tournament standings:", error);
  }
};

// Helper function to update a team's standing
async function updateTeamStanding(
  tournamentId: string,
  teamId: string,
  goalsFor: number,
  goalsAgainst: number,
  isPenaltyWinner: boolean = false,
  isPenaltyLoser: boolean = false
) {
  const standing = await prisma.tournamentStanding.findUnique({
    where: {
      tournamentId_teamId: {
        tournamentId,
        teamId,
      },
    },
  });

  // Determine match outcome
  let won = goalsFor > goalsAgainst ? 1 : 0;
  let drawn = goalsFor === goalsAgainst ? 1 : 0;
  let lost = goalsFor < goalsAgainst ? 1 : 0;

  // Handle penalty shootout results
  if (isPenaltyWinner) {
    won = 1;
    drawn = 0;
  } else if (isPenaltyLoser) {
    lost = 1;
    drawn = 0;
  }

  const points = won * 3 + drawn * 1;
  const goalDifference = goalsFor - goalsAgainst;

  if (standing) {
    await prisma.tournamentStanding.update({
      where: {
        id: standing.id,
      },
      data: {
        played: { increment: 1 },
        won: { increment: won },
        drawn: { increment: drawn },
        lost: { increment: lost },
        goalsFor: { increment: goalsFor },
        goalsAgainst: { increment: goalsAgainst },
        goalDifference: { increment: goalDifference },
        points: { increment: points },
      },
    });
  } else {
    await prisma.tournamentStanding.create({
      data: {
        tournament: { connect: { id: tournamentId } },
        team: { connect: { id: teamId } },
        played: 1,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
      },
    });
  }
}

// Update clean sheet for goalkeeper
export const updateCleanSheet = async (fixtureId: string, teamId: string) => {
  try {
    console.log(
      `Starting clean sheet update for fixture: ${fixtureId}, team: ${teamId}`
    );

    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        lineups: {
          include: {
            players: {
              include: {
                player: true,
              },
            },
          },
        },
      },
    });

    if (!fixture || fixture.status !== "FULL_TIME") {
      console.log("Fixture not found or not FULL_TIME");
      return;
    }

    // Check if the team kept a clean sheet
    const isHomeTeam = fixture.homeTeamId === teamId;
    const concededGoals = isHomeTeam ? fixture.awayScore : fixture.homeScore;

    console.log(
      `Team is ${isHomeTeam ? "home" : "away"} team, conceded goals: ${concededGoals}`
    );

    if (concededGoals === 0) {
      // Find the lineup for this team
      const teamLineup = fixture.lineups.find((l: any) => l.teamId === teamId);
      if (!teamLineup) {
        console.log(`No lineup found for team: ${teamId}`);
        return;
      }

      // Log all players in the lineup to debug
      console.log(
        "Players in lineup:",
        teamLineup.players.map((p: any) => ({
          name: p.player.name,
          position: p.player.primaryPosition,
          isStarting: p.isStarting,
        }))
      );

      // Find the goalkeeper in the lineup - more flexible approach
      let goalkeeper = teamLineup.players.find(
        (p: any) => p.player.primaryPosition === "GOALKEEPER" && p.isStarting
      );

      // If no starting goalkeeper found, try to find any goalkeeper
      if (!goalkeeper) {
        console.log("No starting goalkeeper found, looking for any goalkeeper");
        goalkeeper = teamLineup.players.find(
          (p: any) => p.player.primaryPosition === "GOALKEEPER"
        );
      }

      // If still no goalkeeper, use the first player as a fallback
      if (!goalkeeper && teamLineup.players.length > 0) {
        console.log(
          "No goalkeeper found at all, using first player as fallback"
        );
        goalkeeper = teamLineup.players[0];
      }

      if (!goalkeeper) {
        console.log("No players found in lineup");
        return;
      }

      console.log(
        `Using player for clean sheet: ${goalkeeper.player.name}, ID: ${goalkeeper.playerId}, Position: ${goalkeeper.player.primaryPosition}`
      );

      // Update the player's clean sheet count
      const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
        where: {
          tournamentId: fixture.tournamentId,
          playerId: goalkeeper.playerId,
          teamId,
        },
      });

      if (leaderboardEntry) {
        await prisma.leaderboardEntry.update({
          where: { id: leaderboardEntry.id },
          data: {
            cleanSheets: { increment: 1 },
          },
        });
        console.log(
          `Updated existing leaderboard entry, ID: ${leaderboardEntry.id}`
        );
      } else {
        const newEntry = await prisma.leaderboardEntry.create({
          data: {
            tournament: { connect: { id: fixture.tournamentId } },
            player: { connect: { id: goalkeeper.playerId } },
            team: { connect: { id: teamId } },
            cleanSheets: 1,
          },
        });
        console.log(`Created new leaderboard entry, ID: ${newEntry.id}`);
      }

      console.log("Clean sheet successfully recorded");
    } else {
      console.log(`Team conceded ${concededGoals} goals, no clean sheet`);
    }
  } catch (error) {
    console.error("Error updating clean sheet:", error);
  }
};

// Update leaderboard entry by tournamentId and teamId
export const updateLeaderboardEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tournamentId, teamId } = req.params;
    const allowedFields = [
      "played",
      "won",
      "drawn",
      "lost",
      "goalsFor",
      "goalsAgainst",
      "goalDifference",
      "points",
    ];
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }
    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided to update." });
    }
    // Find the leaderboard entry
    const entry = await prisma.tournamentStanding.findFirst({
      where: {
        tournamentId,
        teamId,
      },
    });
    if (!entry) {
      return res.status(404).json({
        message: "Tournament standing not found for this tournament and team.",
      });
    }
    // Update the entry with provided fields
    const updatedEntry = await prisma.tournamentStanding.update({
      where: { id: entry.id },
      data: updateData,
    });
    return res.status(200).json(updatedEntry);
  } catch (error) {
    console.error("Error updating tournament standing:", error);
    return next(new AppError("Failed to update tournament standing", 500));
  }
};
