import { Response, Request, NextFunction } from "express";
import { prisma } from "../prismaClient";
import AppError from "../utils/AppError";

//get profile details
export const getProfile = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const userId = req.user.id;
        console.log(userId);

        const user = await prisma.user.findUnique({
            where: { id: userId, phoneNumberVerified: true },
            include: {
                teams: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        description: true
                    }
                },
                playerStats: {
                    select: {
                        id: true,
                        position: true,
                        isStarting: true,
                        minutesPlayed: true,
                        penaltysGoals: true,
                        goals: true,
                        assists: true,
                        yellowCards: true,
                        redCards: true,
                        lineup: {
                            select: {
                                fixture: {
                                    select: {
                                        id: true,
                                        date: true,
                                        status: true,
                                        homeTeam: {
                                            select: {
                                                id: true,
                                                name: true,
                                                logo: true
                                            }
                                        },
                                        awayTeam: {
                                            select: {
                                                id: true,
                                                name: true,
                                                logo: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                matchEvents: {
                    select: {
                        id: true,
                        type: true,
                        minute: true,
                        fixture: {
                            select: {
                                id: true,
                                date: true,
                                homeTeam: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                },
                                awayTeam: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                managedTournaments: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        description: true,
                        startDate: true,
                        endDate: true,
                        teams: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                members: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true,
                                        phoneNumber: true,
                                    } 
                                }
                            }
                        }
                    } 
                }
            }
        });

        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
    } catch (error) {
        return next(new AppError('Error fetching profile', 500));
    }
}

//update user profile
export const updateProfile = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const userId = req.user.id;
        const {name,dob, gender, image, message, primaryPosition, preferredFoot, city } = req.body;

        // Convert date string to Date object if present
        const dobDate = dob ? new Date(dob) : undefined;

        // Prepare update data
        const updateData: any = {};
        if (dobDate) updateData.dob = dobDate;
        if (name) updateData.name = name; 
        if (gender) updateData.gender = gender;
        if (image) updateData.image = image;
        if (message) updateData.message = message;
        if (primaryPosition) updateData.primaryPosition = primaryPosition;
        if (preferredFoot) updateData.preferredFoot = preferredFoot;
        if (city) updateData.city = city;

        // Update user in database
        const updateUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { 
                id: true, 
                name: true,
                image: true, 
                dob: true, 
                gender: true,
                message: true,
                primaryPosition: true,
                preferredFoot: true,
                city: true
            },
        });

        return res.status(200).json(updateUser);
    } catch (error) {
        console.error("Profile update error:", error);
        return next(new AppError('Error updating profile', 500));
    }
}
