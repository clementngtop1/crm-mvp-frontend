const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/enrollments - Get all enrollments with optional filtering
router.get('/', async (req, res) => {
  try {
    const { course, batch, studentId } = req.query;
    
    let where = {};
    
    if (course) {
      where.courseName = { contains: course, mode: 'insensitive' };
    }
    
    if (batch) {
      where.batch = { contains: batch, mode: 'insensitive' };
    }
    
    if (studentId) {
      where.studentId = studentId;
    }
    
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });
    
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// GET /api/enrollments/:id - Get enrollment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    res.json(enrollment);
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    res.status(500).json({ error: 'Failed to fetch enrollment' });
  }
});

// POST /api/enrollments - Create new enrollment
router.post('/', async (req, res) => {
  try {
    const { courseName, batch, startDate, studentId } = req.body;
    
    // Validate required fields
    if (!courseName || !startDate || !studentId) {
      return res.status(400).json({ 
        error: 'Course name, start date, and student ID are required' 
      });
    }
    
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check if student is already enrolled in the same course and batch
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId,
        courseName: { equals: courseName, mode: 'insensitive' },
        batch: batch || null
      }
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ 
        error: 'Student is already enrolled in this course and batch' 
      });
    }
    
    const enrollment = await prisma.enrollment.create({
      data: {
        courseName,
        batch,
        startDate: new Date(startDate),
        studentId
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
    
    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({ error: 'Failed to create enrollment' });
  }
});

// PUT /api/enrollments/:id - Update enrollment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { courseName, batch, startDate } = req.body;
    
    // Check if enrollment exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id }
    });
    
    if (!existingEnrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    // Prepare update data
    const updateData = {};
    if (courseName !== undefined) updateData.courseName = courseName;
    if (batch !== undefined) updateData.batch = batch;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
    
    res.json(enrollment);
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ error: 'Failed to update enrollment' });
  }
});

// DELETE /api/enrollments/:id - Delete enrollment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if enrollment exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id }
    });
    
    if (!existingEnrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    await prisma.enrollment.delete({
      where: { id }
    });
    
    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    res.status(500).json({ error: 'Failed to delete enrollment' });
  }
});

// GET /api/enrollments/courses/list - Get list of unique courses
router.get('/courses/list', async (req, res) => {
  try {
    const courses = await prisma.enrollment.findMany({
      select: {
        courseName: true
      },
      distinct: ['courseName'],
      orderBy: {
        courseName: 'asc'
      }
    });
    
    const courseList = courses.map(c => c.courseName);
    res.json(courseList);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/enrollments/batches/list - Get list of unique batches
router.get('/batches/list', async (req, res) => {
  try {
    const batches = await prisma.enrollment.findMany({
      select: {
        batch: true
      },
      where: {
        batch: {
          not: null
        }
      },
      distinct: ['batch'],
      orderBy: {
        batch: 'asc'
      }
    });
    
    const batchList = batches.map(b => b.batch);
    res.json(batchList);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

module.exports = router;

