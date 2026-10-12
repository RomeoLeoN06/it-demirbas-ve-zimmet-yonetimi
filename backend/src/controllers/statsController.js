const { db } = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    // KPI counts
    const totalAssets = db.prepare('SELECT COUNT(*) as count FROM assets').get().count;
    const faultyAssets = db.prepare("SELECT COUNT(*) as count FROM assets WHERE status = 'arizali'").get().count;
    const idleAssets = db.prepare("SELECT COUNT(*) as count FROM assets WHERE status = 'depoda'").get().count;
    const assignedAssets = db.prepare("SELECT COUNT(*) as count FROM assets WHERE status = 'zimmetli'").get().count;
    const maintenanceAssets = db.prepare("SELECT COUNT(*) as count FROM assets WHERE status = 'bakimda'").get().count;
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_active = 1").get().count;

    // Categories breakdown
    const categoryStats = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM assets
      GROUP BY category
      ORDER BY count DESC
    `).all();

    // Status breakdown
    const statusStats = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM assets
      GROUP BY status
    `).all();

    // Department breakdown of assigned assets
    const departmentStats = db.prepare(`
      SELECT u.department, COUNT(a.id) as count
      FROM assets a
      JOIN users u ON a.assigned_to_user_id = u.id
      GROUP BY u.department
      ORDER BY count DESC
    `).all();

    // Recent activities (audit logs)
    const recentLogs = db.prepare(`
      SELECT 
        l.id, l.action, l.details, l.created_at,
        u.full_name as user_name, u.email as user_email,
        a.asset_code, a.name as asset_name
      FROM audit_logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN assets a ON l.asset_id = a.id
      ORDER BY l.created_at DESC
      LIMIT 8
    `).all();

    // Recent assignments
    const recentAssignments = db.prepare(`
      SELECT 
        asg.id, asg.assigned_date, asg.status,
        a.name as asset_name, a.asset_code, a.category,
        u.full_name as user_name, u.department
      FROM assignments asg
      JOIN assets a ON asg.asset_id = a.id
      JOIN users u ON asg.user_id = u.id
      ORDER BY asg.assigned_date DESC
      LIMIT 5
    `).all();

    return res.json({
      success: true,
      stats: {
        totalAssets,
        faultyAssets,
        idleAssets,
        assignedAssets,
        maintenanceAssets,
        totalUsers,
        categoryStats,
        statusStats,
        departmentStats,
        recentLogs,
        recentAssignments
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'İstatistikler alınamadı.' });
  }
}

module.exports = {
  getDashboardStats
};
