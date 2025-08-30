const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total students
    const totalStudents = await prisma.student.count();
    
    // Get total enrollments
    const totalEnrollments = await prisma.enrollment.count();
    
    // Get active enrollments (started within last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const activeEnrollments = await prisma.enrollment.count({
      where: {
        startDate: {
          gte: sixMonthsAgo
        }
      }
    });
    
    // Get payment statistics
    const allPayments = await prisma.payment.findMany();
    
    const paymentStats = {
      totalAmount: allPayments.reduce((sum, p) => sum + p.amount, 0),
      paidAmount: allPayments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: allPayments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
      overdueAmount: allPayments.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0),
      totalPayments: allPayments.length,
      paidPayments: allPayments.filter(p => p.status === 'PAID').length,
      pendingPayments: allPayments.filter(p => p.status === 'PENDING').length,
      overduePayments: allPayments.filter(p => p.status === 'OVERDUE').length
    };
    
    // Get recent enrollments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEnrollments = await prisma.enrollment.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });
    
    // Get recent payments (last 30 days)
    const recentPayments = await prisma.payment.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });
    
    const stats = {
      students: {
        total: totalStudents,
        recentlyAdded: await prisma.student.count({
          where: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        })
      },
      enrollments: {
        total: totalEnrollments,
        active: activeEnrollments,
        recent: recentEnrollments
      },
      payments: paymentStats,
      recent: {
        enrollments: recentEnrollments,
        payments: recentPayments
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET /api/dashboard/recent-activities - Get recent activities
router.get('/recent-activities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent students
    const recentStudents = await prisma.student.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
    
    // Get recent enrollments
    const recentEnrollments = await prisma.enrollment.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.json({
      students: recentStudents,
      enrollments: recentEnrollments,
      payments: recentPayments
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

// GET /api/dashboard/course-stats - Get course enrollment statistics
router.get('/course-stats', async (req, res) => {
  try {
    const courseStats = await prisma.enrollment.groupBy({
      by: ['courseName'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    const formattedStats = courseStats.map(stat => ({
      courseName: stat.courseName,
      enrollmentCount: stat._count.id
    }));
    
    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching course stats:', error);
    res.status(500).json({ error: 'Failed to fetch course statistics' });
  }
});

// GET /api/dashboard/payment-trends - Get payment trends over time
router.get('/payment-trends', async (req, res) => {
  try {
    const { period = 'month' } = req.query; // 'week', 'month', 'year'
    
    let dateFormat;
    let dateRange;
    const now = new Date();
    
    switch (period) {
      case 'week':
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        dateRange = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // month
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const payments = await prisma.payment.findMany({
      where: {
        date: {
          gte: dateRange
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Group payments by date
    const paymentsByDate = {};
    payments.forEach(payment => {
      const dateKey = payment.date.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!paymentsByDate[dateKey]) {
        paymentsByDate[dateKey] = {
          date: dateKey,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          overdueAmount: 0,
          count: 0
        };
      }
      
      paymentsByDate[dateKey].totalAmount += payment.amount;
      paymentsByDate[dateKey].count += 1;
      
      switch (payment.status) {
        case 'PAID':
          paymentsByDate[dateKey].paidAmount += payment.amount;
          break;
        case 'PENDING':
          paymentsByDate[dateKey].pendingAmount += payment.amount;
          break;
        case 'OVERDUE':
          paymentsByDate[dateKey].overdueAmount += payment.amount;
          break;
      }
    });
    
    const trends = Object.values(paymentsByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    res.json(trends);
  } catch (error) {
    console.error('Error fetching payment trends:', error);
    res.status(500).json({ error: 'Failed to fetch payment trends' });
  }
});

// GET /api/dashboard/students-with-outstanding - Get students with outstanding payments
router.get('/students-with-outstanding', async (req, res) => {
  try {
    const studentsWithPayments = await prisma.student.findMany({
      include: {
        payments: {
          where: {
            OR: [
              { status: 'PENDING' },
              { status: 'OVERDUE' }
            ]
          }
        },
        enrollments: {
          select: {
            courseName: true,
            batch: true
          }
        }
      }
    });
    
    // Filter students who have outstanding payments
    const studentsWithOutstanding = studentsWithPayments
      .filter(student => student.payments.length > 0)
      .map(student => {
        const pendingAmount = student.payments
          .filter(p => p.status === 'PENDING')
          .reduce((sum, p) => sum + p.amount, 0);
        const overdueAmount = student.payments
          .filter(p => p.status === 'OVERDUE')
          .reduce((sum, p) => sum + p.amount, 0);
        
        return {
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          pendingAmount,
          overdueAmount,
          totalOutstanding: pendingAmount + overdueAmount,
          enrollments: student.enrollments,
          outstandingPayments: student.payments
        };
      })
      .sort((a, b) => b.totalOutstanding - a.totalOutstanding);
    
    res.json(studentsWithOutstanding);
  } catch (error) {
    console.error('Error fetching students with outstanding payments:', error);
    res.status(500).json({ error: 'Failed to fetch students with outstanding payments' });
  }
});

module.exports = router;

