const pool = require('../config/db.js');

const getHealth = async (req, res) => {
    const start = Date.now();

    try {
        const dbStart = Date.now();
        const dbResult = await pool.query('SELECT 1');
        const dbTime = Date.now() - dbStart;

        return res.status(200).json({
            success: true,
            status: "OK",
            message: "Server is healthy 🚀",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            services: {
                server: "running",
                database: dbResult ? "connected" : "disconnected"
            },
            performance: {
                apiResponseTime: `${Date.now() - start} ms`,
                dbResponseTime: `${dbTime} ms`
            }
        });

    } catch (error) {
        console.error("Health check failed:", error);

        return res.status(500).json({
            success: false,
            status: "DOWN",
            message: "Something is wrong ❌",
            error: error.message,
            services: {
                server: "running",
                database: "disconnected"
            }
        });
    }
};

module.exports = {
    getHealth
};