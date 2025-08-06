/**
 * @swagger
 * tags:
 *   name: Post
 *   description: Post end points
 */
/**
 * @swagger
 * /api/post/createpost:
 *   post:
 *     summary: Create a new post
 *     description: |
 *       Creates a new post with a title, content, and type.  
 *       The `type` field must be one of the following:
 *       
 *       **PostType Enum Values:**
 *       - `SPONSOR` — Sponsor-related post  
 *       - `LOCATION` — Location or venue-related update  
 *       - `CAMPUS_TRIBE` — Campus or tribe-based announcement  
 *       - `THANK_YOU` — Thank you or appreciation post  
 *       - `TOURNAMENT` — Post related to a tournament  
 *       - `MATCH_REPORT` — Match summary or analysis  
 *       - `TOURNAMENT_UPDATE` — Ongoing tournament update  
 *       - `INJURY` — Any other general post
 *       - `OTHER` — Any other general post  
 *       
 *       If the post type is related to a tournament (`TOURNAMENT`, `MATCH_REPORT`,INJURY , or `TOURNAMENT_UPDATE`), the `tournamentId` is required.  
 *       Only authenticated users are allowed to create posts.
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Match Recap"
 *               content:
 *                 type: string
 *                 example: "It was a thrilling match between teams A and B."
 *               type:
 *                 type: string
 *                 enum: [SPONSOR, LOCATION, CAMPUS_TRIBE, THANK_YOU, TOURNAMENT, MATCH_REPORT, TOURNAMENT_UPDATE, OTHER]
 *                 example: "TOURNAMENT"
 *               tournamentId:
 *                 type: string
 *                 example: "abc123"
 *               image:
 *                 type: string
 *                 example: "URL_ADDRESS.com/image.jpg"
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Post created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     type:
 *                       type: string
 *                     tournamentId:
 *                       type: string
 *                     createdBy:
 *                       type: string
 *       400:
 *         description: Missing required fields or invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/post/getallposts:
 *   get:
 *     summary: Get all posts
 *     description: |
 *       Retrieves all posts from the database.  
 *       Each post includes basic information along with the associated tournament details (if any).
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: List of all posts retrieved successfully
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
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [SPONSOR, LOCATION, CAMPUS_TRIBE, THANK_YOU, TOURNAMENT, MATCH_REPORT, TOURNAMENT_UPDATE, OTHER]
 *                       tournamentId:
 *                         type: string
 *                         nullable: true
 *                       createdBy:
 *                         type: string
 *                       tournament:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/post/tournament/{tournamentId}:
 *   get:
 *     summary: Get posts by tournament ID
 *     description: |
 *       Retrieves all posts related to a specific tournament.  
 *       Only posts that have a matching `tournamentId` will be returned.
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the tournament to filter posts by
 *     responses:
 *       200:
 *         description: Posts fetched successfully
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
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [SPONSOR, LOCATION, CAMPUS_TRIBE, THANK_YOU, TOURNAMENT, MATCH_REPORT, TOURNAMENT_UPDATE, OTHER]
 *                       tournamentId:
 *                         type: string
 *                       createdBy:
 *                         type: string
 *                       tournament:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *       401:
 *         description: Unauthorized - Missing or invalid bearer token
 *       500:
 *         description: Internal server error
 */

//error
/**
 * @swagger
 * /api/post/getallposts/{id}:
 *   get:
 *     summary: Get a single post by ID //error
 *     description: |
 *       Retrieves a single post by its ID. If found, increments the post's reach count by 1.
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to retrieve
 *     responses:
 *       200:
 *         description: Post retrieved successfully
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
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [SPONSOR, LOCATION, CAMPUS_TRIBE, THANK_YOU, TOURNAMENT, MATCH_REPORT, TOURNAMENT_UPDATE, OTHER]
 *                     tournament:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */

//error
/**
 * @swagger
 * /api/post/updatepost/{id}:
 *   put:
 *     summary: Update a post (only by the creator) //error
 *     description: |
 *       Allows the creator of a post to update its title, content, and type.
 *       Only the creator of the post is authorized to perform this action.
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [SPONSOR, LOCATION, CAMPUS_TRIBE, THANK_YOU, TOURNAMENT, MATCH_REPORT, TOURNAMENT_UPDATE, OTHER]
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Post updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [SPONSOR, LOCATION, CAMPUS_TRIBE, THANK_YOU, TOURNAMENT, MATCH_REPORT, TOURNAMENT_UPDATE, OTHER]
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - user is not authenticated
 *       403:
 *         description: Forbidden - user is not the creator of the post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */

//error
/**
 * @swagger
 * /api/post/deletepost/{id}:
 *   delete:
 *     summary: Delete a post (only by the creator) //error
 *     description: |
 *       Allows the creator of a post to delete it. Only the creator of the post is authorized to perform this action.
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Post deleted successfully
 *       401:
 *         description: Unauthorized - user is not authenticated
 *       403:
 *         description: Forbidden - user is not the creator of the post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
