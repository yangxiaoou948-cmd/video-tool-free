import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// 验证JWT token
function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('未提供认证token');
    }
    
    const token = authHeader.substring(7);
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
}

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        // 验证用户身份
        const decoded = verifyToken(req);
        const userId = decoded.userId;
        
        if (req.method === 'GET') {
            // 获取用户信息
            const { data: user, error } = await supabase
                .from('users')
                .select('id, username, email, user_type, daily_usage, total_usage, last_usage_date, subscription_end_date, created_at')
                .eq('id', userId)
                .single();
            
            if (error || !user) {
                return res.status(404).json({ error: '用户不存在' });
            }
            
            // 检查并重置每日使用次数
            const today = new Date().toISOString().split('T')[0];
            if (user.last_usage_date !== today) {
                await supabase
                    .from('users')
                    .update({
                        daily_usage: 0,
                        last_usage_date: today
                    })
                    .eq('id', userId);
                
                user.daily_usage = 0;
            }
            
            res.json(user);
            
        } else if (req.method === 'PUT') {
            // 更新用户信息
            const { username, user_type } = req.body;
            
            const updateData = {};
            if (username) updateData.username = username;
            if (user_type) updateData.user_type = user_type;
            
            const { data: updatedUser, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .select()
                .single();
            
            if (error) {
                return res.status(500).json({ error: '更新用户信息失败' });
            }
            
            res.json(updatedUser);
            
        } else {
            res.status(405).json({ error: '方法不允许' });
        }
        
    } catch (error) {
        console.error('用户管理错误:', error);
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ error: '无效的认证token' });
        } else {
            res.status(500).json({ error: '服务器内部错误' });
        }
    }
}
