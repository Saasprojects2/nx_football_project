/**
 * @swagger
 * tags:
 *   name: lineup
 *   description: lineup end points
 */

//create lineup
/**
 * @swagger
 * /api/lineup/create:
 *   post:
 *     summary: Create or update lineup for a team in a fixture
 *     description: |
 *       Creates or updates the lineup for a team in a specific fixture.
 *       
 *       Each player object must include `position`, which must be one of:
 *       - `STRIKER`
 *       - `MIDFIELDER`
 *       - `DEFENDER`
 *       - `GOALKEEPER`
 *       
 *       Optionally, players can also specify `foot` preference, which must be one of:
 *       - `RIGHT`
 *       - `LEFT`
 *       - `BOTH`
 *     tags: [lineup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fixtureId
 *               - teamId
 *               - players
 *             properties:
 *               fixtureId:
 *                 type: string
 *                 description: ID of the fixture
 *               teamId:
 *                 type: string
 *                 description: ID of the team
 *               players:
 *                 type: array
 *                 description: Array of player lineup details
 *                 items:
 *                   type: object
 *                   required:
 *                     - playerId
 *                     - position
 *                   properties:
 *                     playerId:
 *                       type: string
 *                     position:
 *                       type: string
 *                       enum: [STRIKER, MIDFIELDER, DEFENDER, GOALKEEPER]
 *                     foot:
 *                       type: string
 *                       enum: [RIGHT, LEFT, BOTH]
 *     responses:
 *       200:
 *         description: Lineup updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 lineup:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fixtureId:
 *                       type: string
 *                     teamId:
 *                       type: string
 *                     players:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           playerId:
 *                             type: string
 *                           lineupId:
 *                             type: string
 *                           position:
 *                             type: string
 *                           foot:
 *                             type: string
 *                           isStarting:
 *                             type: boolean
 *                           minutesPlayed:
 *                             type: integer
 *                           goals:
 *                             type: integer
 *                           assists:
 *                             type: integer
 *                           yellowCards:
 *                             type: integer
 *                           redCards:
 *                             type: integer
 *       400:
 *         description: Missing or invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not allowed to update lineup
 *       404:
 *         description: Fixture not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/lineup/fixture/{fixtureId}/team/{teamId}:
 *   get:
 *     summary: Get lineup by fixture and team
 *     tags: [lineup]
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the fixture
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the team
 *     responses:
 *       200:
 *         description: Lineup retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 fixtureId:
 *                   type: string
 *                 teamId:
 *                   type: string
 *                 players:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       playerId:
 *                         type: string
 *                       lineupId:
 *                         type: string
 *                       position:
 *                         type: string
 *                       isStarting:
 *                         type: boolean
 *                       minutesPlayed:
 *                         type: integer
 *                       goals:
 *                         type: integer
 *                       assists:
 *                         type: integer
 *                       yellowCards:
 *                         type: integer
 *                       redCards:
 *                         type: integer
 *                       player:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           image:
 *                             type: string
 *                           primaryPosition:
 *                             type: string
 *                           preferredFoot:
 *                             type: string
 *       404:
 *         description: Lineup not found
 *       500:
 *         description: Failed to fetch lineup
 */


/**
 * @swagger
 * /api/lineup/player-stats/{id}:
 *   put:
 *     summary: Update player stats for a fixture
 *     tags: [lineup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the playerStats record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               minutesPlayed:
 *                 type: integer
 *               goals:
 *                 type: integer
 *               assists:
 *                 type: integer
 *               yellowCards:
 *                 type: integer
 *               redCards:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Player stats updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 playerId:
 *                   type: string
 *                 lineupId:
 *                   type: string
 *                 position:
 *                   type: string
 *                 isStarting:
 *                   type: boolean
 *                 minutesPlayed:
 *                   type: integer
 *                 goals:
 *                   type: integer
 *                 assists:
 *                   type: integer
 *                 yellowCards:
 *                   type: integer
 *                 redCards:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the tournament admin
 *       404:
 *         description: Player stats not found
 *       500:
 *         description: Failed to update player stats
 */


//add player to lineup

/**
 * @swagger
 * /api/lineup/add-player/{lineupId}:
 *   post:
 *     summary: Add a player to a lineup
 *     description: Adds a player to the specified lineup, either as a starting player or a substitute.
 *     tags: [lineup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lineupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the lineup to add the player to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lineupId:
 *                 type: string
 *                 description: ID of the lineup (should match the path parameter)
 *                 example: c0af275b-9e0f-45c3-a65f-c9f310cdbac2
 *               playerId:
 *                 type: string
 *                 description: ID of the player to add
 *                 example: cm9vc2xyf0000gq2hvn9e3tdu
 *               position:
 *                 type: string
 *                 description: Position of the player (e.g., ST, GK, MID)
 *                 example: ST
 *               isStarting:
 *                 type: boolean
 *                 description: Whether the player is starting or a substitute
 *                 example: true
 *     responses:
 *       201:
 *         description: Player added to the lineup successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Player added successfully
 *                 playerLineup:
 *                   type: object
 *                   description: Details of the added player lineup entry
 *       400:
 *         description: Bad Request - Missing fields or invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized to modify the lineup
 *       404:
 *         description: Lineup not found
 *       500:
 *         description: Server error while adding player to lineup
 */

//remove player from lineup

/**
 * @swagger
 * /api/lineup/remove-player/{playerInLineupId}:
 *   delete:
 *     summary: Remove a player from a lineup
 *     description: Deletes a player from the lineup based on the provided player-in-lineup ID.
 *     tags: [lineup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerInLineupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the player in the lineup to remove
 *         example: 6bd12010-fd05-453c-89d8-4d340a538ca0
 *     responses:
 *       200:
 *         description: Player removed successfully from lineup
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Player removed from lineup successfully
 *       400:
 *         description: Bad Request - Invalid ID or missing data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Player in lineup not found
 *       500:
 *         description: Server error while removing player from lineup
 */



//get player match played
/**
 * @swagger
 * /api/player/tournament-stats/{playerId}:
 *   get:
 *     summary: Get a player's tournament statistics
 *     description: Fetches tournament-specific stats for a player, such as goals, assists, matches played, etc.
 *     tags: [Player]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the player to fetch tournament stats for
 *         example: cm9q0au2k0000twus64t5bqas
 *     responses:
 *       200:
 *         description: Successfully retrieved player tournament stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 playerId:
 *                   type: string
 *                   example: cm9q0au2k0000twus64t5bqas
 *                 tournaments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tournamentId:
 *                         type: string
 *                         example: trn-xyz123
 *                       goals:
 *                         type: integer
 *                         example: 5
 *                       assists:
 *                         type: integer
 *                         example: 2
 *                       matchesPlayed:
 *                         type: integer
 *                         example: 4
 *       400:
 *         description: Bad Request - Invalid player ID or missing data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Player not found
 *       500:
 *         description: Server error while fetching player stats
 */
