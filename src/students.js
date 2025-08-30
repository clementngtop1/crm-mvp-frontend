const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for CSV uploads
const upload = multer({ dest: 'uploads/' });

// GET /api/students - Get all students with optional filtering
router.get('/', async (req, res) => {
  try {
    const { course, status, search } = req.query;
    
    let where = {};
    
    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const students = await prisma.student.findMany({
      where,
      include: {
        enrollments: true,
        payments: {
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Filter by course if specified
    let filteredStudents = students;
    if (course) {
      filteredStudents = students.filter(student => 
        student.enrollments.some(enrollment => 
          enrollment.courseName.toLowerCase().includes(course.toLowerCase())
        )
      );
    }
    
    // Filter by payment status if specified
    if (status) {
      filteredStudents = filteredStudents.filter(student => {
        const totalPaid = student.payments
          .filter(p => p.status === 'PAID')
          .reduce((sum, p) => sum + p.amount, 0);
        const totalPending = student.payments
          .filter(p => p.status === 'PENDING')
          .reduce((sum, p) => sum + p.amount, 0);
        
        if (status === 'paid') return totalPaid > 0 && totalPending === 0;
        if (status === 'pending') return totalPending > 0;
        if (status === 'overdue') return student.payments.some(p => p.status === 'OVERDUE');
        return true;
      });
    }
    
    res.json(filteredStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/students/:id - Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          orderBy: { startDate: 'desc' }
        },
        payments: {
          orderBy: { date: 'desc' }
        }
      }
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// POST /api/students - Create new student
router.post('/', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Check if email already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email }
    });
    
    if (existingStudent) {
      return res.status(400).json({ error: 'Student with this email already exists' });
    }
    
    const student = await prisma.student.create({
      data: { name, email, phone },
      include: {
        enrollments: true,
        payments: true
      }
    });
    
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// PUT /api/students/:id - Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    });
    
    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check if email is being changed and if it conflicts with another student
    if (email && email !== existingStudent.email) {
      const emailConflict = await prisma.student.findUnique({
        where: { email }
      });
      
      if (emailConflict) {
        return res.status(400).json({ error: 'Student with this email already exists' });
      }
    }
    
    const student = await prisma.student.update({
      where: { id },
      data: { name, email, phone },
      include: {
        enrollments: true,
        payments: true
      }
    });
    
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// DELETE /api/students/:id - Delete student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    });
    
    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    await prisma.student.delete({
      where: { id }
    });
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// POST /api/students/bulk-import - Import students from CSV
router.post('/bulk-import', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }
    
    const results = [];
    const errors = [];
    
    // Read and parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        let imported = 0;
        let skipped = 0;
        
        for (const row of results) {
          try {
            const { name, email, phone } = row;
            
            // Validate required fields
            if (!name || !email) {
              errors.push(`Row skipped: Missing name or email - ${JSON.stringify(row)}`);
              skipped++;
              continue;
            }
            
            // Check if student already exists
            const existingStudent = await prisma.student.findUnique({
              where: { email: email.toLowerCase().trim() }
            });
            
            if (existingStudent) {
              errors.push(`Student with email ${email} already exists`);
              skipped++;
              continue;
            }
            
            // Create student
            await prisma.student.create({
              data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                phone: phone?.trim() || null
              }
            });
            
            imported++;
          } catch (error) {
            errors.push(`Error importing row: ${error.message} - ${JSON.stringify(row)}`);
            skipped++;
          }
        }
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({
          message: 'Bulk import completed',
          imported,
          skipped,
          errors: errors.length > 0 ? errors : undefined
        });
      });
  } catch (error) {
    console.error('Error importing students:', error);
    res.status(500).json({ error: 'Failed to import students' });
  }
});

module.exports = router;

