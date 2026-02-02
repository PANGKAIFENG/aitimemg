const http = require('http');
const TableStore = require('tablestore');

// 配置
const client = new TableStore.Client({
    accessKeyId: process.env.ACCESS_KEY_ID,
    accessKeySecret: process.env.ACCESS_KEY_SECRET,
    endpoint: 'https://temporal-db.cn-hangzhou.ots.aliyuncs.com',
    instancename: 'temporal-db',
});

// CORS 响应头 - 已限制为前端域名
const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://www.aitimemg.cn',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

// 获取所有数据
async function getAll(tableName) {
    const params = {
        tableName,
        direction: TableStore.Direction.FORWARD,
        inclusiveStartPrimaryKey: [{ id: TableStore.INF_MIN }],
        exclusiveEndPrimaryKey: [{ id: TableStore.INF_MAX }],
    };

    const result = await client.getRange(params);
    const items = result.rows.map(row => {
        const item = {};
        row.primaryKey.forEach(pk => { item[pk.name] = pk.value; });
        row.attributes.forEach(attr => {
            let value = attr.columnValue;
            // 尝试解析 JSON
            if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                try { value = JSON.parse(value); } catch (e) { }
            }
            item[attr.columnName] = value;
        });
        return item;
    });

    return items;
}

// 保存数据
async function putItem(tableName, item) {
    const { id, ...rest } = item;
    const attributeColumns = Object.entries(rest).map(([key, value]) => ({
        [key]: value === null ? '' : (typeof value === 'object' ? JSON.stringify(value) : String(value)),
    }));

    const params = {
        tableName,
        condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
        primaryKey: [{ id }],
        attributeColumns,
    };

    await client.putRow(params);
    return item;
}

// 删除数据
async function deleteItem(tableName, id) {
    const params = {
        tableName,
        condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
        primaryKey: [{ id }],
    };

    await client.deleteRow(params);
    return { success: true };
}

// 解析请求体
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
    const { method, url } = req;

    // 设置 CORS 头
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    // 处理 OPTIONS 预检请求
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        // 解析路径: /api/tasks 或 /api/tasks/{id}
        const pathParts = url.split('?')[0].split('/').filter(Boolean);
        const resource = pathParts[1]; // tasks, schedules, sync, keep-warm
        const id = pathParts[2]; // 可选的 ID

        // 保活请求（定时触发器调用）
        if (resource === 'keep-warm') {
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'warm', timestamp: new Date().toISOString() }));
            return;
        }

        // 合并同步接口（一次返回所有数据）
        if (resource === 'sync') {
            const [tasks, schedules] = await Promise.all([
                getAll('tasks'),
                getAll('schedules')
            ]);
            res.writeHead(200);
            res.end(JSON.stringify({ tasks, schedules }));
            return;
        }

        if (!resource || !['tasks', 'schedules'].includes(resource)) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Resource not found', path: url }));
            return;
        }

        let result;

        switch (method) {
            case 'GET':
                result = await getAll(resource);
                break;

            case 'POST':
            case 'PUT':
                const data = await parseBody(req);
                result = await putItem(resource, data);
                break;

            case 'DELETE':
                if (!id) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'ID required for delete' }));
                    return;
                }
                result = await deleteItem(resource, id);
                break;

            default:
                res.writeHead(405);
                res.end(JSON.stringify({ error: 'Method not allowed' }));
                return;
        }

        res.writeHead(200);
        res.end(JSON.stringify(result));
    } catch (error) {
        console.error('Error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
    }
});

// 监听端口
const PORT = process.env.FC_SERVER_PORT || 9000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
