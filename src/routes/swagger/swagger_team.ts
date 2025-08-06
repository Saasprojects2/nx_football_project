/**
 * @swagger
 * tags:
 *   name: Team
 *   description: Team end points
 */

//create team

/**
 * @swagger
 * /api/teams/create:
 *   post:
 *     summary: Create a new team
 *     description: Creates a new team and assigns the authenticated user as both manager and initial member.
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Thunder FC
 *               description:
 *                 type: string
 *                 example: A young dynamic team
 *               logo:
 *                 type: string
 *                 example: https://example.com/logo.png
 *               abbreviation:
 *                 type: string
 *                 example: THUNDER
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Team created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Internal Server Error
 */

//get all teams

/**
 * @swagger
 * /api/teams/all:
 *   get:
 *     summary: Get all teams
 *     description: Fetches a list of all teams along with their managers and members.
 *     tags: [Team]
 *     responses:
 *       200:
 *         description: Teams fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Teams fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Team'
 *       500:
 *         description: Internal Server Error
 */

// Get teams by ID
/**
 * @swagger
 * /api/teams/all/{id}:
 *   get:
 *     summary: Get a team by ID
 *     description: Fetches details of a team, including manager info, members, and tournaments.
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the team
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Team fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       404:
 *         description: Team not found
 *       500:
 *         description: Failed to fetch team
 */

// update team

/**
 * @swagger
 * /api/teams/update/{id}:
 *   put:
 *     summary: Update a team
 *     description: Allows the team manager to update the team's details.
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the team
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *               abbreviation:
 *                 type: string
 *             example:
 *               name: "New Team Name"
 *               description: "Updated description"
 *               logo: "https://example.com/logo.png"
 *               abbreviation: "NEW"
 *     responses:
 *       200:
 *         description: Team updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Team not found
 *       500:
 *         description: Failed to update team
 */

//delete team

/**
 * @swagger
 * /api/teams/delete/{id}:
 *   delete:
 *     summary: Delete a team
 *     description: Allows the team manager to delete a team.
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the team to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Team not found
 *       500:
 *         description: Failed to delete team
 */

//add player
/**
 * @swagger
 * /api/teams/add-player:
 *   post:
 *     summary: Add a player to a team
 *     description: Allows the team manager to add a player to the team using the player's phone number.
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *               - phoneNumber
 *             properties:
 *               teamId:
 *                 type: string
 *                 description: ID of the team
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number of the player to add
 *     responses:
 *       200:
 *         description: Player added to team successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Team or player not found
 *       500:
 *         description: Failed to add player to team
 */

//remove player

/**
 * @swagger
 * /api/teams/remove-player/{teamId}/players/{playerId}:
 *   delete:
 *     summary: Remove a player from a team
 *     description: Allows the team manager to remove a player from the team by player ID.
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the team
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the player to remove
 *     responses:
 *       200:
 *         description: Player removed from team successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Team not found
 *       500:
 *         description: Failed to remove player from team
 */

//my teams

/**
 * @swagger
 * /api/teams/user/my-teams:
 *   get:
 *     summary: Get teams managed by the current user
 *     description: Fetch all teams where the logged-in user is the manager.
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teams fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Team'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch teams
 */

//teams where the user is a player

/**
 * @swagger
 * /api/teams/user/as-player:
 *   get:
 *     summary: Get teams where the user is a player
 *     description: Fetch all teams where the logged-in user is a member (player).
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teams fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Team'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch teams
 */

