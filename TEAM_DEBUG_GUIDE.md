# 团队功能调试指南

## 问题描述
团队创建功能测试失败，后端报错：`String teamName = teamAddRequest.getTeamName();`

## 已修复的问题

### 1. 字段名不匹配
**问题**: 前端发送的字段名是 `name`，但后端期望的是 `teamName`

**修复**: 
- 更新了 `TeamAddRequest` 类型定义，将 `name` 改为 `teamName`
- 更新了前端表单字段名
- 更新了测试数据

### 2. 当前字段映射
```typescript
// 前端发送的数据结构
{
  teamName: string,      // 团队名称
  description: string,   // 团队描述
  maxNum: number,        // 最大人数
  expireTime: Date,      // 过期时间
  status: number,        // 团队状态 (0-公开, 1-私有, 2-加密)
  password?: string      // 团队密码 (加密团队需要)
}
```

## 调试步骤

### 1. 检查网络请求
1. 打开浏览器开发者工具 (F12)
2. 切换到 Network 标签页
3. 访问团队测试页面 (`/test-team`)
4. 点击"单独测试创建团队"按钮
5. 查看发送的请求数据

### 2. 检查控制台日志
1. 在开发者工具中切换到 Console 标签页
2. 查看是否有错误信息
3. 查看发送的团队数据和响应数据

### 3. 验证字段名
确保发送的请求数据包含以下字段：
```json
{
  "teamName": "测试团队",
  "description": "这是一个测试团队", 
  "maxNum": 5,
  "status": 0
}
```

## 常见问题排查

### 1. 字段名错误
如果后端仍然报字段名错误，请检查：
- 后端 `TeamAddRequest` 类的字段名
- 前端发送的字段名是否完全匹配

### 2. 数据类型错误
确保发送的数据类型正确：
- `teamName`: string
- `description`: string  
- `maxNum`: number
- `status`: number
- `expireTime`: Date (可选)
- `password`: string (可选)

### 3. 必填字段缺失
确保所有必填字段都已提供：
- `teamName` (团队名称)
- `description` (团队描述)
- `maxNum` (最大人数)
- `status` (团队状态)

## 测试建议

1. **使用测试页面**: 访问 `/test-team` 页面进行测试
2. **查看详细日志**: 测试页面会显示详细的请求和响应信息
3. **逐步调试**: 先测试获取团队列表，再测试创建团队
4. **检查后端日志**: 查看后端服务器的错误日志

## 联系支持

如果问题仍然存在，请提供：
1. 浏览器控制台的完整错误信息
2. 网络请求的详细信息
3. 后端服务器的错误日志
4. 后端 `TeamAddRequest` 类的完整定义
