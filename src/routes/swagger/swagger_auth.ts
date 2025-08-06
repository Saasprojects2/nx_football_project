// Register new user

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication end points
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user with phone number and password, then sends an OTP for verification.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phoneNumber
 *               - password
 *               - confirmPassword
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully and OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully. Please verify your phone number."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user_abc123"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     phoneNumber:
 *                       type: string
 *                       example: "9876543210"
 *       400:
 *         description: Validation error or password mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Passwords do not match"
 *       500:
 *         description: Server error during registration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred during registration"
 */




// Verify OTP

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify user's OTP and log them in
 *     description: Validates the OTP sent to the user's phone number. If valid, marks the phone as verified, logs the user in, and sets authentication cookies.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully and user logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Phone number verified and logged in successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "clvwxyz123456abcde"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+919876543210"
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid OTP"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 */


// Login with phone number to receive OTP

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Logs in a user using phone number and password. Returns access and refresh tokens in cookies and response body.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "7085563968"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "12345678"
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user_abc123"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         phoneNumber:
 *                           type: string
 *                           example: "9876543210"
 *                         email:
 *                           type: string
 *                           nullable: true
 *                           example: "john@example.com"
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request (validation error)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Phone number is required"
 *       401:
 *         description: Unauthorized - Invalid credentials or unverified phone number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Server error during login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Login failed"
 */

// Send OTP to phone number
/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to phone number
 *     description: Generates and sends a 6-digit OTP to the specified phone number. OTP is stored in the database and is valid for 10 minutes.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *       400:
 *         description: Bad request (e.g., missing phone number)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Phone number is required
 *       500:
 *         description: Failed to send OTP due to server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to send OTP
 */


// Logout
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out the user
 *     description: Clears authentication cookies and deletes the user session from the database. Requires the user to be logged in with a valid refresh token cookie.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       500:
 *         description: Logout failed due to server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Logout failed
 *     cookies:
 *       - name: refreshToken
 *         in: cookie
 *         required: false
 *         description: Refresh token used to identify the session to be deleted
 */

// send request reset throough otp
/**
 * @swagger
 * /api/auth/request-reset:
 *   post:
 *     summary: Request password reset
 *     description: Sends an OTP to the user's registered phone number for password reset. The OTP is valid for 1 hour.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+919876543210"
 *     responses:
 *       200:
 *         description: Password reset OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset OTP sent to your phone number
 *                 phoneNumber:
 *                   type: string
 *                   example: "+919876543210"
 *       400:
 *         description: Bad request - phoneNumber missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: phoneNumber is required
 *       404:
 *         description: User not found with the provided phone number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error while sending OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred while sending reset email
 */

//reset password

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Resets the user's password using the OTP sent for password reset.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+919876543210"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "NewPassword@123"
 *               confirmPassword:
 *                 type: string
 *                 example: "NewPassword@123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *       400:
 *         description: Bad request (missing fields, mismatched passwords, invalid/expired OTP)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: OTP has expired
 *       404:
 *         description: User not found with the given phone number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error while resetting password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred while resetting the password
 */


//get user profile

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearer:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */


/**
 * @swagger
 * tags:
 *   name: User
 *   description: User end points
 */

// Get user profile

/**
 * @swagger
 * /api/auth/getprofile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     description: Retrieves profile details of the currently logged-in and phone-verified user, including team, stats, events, and tournaments.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "clvwxyz123456abcde"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 phoneNumber:
 *                   type: string
 *                   example: "+919876543210"
 *                 phoneNumberVerified:
 *                   type: boolean
 *                   example: true
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       logo:
 *                         type: string
 *                       description:
 *                         type: string
 *                 playerStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       position:
 *                         type: string
 *                       isStarting:
 *                         type: boolean
 *                       minutesPlayed:
 *                         type: number
 *                       goals:
 *                         type: number
 *                       assists:
 *                         type: number
 *                       yellowCards:
 *                         type: number
 *                       redCards:
 *                         type: number
 *                       lineup:
 *                         type: object
 *                         properties:
 *                           fixture:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               date:
 *                                 type: string
 *                                 format: date-time
 *                               status:
 *                                 type: string
 *                               homeTeam:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   name:
 *                                     type: string
 *                                   logo:
 *                                     type: string
 *                               awayTeam:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   name:
 *                                     type: string
 *                                   logo:
 *                                     type: string
 *                 matchEvents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       minute:
 *                         type: number
 *                       fixture:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           homeTeam:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           awayTeam:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                 managedTournaments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       logo:
 *                         type: string
 *                       description:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User not found or not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error while fetching profile
 */

// Update user profile

/**
 * @swagger
 * /api/auth/updateUserdetails:
 *   put:
 *     summary: Update the authenticated user's profile
 *     description: Update personal details like email, date of birth, gender, image, city, message, and football preferences.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@example.com"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "2000-05-15"
 *               gender:
 *                 type: string
 *                 example: "Male"
 *               image:
 *                 type: string
 *                 example: "https://example.com/profile.jpg"
 *               message:
 *                 type: string
 *                 example: "Aspiring footballer"
 *               primaryPosition:
 *                 type: string
 *                 example: "Midfielder"
 *               preferredFoot:
 *                 type: string
 *                 example: "Right"
 *               city:
 *                 type: string
 *                 example: "Mumbai"
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "clvxyz1234abcde"
 *                 email:
 *                   type: string
 *                 image:
 *                   type: string
 *                 dob:
 *                   type: string
 *                   format: date
 *                 gender:
 *                   type: string
 *                 message:
 *                   type: string
 *                 primaryPosition:
 *                   type: string
 *                 preferredFoot:
 *                   type: string
 *                 city:
 *                   type: string
 *       401:
 *         description: Unauthorized (user not logged in)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error while updating profile
 */


//add more details authenticate user
/**
 * @swagger
 * /api/auth/addDetails:
 *   put:
 *     summary: Update user details
 *     description: Updates user profile details and sends an email verification. Requires authentication.
 * 
 *       **GENDER Enum Values:**
 *       - `MALE`
 *       - `FEMALE`
 *       - `OTHER`
 * 
 *       **FOOT Enum Values:**
 *       - `RIGHT`
 *       - `LEFT`
 *       - `BOTH`
 * 
 *       **POSITION Enum Values:**
 *       - `STRIKER`
 *       - `DEFENDER`
 *       - `MIDFIELDER`
 *       - `GOALKEEPER`
 * 
 * 
 *       
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - dob
 *               - gender
 *               - city
 *               - primaryPosition
 *               - preferredFoot
 *               - message
 *               - image
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1998-05-12"
 *               gender:
 *                 type: string
 *                 example: "male"
 *               city:
 *                 type: string
 *                 example: "Mumbai"
 *               primaryPosition:
 *                 type: string
 *                 example: "Midfielder"
 *               preferredFoot:
 *                 type: string
 *                 example: "Right"
 *               message:
 *                 type: string
 *                 example: "Passionate footballer looking for opportunities"
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/profile.jpg"
 *     responses:
 *       200:
 *         description: User details updated and verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User details updated. Verification email sent
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *       400:
 *         description: Email is already registered with another account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is already registered with another account
 *       401:
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Error updating user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating user details
 */


//semd verification email
/**
 * @swagger
 * /api/auth/resend-email:
 *   post:
 *     summary: Resend verification email
 *     description: Sends a new verification email to the user if the email is not already verified.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email sent successfully
 *       400:
 *         description: Email is required or already verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is already verified
 *       404:
 *         description: User not found with the provided email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error while sending verification email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred while sending verification email
 */



//get all players stats
/**
 * @swagger
 * /api/auth/users/player-stats:
 *   get:
 *     summary: Get users with player statistics
 *     description: Retrieves all users who have player stats and have verified their phone numbers.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved users with player stats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   image:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   primaryPosition:
 *                     type: string
 *                   preferredFoot:
 *                     type: string
 *                   city:
 *                     type: string
 *                   playerStats:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         position:
 *                           type: string
 *                         isStarting:
 *                           type: boolean
 *                         minutesPlayed:
 *                           type: number
 *                         goals:
 *                           type: number
 *                         assists:
 *                           type: number
 *                         yellowCards:
 *                           type: number
 *                         redCards:
 *                           type: number
 *                         lineup:
 *                           type: object
 *                           properties:
 *                             team:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 logo:
 *                                   type: string
 *                             fixture:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 date:
 *                                   type: string
 *                                   format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error fetching users with player stats
 */


//get all users 

/**
 * @swagger
 * /api/auth/users/all:
 *   get:
 *     summary: Get all users
 *     description: Retrieves all users with basic information and related player statistics.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   image:
 *                     type: string
 *                   emailVerified:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   city:
 *                     type: string
 *                   primaryPosition:
 *                     type: string
 *                   preferredFoot:
 *                     type: string
 *                   playerStats:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         position:
 *                           type: string
 *                         isStarting:
 *                           type: boolean
 *                         minutesPlayed:
 *                           type: number
 *                         goals:
 *                           type: number
 *                         assists:
 *                           type: number
 *                         yellowCards:
 *                           type: number
 *                         redCards:
 *                           type: number
 *                         lineup:
 *                           type: object
 *                           properties:
 *                             team:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 logo:
 *                                   type: string
 *                             fixture:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 date:
 *                                   type: string
 *                                   format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch users
 */

