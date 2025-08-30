const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/payments - Get all payments with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, method, studentId, dateFrom, dateTo } = req.query;
    
    let where = {};
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (method) {
      where.method = method.toUpperCase();
    }
    
    if (studentId) {
      where.studentId = studentId;
    }
    
    // Date range filtering
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }
    
    const payments = await prisma.payment.findMany({
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
      orderBy: { date: 'desc' }
    });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// GET /api/payments/:id - Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await prisma.payment.findUnique({
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
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// POST /api/payments - Create new payment
router.post('/', async (req, res) => {
  try {
    const { amount, date, method, status, studentId } = req.body;
    
    // Validate required fields
    if (!amount || !date || !method || !studentId) {
      return res.status(400).json({ 
        error: 'Amount, date, method, and student ID are required' 
      });
    }
    
    // Validate amount is positive
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Validate payment method
    const validMethods = ['CASH', 'CARD', 'BANK_TRANSFER', 'UPI', 'OTHER'];
    if (!validMethods.includes(method.toUpperCase())) {
      return res.status(400).json({ 
        error: 'Invalid payment method. Valid methods: ' + validMethods.join(', ') 
      });
    }
    
    // Validate payment status
    const validStatuses = ['PENDING', 'PAID', 'OVERDUE'];
    const paymentStatus = status ? status.toUpperCase() : 'PENDING';
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        error: 'Invalid payment status. Valid statuses: ' + validStatuses.join(', ') 
      });
    }
    
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        date: new Date(date),
        method: method.toUpperCase(),
        status: paymentStatus,
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
    
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// PUT /api/payments/:id - Update payment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date, method, status } = req.body;
    
    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id }
    });
    
    if (!existingPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be positive' });
      }
      updateData.amount = parseFloat(amount);
    }
    
    if (date !== undefined) {
      updateData.date = new Date(date);
    }
    
    if (method !== undefined) {
      const validMethods = ['CASH', 'CARD', 'BANK_TRANSFER', 'UPI', 'OTHER'];
      if (!validMethods.includes(method.toUpperCase())) {
        return res.status(400).json({ 
          error: 'Invalid payment method. Valid methods: ' + validMethods.join(', ') 
        });
      }
      updateData.method = method.toUpperCase();
    }
    
    if (status !== undefined) {
      const validStatuses = ['PENDING', 'PAID', 'OVERDUE'];
      if (!validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({ 
          error: 'Invalid payment status. Valid statuses: ' + validStatuses.join(', ') 
        });
      }
      updateData.status = status.toUpperCase();
    }
    
    const payment = await prisma.payment.update({
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
    
    res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// DELETE /api/payments/:id - Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id }
    });
    
    if (!existingPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    await prisma.payment.delete({
      where: { id }
    });
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// GET /api/payments/student/:studentId/summary - Get payment summary for a student
router.get('/student/:studentId/summary', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const payments = await prisma.payment.findMany({
      where: { studentId },
      orderBy: { date: 'desc' }
    });
    
    const summary = {
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      paidAmount: payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
      overdueAmount: payments.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0),
      paymentCount: payments.length,
      lastPaymentDate: payments.length > 0 ? payments[0].date : null,
      payments: payments
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({ error: 'Failed to fetch payment summary' });
  }
});

// PUT /api/payments/:id/status - Update payment status only
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const validStatuses = ['PENDING', 'PAID', 'OVERDUE'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ 
        error: 'Invalid payment status. Valid statuses: ' + validStatuses.join(', ') 
      });
    }
    
    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id }
    });
    
    if (!existingPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const payment = await prisma.payment.update({
      where: { id },
      data: { status: status.toUpperCase() },
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
    
    res.json(payment);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

module.exports = router;

