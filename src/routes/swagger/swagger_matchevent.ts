/**
 * @swagger
 * tags:
 *   name: Match Event
 *   description: Match Event end points
 */
/**
 * @swagger
 * /api/matchEvent/create:
 *   post:
 *     summary: Create a match event
 *     description: |
 *       Adds a new match event (like GOAL, SAVE, ASSIST, etc.) to a fixture.
 *       
 *       **Only tournament admins** are allowed to create match events.
 *       
 *       Valid event `type` values include:
 *       - `GOAL`
 *       - `ASSIST`
 *       - `SAVE`
 *       - `YELLOW_CARD`
 *       - `RED_CARD`
 *       - `SUBSTITUTION`
 *       - `GOAL_KICK`
 *       - `CORNER`
 *       - `PENALTY`
 *       - `FOUL`
 *       - `OTHER`
 *     tags: [Match Event]
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
 *               - type
 *               - minute
 *             properties:
 *               fixtureId:
 *                 type: string
 *                 description: ID of the fixture
 *               type:
 *                 type: string
 *                 enum: [GOAL, ASSIST, SAVE, YELLOW_CARD, RED_CARD, SUBSTITUTION, GOAL_KICK, CORNER, PENALTY, FOUL, OTHER]
 *                 description: Type of the match event
 *               minute:
 *                 type: integer
 *                 description: Minute in the match when the event occurred
 *               playerId:
 *                 type: string
 *                 description: ID of the player (optional, required for player-related events)
 *     responses:
 *       201:
 *         description: Match event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 fixtureId:
 *                   type: string
 *                 type:
 *                   type: string
 *                 minute:
 *                   type: integer
 *                 playerId:
 *                   type: string
 *       400:
 *         description: Missing or invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not allowed to create match events
 *       404:
 *         description: Fixture not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/matchEvent/fixture/{fixtureId}:
 *   get:
 *     summary: Get match events by fixture ID
 *     description: |
 *       Retrieves all match events for the given fixture, ordered by minute.
 *       Each event includes basic player information (ID, name, image) if a player is associated.
 *     tags: [Match Event]
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the fixture to retrieve events for
 *     responses:
 *       200:
 *         description: A list of match events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   fixtureId:
 *                     type: string
 *                   type:
 *                     type: string
 *                   minute:
 *                     type: integer
 *                   player:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       image:
 *                         type: string
 *       404:
 *         description: Fixture not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/matchEvent/deletemany/{id}:
 *   delete:
 *     summary: Delete a match event by ID
 *     description: |
 *       Deletes a match event and updates player stats, fixture scores, and leaderboard if the event is a goal.
 *       Only the tournament admin is authorized to perform this action.
 *     tags: [Match Event]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the match event to delete
 *     responses:
 *       200:
 *         description: Match event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Match event deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - Not the tournament admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You don't have permission to delete events from this fixture
 *       404:
 *         description: Match event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Match event not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to delete match event
 */


