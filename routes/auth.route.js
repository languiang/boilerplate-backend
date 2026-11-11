import express from "express";

import {
  register,
  login,
  logout,
  forgotPassword,
  verifyResetToken,
  confirmResetToken,
  resetPassword,
  changePassword,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { methodAllowed } from "../middlewares/errorHandler.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Sign up, log in, log out
 *   - name: Password
 *     description: Forgot, reset, and change password
 *   - name: Current User
 *     description: Endpoints for the logged-in user
 *
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 *   schemas:
 *     Success:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1c2e8a1b2c3d4e5f6a7b
 *         name:
 *           type: string
 *           example: Juan Dela Cruz
 *         email:
 *           type: string
 *           example: juan@example.com
 *   responses:
 *     ServerError:
 *       description: Unexpected server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             message: "500: Internal server error."
 */

// Account

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Create an account
 *     description: >
 *       Returns the same 201 response when the email already exists.
 *       The server emails the owner of that address instead.
 *       Password needs 8+ characters with an uppercase letter, a lowercase letter, and a number.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Dela Cruz
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: Account created, or the email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: Thanks for signing up! Check your email to continue.
 *       400:
 *         description: Validation failed, or the body is not valid JSON
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validation:
 *                 summary: Validation failed. Messages join with ". ".
 *                 value:
 *                   success: false
 *                   message: Enter your name. Enter your email address. Enter a password.
 *               invalidJson:
 *                 summary: Body is not valid JSON
 *                 value:
 *                   success: false
 *                   message: "400: Invalid JSON body."
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
authRouter
  .route("/register")
  .post(register)
  .all(methodAllowed(["POST"]));

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in
 *     description: Sets the connect.sid cookie on success.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: You're logged in.
 *       400:
 *         description: Validation failed, or the body is not valid JSON
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validation:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: Please enter a valid email address.
 *               invalidJson:
 *                 summary: Body is not valid JSON
 *                 value:
 *                   success: false
 *                   message: "400: Invalid JSON body."
 *       401:
 *         description: Wrong email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: The email or password you entered is incorrect. Check your details and try again, or reset your password if you forgot it.
 *       500:
 *         description: Session could not be created, or an unexpected server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               sessionError:
 *                 summary: Session could not be created
 *                 value:
 *                   success: false
 *                   message: We couldn't log you in. Please try again.
 *               serverError:
 *                 summary: Unexpected server error
 *                 value:
 *                   success: false
 *                   message: "500: Internal server error."
 */
authRouter
  .route("/login")
  .post(login)
  .all(methodAllowed(["POST"]));

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out
 *     description: Destroys the session and clears the connect.sid cookie.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: You've been logged out.
 *       500:
 *         description: Session could not be destroyed, or an unexpected server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               sessionError:
 *                 summary: Session could not be destroyed
 *                 value:
 *                   success: false
 *                   message: We couldn't log you out. Please try again.
 *               serverError:
 *                 summary: Unexpected server error
 *                 value:
 *                   success: false
 *                   message: "500: Internal server error."
 */
authRouter
  .route("/logout")
  .post(logout)
  .all(methodAllowed(["POST"]));

// Password (logged out)

/**
 * @swagger
 * /api/v1/auth/password/forgot:
 *   post:
 *     summary: Send a password reset email
 *     description: Returns the same 200 response whether or not the account exists. The reset link expires in 30 minutes.
 *     tags: [Password]
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
 *                 example: juan@example.com
 *     responses:
 *       200:
 *         description: Request received
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: If an account exists for juan@example.com, we sent a link to reset your password. Check your inbox and spam folder. The link expires in 30 minutes.
 *       400:
 *         description: Validation failed, or the body is not valid JSON
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validation:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: Please enter a valid email address.
 *               invalidJson:
 *                 summary: Body is not valid JSON
 *                 value:
 *                   success: false
 *                   message: "400: Invalid JSON body."
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
authRouter
  .route("/password/forgot")
  .post(forgotPassword)
  .all(methodAllowed(["POST"]));

/**
 * @swagger
 * /api/v1/auth/password/reset/{token}:
 *   parameters:
 *     - in: path
 *       name: token
 *       required: true
 *       schema:
 *         type: string
 *       description: Reset token from the email link
 *   get:
 *     summary: Check if a reset token is valid
 *     tags: [Password]
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: Your reset link is valid. Enter a new password.
 *       400:
 *         description: Token is invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: This password reset link is invalid or has expired. Please request a new one.
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Set a new password with a reset token
 *     description: Password needs 8+ characters with an uppercase letter, a lowercase letter, and a number.
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password reset
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: Password successfully reset. You can log in now.
 *       400:
 *         description: Token is invalid or expired, the password failed validation, or the body is not valid JSON
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               badToken:
 *                 summary: Token is invalid or expired
 *                 value:
 *                   success: false
 *                   message: This password reset link is invalid or has expired. Please request a new one.
 *               badPassword:
 *                 summary: Password failed validation
 *                 value:
 *                   success: false
 *                   message: Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.
 *               invalidJson:
 *                 summary: Body is not valid JSON
 *                 value:
 *                   success: false
 *                   message: "400: Invalid JSON body."
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
authRouter
  .route("/password/reset/:token")
  .get(verifyResetToken, confirmResetToken)
  .post(verifyResetToken, resetPassword)
  .all(methodAllowed(["GET", "POST"]));

// Current user (logged in)

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get the logged-in user
 *     tags: [Current User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The user's id, name, and email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User found.
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not logged in, or the user no longer exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               notLoggedIn:
 *                 summary: No session
 *                 value:
 *                   success: false
 *                   message: Unauthorized
 *               sessionExpired:
 *                 summary: User was deleted
 *                 value:
 *                   success: false
 *                   message: Your session has expired. Please log in again.
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
authRouter
  .route("/me")
  .get(isAuthenticated, getCurrentUser)
  .all(methodAllowed(["GET"]));

/**
 * @swagger
 * /api/v1/auth/me/password:
 *   patch:
 *     summary: Change password
 *     description: Password needs 8+ characters with an uppercase letter, a lowercase letter, and a number.
 *     tags: [Current User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currPassword
 *               - newPassword
 *             properties:
 *               currPassword:
 *                 type: string
 *                 example: Password123!
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: Your password has been changed.
 *       400:
 *         description: Current password missing or wrong, the new password failed validation, or the body is not valid JSON
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingCurrent:
 *                 summary: Current password missing
 *                 value:
 *                   success: false
 *                   message: Enter your current password.
 *               wrongCurrent:
 *                 summary: Current password wrong
 *                 value:
 *                   success: false
 *                   message: The current password you entered is incorrect. Try again.
 *               badNew:
 *                 summary: New password failed validation
 *                 value:
 *                   success: false
 *                   message: Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.
 *               invalidJson:
 *                 summary: Body is not valid JSON
 *                 value:
 *                   success: false
 *                   message: "400: Invalid JSON body."
 *       401:
 *         description: Not logged in, or the user no longer exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               notLoggedIn:
 *                 summary: No session
 *                 value:
 *                   success: false
 *                   message: Unauthorized
 *               sessionExpired:
 *                 summary: User was deleted
 *                 value:
 *                   success: false
 *                   message: Your session has expired. Please log in again.
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
authRouter
  .route("/me/password")
  .patch(isAuthenticated, changePassword)
  .all(methodAllowed(["PATCH"]));

export default authRouter;
