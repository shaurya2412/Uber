const redisService = require('../services/redis.service');

class CronController {
    constructor() {
        this.initializeRedis();
    }

    async initializeRedis() {
        try {
            await redisService.connect();
        } catch (error) {
            console.error('Failed to initialize Redis:', error);
        }
    }

    // Handle cron job data
    async handleCronData(req, res) {
        try {
            const { values } = req.body; // Your 4-5 values from cron job
            
            if (!values || !Array.isArray(values)) {
                return res.status(400).json({
                    success: false,
                    message: 'Values array is required'
                });
            }

            // Generate unique key for this cron execution
            const cronKey = `cron:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
            
            // Store the data in Redis with 24-hour TTL
            await redisService.storeCronData(cronKey, {
                values: values,
                timestamp: Date.now(),
                source: 'cron-job'
            });

            res.status(200).json({
                success: true,
                message: 'Cron data stored successfully',
                key: cronKey,
                expiresIn: '24 hours'
            });

        } catch (error) {
            console.error('Error handling cron data:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to store cron data',
                error: error.message
            });
        }
    }

    // Retrieve specific cron data
    async getCronData(req, res) {
        try {
            const { key } = req.params;
            
            if (!key) {
                return res.status(400).json({
                    success: false,
                    message: 'Key is required'
                });
            }

            const data = await redisService.getCronData(key);
            
            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: 'Data not found or expired'
                });
            }

            res.status(200).json({
                success: true,
                data: data
            });

        } catch (error) {
            console.error('Error retrieving cron data:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve cron data',
                error: error.message
            });
        }
    }

    // Get all cron data
    async getAllCronData(req, res) {
        try {
            const allData = await redisService.getAllCronData();
            
            res.status(200).json({
                success: true,
                data: allData,
                count: Object.keys(allData).length
            });

        } catch (error) {
            console.error('Error retrieving all cron data:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve all cron data',
                error: error.message
            });
        }
    }

    // Get Redis health status
    async getHealthStatus(req, res) {
        try {
            const health = await redisService.healthCheck();
            
            res.status(200).json({
                success: true,
                health: health
            });

        } catch (error) {
            console.error('Error checking health:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check health status',
                error: error.message
            });
        }
    }

    // Get statistics
    async getStats(req, res) {
        try {
            const stats = await redisService.getStats();
            
            res.status(200).json({
                success: true,
                stats: stats
            });

        } catch (error) {
            console.error('Error getting stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get statistics',
                error: error.message
            });
        }
    }
}

module.exports = new CronController(); 