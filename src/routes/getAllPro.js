import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all pro users with their onboarding details, projects, and project averages
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

    // Fetch all pro users with their profiles, projects, and project averages
    const proUsers = await prisma.user.findMany({
      where: whereClause,
      include: {
        profile: {
          include: {
            projectAverages: true, // Include project averages through profile
          },
        },
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

// Get a specific pro user by ID, including their profile, projects, and project averages
router.get('/:id', async (req, res) => {
  const { id } = req.params; // Get the user ID from the request parameters

  try {
    // Fetch the pro user with the specified ID, including their profile, projects, and project averages
    const proUser = await prisma.user.findUnique({
      where: { id: id },
      include: {
        profile: {
          include: {
            projectAverages: true, // Include project averages through profile
          },
        },
        projects: true, // Include all projects
      },
    });

    if (!proUser) {
      return res.status(404).json({ message: 'Pro user not found' });
    }

    // Return the pro user data
    res.json(proUser);
  } catch (error) {
    console.error('Error fetching pro user:', error);
    res.status(500).json({
      message: 'Error fetching pro user details',
      error: error.message,
    });
  }
});

export default router;
