import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all pro users with their onboarding details and projects
router.get('/', async (req, res) => {
  const { serviceProviderType } = req.query; // Get the filter from query parameters

  try {
    // Build the query based on the serviceProviderType
    const whereClause = {
      userType: 'pro',
    };

    if (serviceProviderType) {
      if (serviceProviderType === 'Architect') {
        whereClause.OR = [
          { profile: { serviceProviderType: 'Architect' } },
          { profile: { serviceProviderType: 'Architect + Interior Designer' } }
        ];
      } else if (serviceProviderType === 'Interior Designer') {
        whereClause.OR = [
          { profile: { serviceProviderType: 'Interior Designer' } },
          { profile: { serviceProviderType: 'Architect + Interior Designer' } }
        ];
      }
    }

    // Fetch all pro users with their profiles and projects
    const proUsers = await prisma.user.findMany({
      where: whereClause,
      include: {
        profile: true, // Include onboarding details
        projects: true, // Include all projects
      },
    });

    // Return the pro users data
    res.json(proUsers);
  } catch (error) {
    console.error('Error fetching pro users:', error);
    res.status(500).json({
      message: 'Error fetching pro user details',
      error: error.message,
    });
  }
});

export default router;
