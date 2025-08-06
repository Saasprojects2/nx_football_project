/**
 * @swagger
 * tags:
 *   name: Tournament
 *   description: Tournament end points
 */

// Create Tournament

/**
 * @swagger
 * /api/tournaments/create:
 *   post:
 *     summary: Create a new tournament
 *     description: Authenticated user (admin) can create a new tournament with name, logo, description, and start/end dates.
 *     tags: [Tournament]
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
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Elite Football Cup"
 *               description:
 *                 type: string
 *                 example: "Annual regional football championship"
 *               logo:
 *                 type: string
 *                 example: "https://example.com/logo.png"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-10"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-15"
 *     responses:
 *       201:
 *         description: Tournament created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Tournament created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "clvabc123xyz456"
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     logo:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     adminId:
 *                       type: string
 *       400:
 *         description: Bad Request - name or startDate missing
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

// get tournament

/**
 * @swagger
 * /api/tournaments/all:
 *   get:
 *     summary: Get all tournaments
 *     description: Fetches a list of all tournaments including admin info, teams, and fixtures.
 *     tags: [Tournament]
 *     responses:
 *       200:
 *         description: A list of tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                       admin:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       teams:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             logo:
 *                               type: string
 *                             description:
 *                               type: string
 *                       fixtures:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             homeTeam:
 *                               $ref: '#/components/schemas/Team'
 *                             awayTeam:
 *                               $ref: '#/components/schemas/Team'
 *       500:
 *         description: Internal Server Error
 */

// get tounament by id

/**
 * @swagger
 * /api/tournaments/all/{id}:
 *   get:
 *     summary: Get a tournament by ID
 *     description: Retrieves details of a specific tournament, including admin info, teams, and fixtures.
 *     tags: [Tournament]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the tournament to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tournament found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     teams:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Team'
 *                     fixtures:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           homeTeam:
 *                             $ref: '#/components/schemas/Team'
 *                           awayTeam:
 *                             $ref: '#/components/schemas/Team'
 *       400:
 *         description: Tournament ID is required
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal Server Error
 */

// update tournament

/**
 * @swagger
 * /api/tournaments/update/{id}:
 *   put:
 *     summary: Update a tournament
 *     description: Updates a tournament's information. Only the admin who created the tournament can update it.
 *     tags: [Tournament]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Tournament ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Tournament updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: Unauthorized (not logged in)
 *       403:
 *         description: Forbidden (not the tournament admin)
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal Server Error
 */

//delete tournament

/**
 * @swagger
 * /api/tournaments/delete/{id}:
 *   delete:
 *     summary: Delete a tournament
 *     description: Deletes a tournament if the requesting user is the admin of the tournament.
 *     tags: [Tournament]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Tournament ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tournament deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tournament deleted successfully
 *       401:
 *         description: Unauthorized (not logged in)
 *       403:
 *         description: Forbidden (not the tournament admin)
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal Server Error
 */

// add team

/**
 * @swagger
 * /api/tournaments/add-team:
 *   post:
 *     summary: Add a team to a tournament
 *     description: Adds a team to a tournament if the authenticated user is the admin of the tournament.
 *     tags: [Tournament]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tournamentId
 *               - teamId
 *             properties:
 *               tournamentId:
 *                 type: string
 *                 example: "abc123"
 *               teamId:
 *                 type: string
 *                 example: "team456"
 *     responses:
 *       200:
 *         description: Team added to tournament successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Team added to tournament successfully
 *                 tour:
 *                   $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: Unauthorized (not logged in)
 *       403:
 *         description: Forbidden (not the tournament admin)
 *       404:
 *         description: Tournament or team not found
 *       500:
 *         description: Internal Server Error
 */

//remove team
/**
 * @swagger
 * /api/tournaments/{tournamentId}/teams/{teamId}:
 *   delete:
 *     summary: Remove a team from a tournament
 *     description: Removes a team from the tournament if the authenticated user is the tournament admin.
 *     tags: [Tournament]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tournament
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team to remove
 *     responses:
 *       200:
 *         description: Team removed from tournament successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Team removed from tournament successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not tournament admin
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /api/tournaments/user/my-tournaments:
 *   get:
 *     summary: Get all tournaments created by the authenticated user
 *     description: Returns tournaments where the current user is the admin, along with teams and fixtures.
 *     tags: [Tournament]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched tournaments created by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

//get past tournamnt

/**
 * @swagger
 * /api/tournaments/past:
 *   get:
 *     summary: Get past tournaments
 *     description: Retrieves all tournaments that have ended (based on endDate).
 *     tags: [Tournament]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of past tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       admin:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       teams:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             logo:
 *                               type: string
 *                             description:
 *                               type: string
 *                       fixtures:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             homeTeam:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 logo:
 *                                   type: string
 *                             awayTeam:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 logo:
 *                                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


//get current tournament
/**
 * @swagger
 * /api/tournaments/current:
 *   get:
 *     summary: Get current tournaments
 *     description: Retrieves all tournaments that are ongoing (based on startDate and endDate).
 *     tags: [Tournament]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of current tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       admin:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       teams:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             logo:
 *                               type: string
 *                             description:
 *                               type: string
 *                       fixtures:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             homeTeam:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 logo:
 *                                   type: string
 *                             awayTeam:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 logo:
 *                                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


//get future tournament
/**
 * @swagger
 * /api/tournaments/future:
 *   get:
 *     summary: Get future tournaments
 *     description: Retrieves all tournaments that have not yet started (based on startDate).
 *     tags: [Tournament]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of future tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       admin:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       teams:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             logo:
 *                               type: string
 *                             description:
 *                               type: string
 *                       fixtures:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             homeTeam:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 logo:
 *                                   type: string
 *                             awayTeam:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 logo:
 *                                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */