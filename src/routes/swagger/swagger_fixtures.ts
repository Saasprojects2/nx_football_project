/**
 * @swagger
 * tags:
 *   name: Fixtures
 *   description: fixtures end points
 */
// create fixtures

/**
 * @swagger
 * /api/fixture/create:
 *   post:
 *     summary: Create a new fixture
 *     description: |
 *       Creates a new fixture. 
 *       `status` must be one of the following values: 
 *       - `SCHEDULED`
 *       - `LIVE`
 *       - `HALF_TIME`
 *       - `FULL_TIME`
 *       - `CANCELLED`
 *       - `OTHERS`
 *     tags: [Fixtures]
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
 *               - homeTeamId
 *               - awayTeamId
 *               - date
 *               - status
 *             properties:
 *               tournamentId:
 *                 type: string
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               homeTeamId:
 *                 type: string
 *                 example: "team-1-id"
 *               awayTeamId:
 *                 type: string
 *                 example: "team-2-id"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-04-20T14:30:00.000Z"
 *               status:
 *                 type: string
 *                 enum:
 *                   - SCHEDULED
 *                   - LIVE
 *                   - HALF_TIME
 *                   - FULL_TIME
 *                   - CANCELLED
 *                   - OTHERS
 *                 example: "SCHEDULED"
 *     responses:
 *       201:
 *         description: Fixture created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 tournamentId:
 *                   type: string
 *                 homeTeamId:
 *                   type: string
 *                 awayTeamId:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing or invalid fields
 *       401:
 *         description: Unauthorized - user not logged in
 *       403:
 *         description: Forbidden - user not tournament admin
 *       404:
 *         description: Tournament or team not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/fixture/all:
 *   get:
 *     summary: Get all fixtures
 *     tags: [Fixtures]
 *     responses:
 *       200:
 *         description: List of fixtures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                   tournament:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   homeTeam:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       logo:
 *                         type: string
 *                       members:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             image:
 *                               type: string
 *                             phoneNumber:
 *                               type: string
 *                   awayTeam:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       logo:
 *                         type: string
 *                       members:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             image:
 *                               type: string
 *                             phoneNumber:
 *                               type: string
 *       500:
 *         description: Failed to fetch fixtures
 */

// get fixtures by Id

/**
 * @swagger
 * /api/fixture/all/{id}:
 *   get:
 *     summary: Get a fixture by ID
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the fixture
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fixture retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                 tournament:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     adminId:
 *                       type: string
 *                 homeTeam:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     logo:
 *                       type: string
 *                 awayTeam:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     logo:
 *                       type: string
 *                 lineups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       players:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             player:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 image:
 *                                   type: string
 *                                 primaryPosition:
 *                                   type: string
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       minute:
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
 *       404:
 *         description: Fixture not found
 *       500:
 *         description: Internal server error
 */

// update fixtures

/**
 * @swagger
 * /api/fixture/update/{id}:
 *   put:
 *     summary: Update a fixture
 *     description: |
 *       Updates an existing fixture.
 *       
 *       `status` must be one of the following values: 
 *       - `SCHEDULED`
 *       - `LIVE`
 *       - `HALF_TIME`
 *       - `FULL_TIME`
 *       - `CANCELLED`
 *       - `OTHERS`
 *     tags: [Fixtures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the fixture to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-04-18T14:30:00.000Z"
 *               status:
 *                 type: string
 *                 description: "Must be one of: SCHEDULED, LIVE, HALF_TIME, FULL_TIME, CANCELLED, OTHERS"
 *                 enum:
 *                   - SCHEDULED
 *                   - LIVE
 *                   - HALF_TIME
 *                   - FULL_TIME
 *                   - CANCELLED
 *                   - OTHERS
 *                 example: "FULL_TIME"
 *               homeScore:
 *                 type: integer
 *                 example: 2
 *               awayScore:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Fixture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                 homeScore:
 *                   type: integer
 *                 awayScore:
 *                   type: integer
 *       401:
 *         description: Unauthorized (user not authenticated)
 *       403:
 *         description: Forbidden (user is not tournament admin)
 *       404:
 *         description: Fixture not found
 *       500:
 *         description: Internal server error
 */




//delete fixtures

/**
 * @swagger
 * /api/fixture/delete/{id}:
 *   delete:
 *     summary: Delete a fixture
 *     tags: [Fixtures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the fixture to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fixture deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fixture deleted successfully
 *       401:
 *         description: Unauthorized (user not authenticated)
 *       403:
 *         description: Forbidden (user is not the tournament admin)
 *       404:
 *         description: Fixture not found
 *       500:
 *         description: Internal server error
 */

// get fixtures by tournament id

/**
 * @swagger
 * /api/fixture/tournament/{tournamentId}:
 *   get:
 *     summary: Get all fixtures by tournament ID     
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         description: ID of the tournament
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of fixtures for the specified tournament
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                   homeTeam:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       logo:
 *                         type: string
 *                   awayTeam:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       logo:
 *                         type: string
 *       500:
 *         description: Internal server error
 */


//create fixture container
/**
 * @swagger
 * /api/fixture/container:
 *   post:
 *     summary: Create fixture container
 *     description: Creates a fixture container and its associated subfixtures for a tournament.
 *       **fixture status Enum Values:**
 *       - `SCHEDULED`
 *       - `LIVE`
 *       - `HALF_TIME`
 *       - `FULL_TIME`
 *       - `CANCELLED`
 *       - `OTHERS`
 * 
 *  
 *     tags: [Fixtures]
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
 *               - matchType
 *               - subfixtures
 *             properties:
 *               tournamentId:
 *                 type: string
 *                 description: ID of the tournament
 *               matchType:
 *                 type: string
 *                 description: Type of match (e.g., "League", "Knockout")
 *               subfixtures:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - homeTeam
 *                     - awayTeam
 *                     - matchDate
 *                   properties:
 *                     homeTeam:
 *                       type: string
 *                     awayTeam:
 *                       type: string
 *                     matchDate:
 *                       type: string
 *                       format: date-time
 *                     time:
 *                       type: string
 *                       description: Optional match start time
 *                     venue:
 *                       type: string
 *                       description: Optional venue of the match
 *                     status:
 *                       type: string
 *                       description: Match status (e.g., "scheduled")
 *     responses:
 *       201:
 *         description: Fixture container created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 container:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     tournamentId:
 *                       type: string
 *                     matchType:
 *                       type: string
 *                 subfixtures:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       containerId:
 *                         type: string
 *                       tournamentId:
 *                         type: string
 *                       homeTeamId:
 *                         type: string
 *                       awayTeamId:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       time:
 *                         type: string
 *                       venue:
 *                         type: string
 *                       status:
 *                         type: string
 *       400:
 *         description: Bad request (e.g., missing fields or invalid team)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user not authorized)
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */


//get fixture container by id

/**
 * @swagger
 * /api/fixture/container/{id}:
 *   get:
 *     summary: Get fixture container by ID
 *     description: Retrieves a fixture container along with its tournament details and all associated subfixtures.
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the fixture container
 *     responses:
 *       200:
 *         description: Fixture container retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 tournament:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     adminId:
 *                       type: string
 *                 subfixtures:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       time:
 *                         type: string
 *                       venue:
 *                         type: string
 *                       status:
 *                         type: string
 *                       homeTeam:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           logo:
 *                             type: string
 *                       awayTeam:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           logo:
 *                             type: string
 *       404:
 *         description: Fixture container not found
 *       500:
 *         description: Internal server error
 */


///get all fixture by tournament id

/**
 * @swagger
 * /api/fixture/containers/tournament/{tournamentId}:
 *   get:
 *     summary: Get all fixture containers by tournament ID
 *     description: Fetches all fixture containers associated with a specific tournament, including their subfixtures and teams.
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tournament
 *     responses:
 *       200:
 *         description: List of fixture containers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   matchType:
 *                     type: string
 *                   tournamentId:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   subfixtures:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         date:
 *                           type: string
 *                           format: date-time
 *                         time:
 *                           type: string
 *                         venue:
 *                           type: string
 *                         status:
 *                           type: string
 *                         homeTeam:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             logo:
 *                               type: string
 *                         awayTeam:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             logo:
 *                               type: string
 *       500:
 *         description: Failed to fetch tournament fixture containers
 */


//add a subfixture to a fixture container

/**
 * @swagger
 * /api/fixture/container/{containerId}/subfixture:
 *   post:
 *     summary: Add a subfixture to a fixture container
 *     description: Allows the tournament admin to add a new subfixture to an existing fixture container.
 *     tags: [Fixtures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the fixture container
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - homeTeam
 *               - awayTeam
 *               - matchDate
 *             properties:
 *               homeTeam:
 *                 type: string
 *               awayTeam:
 *                 type: string
 *               matchDate:
 *                 type: string
 *                 format: date-time
 *               time:
 *                 type: string
 *                 example: "15:30"
 *               venue:
 *                 type: string
 *               status:
 *                 type: string
 *                 default: "scheduled"
 *     responses:
 *       201:
 *         description: Subfixture added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 containerId:
 *                   type: string
 *                 tournamentId:
 *                   type: string
 *                 homeTeamId:
 *                   type: string
 *                 awayTeamId:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 time:
 *                   type: string
 *                 venue:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Invalid input or team not part of the tournament
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the tournament admin
 *       404:
 *         description: Fixture container not found
 *       500:
 *         description: Failed to add subfixture to container
 */

//update fixture by id

/**
 * @swagger
 * /api/fixture/subfixture/{subfixtureid}:
 *   put:
 *     summary: Update a subfixture by ID
 *     description: Updates the details of a subfixture such as teams, date, time, venue, status, and scores. Only the tournament admin can update a subfixture.
 *     tags: [Fixtures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subfixtureid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the subfixture to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               homeTeam:
 *                 type: string
 *                 description: ID of the new home team
 *               awayTeam:
 *                 type: string
 *                 description: ID of the new away team
 *               matchDate:
 *                 type: string
 *                 format: date-time
 *               time:
 *                 type: string
 *                 example: "15:30"
 *               venue:
 *                 type: string
 *               status:
 *                 type: string
 *                 example: "scheduled"
 *               homeScore:
 *                 type: integer
 *               awayScore:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Subfixture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 containerId:
 *                   type: string
 *                 tournamentId:
 *                   type: string
 *                 homeTeamId:
 *                   type: string
 *                 awayTeamId:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 time:
 *                   type: string
 *                 venue:
 *                   type: string
 *                 status:
 *                   type: string
 *                 homeScore:
 *                   type: integer
 *                 awayScore:
 *                   type: integer
 *       400:
 *         description: Invalid team ID or input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the tournament admin
 *       404:
 *         description: Subfixture not found
 *       500:
 *         description: Failed to update subfixture
 */


//delete fixture by id

/**
 * @swagger
 * /api/fixture/subfixture/{subfixtureid}:
 *   delete:
 *     summary: Delete a subfixture from a fixture container
 *     description: Deletes a subfixture from the specified fixture container. Only the tournament admin can delete a subfixture.
 *     tags: [Fixtures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subfixtureid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the subfixture to delete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - containerId
 *             properties:
 *               containerId:
 *                 type: string
 *                 description: ID of the fixture container to which the subfixture belongs
 *     responses:
 *       200:
 *         description: Subfixture deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subfixture deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the tournament admin
 *       404:
 *         description: Subfixture not found
 *       500:
 *         description: Failed to delete subfixture
 */

//delete all fixture from the fixture container

/**
 * @swagger
 * /api/fixture/container/{containerId}/subfixtures:
 *   delete:
 *     summary: Delete all subfixtures from a fixture container
 *     description: Deletes all subfixtures from a specific fixture container. Only the tournament admin can perform this action.
 *     tags: [Fixtures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the fixture container
 *     responses:
 *       200:
 *         description: All subfixtures deleted successfully from the container
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All subfixtures deleted successfully from the container
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the tournament admin
 *       404:
 *         description: Fixture container not found
 *       500:
 *         description: Failed to delete subfixtures from container
 */
