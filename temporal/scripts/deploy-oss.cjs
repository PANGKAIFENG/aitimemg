// 阿里云 OSS 部署脚本
require('dotenv').config({ path: '.env.local' })
const OSS = require('ali-oss')
const fs = require('fs')
const path = require('path')

// 配置信息（从环境变量读取）
const client = new OSS({
    region: 'oss-cn-hangzhou',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: 'temporal-app-nick',
})

const DIST_DIR = path.join(__dirname, '../dist')

// 设置正确的 Content-Type
function getContentType(filename) {
    const ext = path.extname(filename).toLowerCase()
    const types = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
    }
    return types[ext] || 'application/octet-stream'
}

// 递归获取目录下所有文件
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
        const filePath = path.join(dir, file)
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList)
        } else {
            fileList.push(filePath)
        }
    }
    return fileList
}

async function deploy() {
    console.log('🚀 开始部署到阿里云 OSS...\n')

    if (!fs.existsSync(DIST_DIR)) {
        console.error('❌ dist 目录不存在，请先运行 npm run build')
        process.exit(1)
    }

    const files = getAllFiles(DIST_DIR)
    console.log(`📦 共 ${files.length} 个文件待上传\n`)

    let uploaded = 0
    let failed = 0

    for (const file of files) {
        const ossPath = path.relative(DIST_DIR, file).replace(/\\\\/g, '/')
        const contentType = getContentType(file)

        try {
            await client.put(ossPath, file, {
                mime: contentType,
                headers: {
                    'Content-Disposition': 'inline',
                    'Cache-Control': ossPath.includes('assets/')
                        ? 'max-age=31536000' // 静态资源缓存1年
                        : 'no-cache', // HTML 不缓存
                },
            })
            console.log(`✅ ${ossPath} (${contentType})`)
            uploaded++
        } catch (err) {
            console.error(`❌ ${ossPath}: ${err.message}`)
            failed++
        }
    }

    console.log(`\n📊 上传完成: ${uploaded} 成功, ${failed} 失败`)
    console.log(`\n🌐 访问地址: https://temporal-app-nick.oss-cn-hangzhou.aliyuncs.com/index.html`)
}

deploy().catch(console.error)
