import { Request, Response, NextFunction } from "express";
import { prisma } from "../../prismaClient";
import AppError from "../../utils/AppError";

// Extend Request to include authenticated user
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

// Create a new post
export const createPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const { title, content, type, tournamentId, image } = req.body;

    // Validate required fields
    if (!title || !content || !type) {
      return res.status(400).json({
        status: "error",
        message: "Title, content, and type are required",
      });
    }

    // Check if tournamentId is required based on post type
    const tournamentRelatedTypes = ['TOURNAMENT', 'MATCH_REPORT', 'TOURNAMENT_UPDATE', 'INJURY'];
    const isTournamentRelated = tournamentRelatedTypes.includes(type);
    
    if (isTournamentRelated && !tournamentId) {
      return res.status(400).json({
        status: "error",
        message: "Tournament ID is required for tournament-related posts",
      });
    }

    // If tournament-related, verify tournament exists
    if (tournamentId) {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
      });

      if (!tournament) {
        return res.status(404).json({
          status: "error",
          message: "Tournament not found",
        });
      }
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        type,
        ...(tournamentId && {
          tournament: {
            connect: { id: tournamentId },
          },
          image: image || null,
        }),
        createdBy: req.user.id,
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return next(new AppError("Failed to create post", 500));
  }
};

// Get all posts
export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return next(new AppError("Failed to fetch posts", 500));
  }
};

// Get posts by tournament ID
export const getPostsByTournament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const posts = await prisma.post.findMany({
      where: {
        id,
      },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching tournament posts:", error);
    return next(new AppError("Failed to fetch tournament posts", 500));
  }
};

// Get a single post by ID
export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if postId is provided
    if (!id) {
      return res.status(400).json({ status: "error", message: "postId is required" });
    }

    const post = await prisma.post.findUnique({
      where: {
        id, // Ensure postId is defined
      },
      include: {
        tournament: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ status: "error", message: "Post not found" });
    }

// Increment the reach count when a post is viewed
    await prisma.post.update({
      where: { id },
      data: { reach: { increment: 1 } },
    });

    return res.status(200).json({
      status: "success",
      data: post,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return next(new AppError("Failed to fetch post", 500));
  }
};

// Update a post (only by the creator)
export const updatePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    const { title, content, type } = req.body;

    // Find the post
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    // Check if the user is the creator of the post
    if (post.createdBy !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to update this post",
      });
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: title || post.title,
        content: content || post.content,
        type: type || post.type,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return next(new AppError("Failed to update post", 500));
  }
};

// Delete a post (only by the creator)
export const deletePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    // Find the post
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    // Check if the user is the creator of the post
    if (post.createdBy !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to delete this post",
      });
    }

    // Delete the post
    await prisma.post.delete({
      where: { id },
    });

    return res.status(200).json({
      status: "success",
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return next(new AppError("Failed to delete post", 500));
  }
};