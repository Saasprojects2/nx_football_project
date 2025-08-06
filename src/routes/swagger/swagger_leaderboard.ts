/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: leaderboard end points
 */

//Get the leaderboard for a specific tournament
/**
 * @swagger
 * /api/leaderboard/tournament/{tournamentId}:
 *   get:
 *     summary: Get the leaderboard for a specific tournament
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         description: ID of the tournament
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leaderboard entries for the specified tournament, ordered by goals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   player:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       image:
 *                         type: string
 *                       primaryPosition:
 *                         type: string
 *                   team:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       logo:
 *                         type: string
 *                   goals:
 *                     type: integer
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */

// top scores

/**
 * @swagger
 * /api/leaderboard/top-scorers:
 *   get:
 *     summary: Get the top scorers across all tournaments
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: List of top scorers across all tournaments, ordered by goals scored
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   player:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       image:
 *                         type: string
 *                       primaryPosition:
 *                         type: string
 *                   team:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       logo:
 *                         type: string
 *                   tournament:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       logo:
 *                         type: string
 *                   goals:
 *                     type: integer
 *       500:
 *         description: Internal server error
 */

//

/**
 * @swagger
 * /api/leaderboard/player/{playerId}/tournament/{tournamentId}:
 *   get:
 *     summary: Get the player stats for a specific tournament
 *     tags: [Leaderboard]
 *     parameters:
 *       - name: playerId
 *         in: path
 *         description: ID of the player
 *         required: true
 *         schema:
 *           type: string
 *       - name: tournamentId
 *         in: path
 *         description: ID of the tournament
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Player stats for the specific tournament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 player:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     image:
 *                       type: string
 *                     primaryPosition:
 *                       type: string
 *                 team:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     logo:
 *                       type: string
 *                 tournament:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     logo:
 *                       type: string
 *                 goals:
 *                   type: integer
 *                   description: Total goals scored by the player in the tournament
 *       404:
 *         description: Player stats not found for this tournament
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/leaderboard/player/{playerId}:
 *   get:
 *     summary: Get player stats across all tournaments
 *     tags: [Leaderboard]
 *     parameters:
 *       - name: playerId
 *         in: path
 *         required: true
 *         description: ID of the player
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stats for the player across all tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tournamentStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tournament:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           logo:
 *                             type: string
 *                       team:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           logo:
 *                             type: string
 *                       goals:
 *                         type: integer
 *                       saves:
 *                         type: integer
 *                 totalStats:
 *                   type: object
 *                   properties:
 *                     goals:
 *                       type: integer
 *                     saves:
 *                       type: integer
 *                     tournaments:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */


// Get Golden Boot leaderboard for a tournament
/**
 * @swagger
 * /api/leaderboard/golden-boot/{tournamentId}:
 *   get:
 *     summary: Get Golden Boot leaderboard for a tournament
 *     description: Returns a list of players with the most goals in a tournament (Golden Boot standings).
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tournament
 *         example: 965272c8-7ba2-42a8-9347-5f2b01cae7ee
 *     responses:
 *       200:
 *         description: List of top goal scorers in the tournament
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   playerId:
 *                     type: string
 *                     example: cm9vc2xyf0000gq2hvn9e3tdu
 *                   name:
 *                     type: string
 *                     example: Lionel Messi
 *                   team:
 *                     type: string
 *                     example: PSG
 *                   goals:
 *                     type: number
 *                     example: 8
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Server error while fetching leaderboard
 */


// Get Golden Glove leaderboard for a tournament
/**
 * @swagger
 * /api/leaderboard/assists/{tournamentId}:
 *   get:
 *     summary: Get top assist providers in a tournament
 *     description: Returns a list of players with the most assists in the specified tournament.
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tournament
 *         example: 965272c8-7ba2-42a8-9347-5f2b01cae7ee
 *     responses:
 *       200:
 *         description: List of top assist providers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   playerId:
 *                     type: string
 *                     example: cm9vc2xyf0000gq2hvn9e3tdu
 *                   name:
 *                     type: string
 *                     example: Kevin De Bruyne
 *                   team:
 *                     type: string
 *                     example: Manchester City
 *                   assists:
 *                     type: number
 *                     example: 10
 *       401:
 *         description: Unauthorized - Invalid or missing access token
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Server error while fetching assist leaderboard
 */


// Get Golden Glove leaderboard for a tournament
/**
 * @swagger
 * /api/leaderboard/golden-glove/{tournamentId}:
 *   get:
 *     summary: Get top goalkeepers with most clean sheets
 *     description: Returns a list of goalkeepers with the most clean sheets in the specified tournament.
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tournament
 *         example: 965272c8-7ba2-42a8-9347-5f2b01cae7ee
 *     responses:
 *       200:
 *         description: List of top goalkeepers with clean sheets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   playerId:
 *                     type: string
 *                     example: cm9vc2xyf0000gq2hvn9e3tdu
 *                   name:
 *                     type: string
 *                     example: Alisson Becker
 *                   team:
 *                     type: string
 *                     example: Liverpool FC
 *                   cleanSheets:
 *                     type: number
 *                     example: 8
 *       401:
 *         description: Unauthorized - Invalid or missing access token
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Server error while fetching golden glove leaderboard
 */


// Get tournament standings
/**
 * @swagger
 * /api/leaderboard/standings/{tournamentId}:
 *   get:
 *     summary: Get tournament standings
 *     description: Retrieves the current standings for all teams in the specified tournament.
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tournament
 *         example: 965272c8-7ba2-42a8-9347-5f2b01cae7ee
 *     responses:
 *       200:
 *         description: Current standings of teams in the tournament
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   teamId:
 *                     type: string
 *                     example: cm9vc2xyf0000gq2hvn9e3tdu
 *                   teamName:
 *                     type: string
 *                     example: Arsenal FC
 *                   matchesPlayed:
 *                     type: integer
 *                     example: 10
 *                   wins:
 *                     type: integer
 *                     example: 7
 *                   draws:
 *                     type: integer
 *                     example: 2
 *                   losses:
 *                     type: integer
 *                     example: 1
 *                   goalsFor:
 *                     type: integer
 *                     example: 20
 *                   goalsAgainst:
 *                     type: integer
 *                     example: 10
 *                   goalDifference:
 *                     type: integer
 *                     example: 10
 *                   points:
 *                     type: integer
 *                     example: 23
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */


//top assists
/**
 * @swagger
 * /api/leaderboard/top-assists:
 *   get:
 *     summary: Get top assisters
 *     description: Retrieves the top 10 players with the highest number of assists across tournaments.
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tournament (may be used for validation or scoping, even if not filtered here)
 *         example: 965272c8-7ba2-42a8-9347-5f2b01cae7ee
 *     responses:
 *       200:
 *         description: Top 10 assisters across all tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   playerId:
 *                     type: string
 *                     example: cm9vc2xyf0000gq2hvn9e3tdu
 *                   player:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: cm9vc2xyf0000gq2hvn9e3tdu
 *                       name:
 *                         type: string
 *                         example: Lionel Messi
 *                       image:
 *                         type: string
 *                         example: https://example.com/player.jpg
 *                       primaryPosition:
 *                         type: string
 *                         example: RW
 *                   goals:
 *                     type: integer
 *                     example: 8
 *                   assists:
 *                     type: integer
 *                     example: 10
 *                   saves:
 *                     type: integer
 *                     example: 0
 *                   cleanSheets:
 *                     type: integer
 *                     example: 0
 *                   tournamentCount:
 *                     type: integer
 *                     example: 2
 *                   team:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: team123
 *                       name:
 *                         type: string
 *                         example: FC Barcelona
 *                       logo:
 *                         type: string
 *                         example: https://example.com/team-logo.png
 *                   tournament:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: tour123
 *                       name:
 *                         type: string
 *                         example: Champions League
 *                       logo:
 *                         type: string
 *                         example: https://example.com/tournament-logo.png
 *                   teamsPlayed:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: team123
 *                         name:
 *                           type: string
 *                           example: FC Barcelona
 *                         logo:
 *                           type: string
 *                           example: https://example.com/logo.png
 *       500:
 *         description: Failed to fetch top assisters
 */


//get top saves
/**
 * @swagger
 * /api/leaderboard/top-save:
 *   get:
 *     summary: Get top goalkeepers by saves
 *     description: Retrieves the top 10 players with the highest number of saves across all tournaments.
 *     tags: [Leaderboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of top 10 players sorted by saves
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   playerId:
 *                     type: string
 *                     example: "player123"
 *                   player:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "player123"
 *                       name:
 *                         type: string
 *                         example: "Thibaut Courtois"
 *                       image:
 *                         type: string
 *                         example: "https://example.com/player-image.png"
 *                       primaryPosition:
 *                         type: string
 *                         example: "GK"
 *                   goals:
 *                     type: integer
 *                     example: 0
 *                   assists:
 *                     type: integer
 *                     example: 1
 *                   saves:
 *                     type: integer
 *                     example: 22
 *                   cleanSheets:
 *                     type: integer
 *                     example: 4
 *                   tournamentCount:
 *                     type: integer
 *                     example: 2
 *                   team:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "team456"
 *                       name:
 *                         type: string
 *                         example: "Real Madrid"
 *                       logo:
 *                         type: string
 *                         example: "https://example.com/logo.png"
 *                   tournament:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "tour789"
 *                       name:
 *                         type: string
 *                         example: "La Liga"
 *                       logo:
 *                         type: string
 *                         example: "https://example.com/tournament-logo.png"
 *                   teamsPlayed:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "team456"
 *                         name:
 *                           type: string
 *                           example: "Real Madrid"
 *                         logo:
 *                           type: string
 *                           example: "https://example.com/logo.png"
 *       500:
 *         description: Failed to fetch top goalkeepers
 */
