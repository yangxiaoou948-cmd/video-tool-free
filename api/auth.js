import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'POST') {
        const { action, username, email, password } = req.body;
        
        try {
            if (action === 'register' || req.url.includes('/register')) {
                // 用户注册
                if (!username || !email || !password) {
                    return res.status(400).json({ error: '请填写所有必填字段' });
                }
                
                // 检查邮箱是否已存在
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', email)
                    .single();
                
                if (existingUser) {
                    return res.status(400).json({ error: '该邮箱已被注册' });
                }
                
                // 加密密码
                const passwordHash = await bcrypt.hash(password, 10);
                
                // 创建用户
                const { data: newUser, error } = await supabase
                    .from('users')
                    .insert({
                        username,
                        email,
                        password_hash: passwordHash,
                        user_type: 'free',
                        daily_usage: 0
                    })
                    .select()
                    .single();
                
                if (error) {
                    console.error('创建用户失败:', error);
                    return res.status(500).json({ error: '注册失败，请稍后重试' });
                }
                
                // 生成JWT token
                const token = jwt.sign(
                    { userId: newUser.id, email: newUser.email },
                    process.env.JWT_SECRET || 'default-secret',
                    { expiresIn: '30d' }
                );
                
                res.json({
                    token,
                    user: {
                        id: newUser.id,
                        username: newUser.username,
                        email: newUser.email,
                        user_type: newUser.user_type,
                        daily_usage: newUser.daily_usage
                    }
                });
                
            } else if (action === 'login' || req.url.includes('/login')) {
                // 用户登录
                if (!email || !password) {
                    return res.status(400).json({ error: '请输入邮箱和密码' });
                }
                
                // 查找用户
                const { data: user, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .single();
                
                if (error || !user) {
                    return res.status(401).json({ error: '邮箱或密码错误' });
                }
                
                // 验证密码
                const isValidPassword = await bcrypt.compare(password, user.password_hash);
                if (!isValidPassword) {
                    return res.status(401).json({ error: '邮箱或密码错误' });
                }
                
                // 重置每日使用次数（如果是新的一天）
                const today = new Date().toISOString().split('T')[0];
                const lastUsageDate = user.last_usage_date;
                
                if (lastUsageDate !== today) {
                    await supabase
                        .from('users')
                        .update({
                            daily_usage: 0,
                            last_usage_date: today
                        })
                        .eq('id', user.id);
                    
                    user.daily_usage = 0;
                }
                
                // 生成JWT token
                const token = jwt.sign(
                    { userId: user.id, email: user.email },
                    process.env.JWT_SECRET || 'default-secret',
                    { expiresIn: '30d' }
                );
                
                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        user_type: user.user_type,
                        daily_usage: user.daily_usage
                    }
                });
                
            } else {
                res.status(400).json({ error: '无效的操作' });
            }
            
        } catch (error) {
            console.error('认证错误:', error);
            res.status(500).json({ error: '服务器内部错误' });
        }
    } else {
        res.status(405).json({ error: '方法不允许' });
    }
}
