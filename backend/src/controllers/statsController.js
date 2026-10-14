const { db } = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    // KPI counts
    const totalAssetsRes = await db.prepare('SELECT COUNT(*) as count FROM assets').get();
    const totalAssets = totalAssetsRes ? totalAssetsRes.count : 0;

    const faultyRes = await db.prepare("SELECT COUNT(*) as count FROM assets WHERE status = 'arizali'").get();
    const faultyAssets = faultyRes ? faultyRes.count : 0;

    const idleRes = await db.prepare("SELECT COUNT(*) as count FROM assets WHERE status = 'depoda'").get();
    const idleAssets = idleRes ? idleRes.count : 0;

    const assignedRes = await db.prepare("SELECT COUNT(*) as count FROM assets WHERE status = 'zimmetli'").get();
    const assignedAssets = assignedRes ? assignedRes.count : 0;

    const maintRes = await db.prepare("SELECT COUNT(*) as count FROM assets WHERE status = 'bakimda'").get();
    const maintenanceAssets = maintRes ? maintRes.count : 0;

    const usersRes = await db.prepare("SELECT COUNT(*) as count FROM users WHERE is_active = 1").get();
    const totalUsers = usersRes ? usersRes.count : 0;

    // Categories breakdown
    const categoryStats = await db.prepare(`
      SELECT category, COUNT(*) as count
      FROM assets
      GROUP BY category
      ORDER BY count DESC
    `).all();

    // Status breakdown
    const statusStats = await db.prepare(`
      SELECT status, COUNT(*) as count
      FROM assets
      GROUP BY status
    `).all();

    // Department breakdown of assigned assets
    const departmentStats = await db.prepare(`
      SELECT u.department, COUNT(a.id) as count
      FROM assets a
      JOIN users u ON a.assigned_to_user_id = u.id
      GROUP BY u.department
      ORDER BY count DESC
    `).all();

    // Recent activities (audit logs)
    const recentLogs = await db.prepare(`
      SELECT 
        l.id, l.action, l.details, l.created_at,
        u.full_name as user_name, u.email as user_email,
        a.asset_code, a.name as asset_name
      FROM audit_logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN assets a ON l.asset_id = a.id
      ORDER BY l.created_at DESC
      LIMIT 8 OFFSET 0
    `).all();

    // Recent assignments
    const recentAssignments = await db.prepare(`
      SELECT 
        asg.id, asg.assigned_date, asg.status,
        a.name as asset_name, a.asset_code, a.category,
        u.full_name as user_name, u.department
      FROM assignments asg
      JOIN assets a ON asg.asset_id = a.id
      JOIN users u ON asg.user_id = u.id
      ORDER BY asg.assigned_date DESC
      LIMIT 5 OFFSET 0
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
