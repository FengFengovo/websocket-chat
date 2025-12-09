// 默认头像列表
const defaultAvatars = [
    'baimao.png',
    'bianmu.png',
    'buoumao.png',
    'cangao.png',
    'cangshu.png',
    'chaiquan.png',
    'fadou.png',
    'gengduomaochong.png',
    'gengduoquanzhong.png',
    'hashiqi.png',
    'heimao.png',
    'helanzhu.png',
    'jinmao.png',
    'jumao.png',
    'kedaya.png',
    'keji.png',
    'lachangquan.png',
    'lanmao.png',
    'nainiumao.png',
    'sanhuamao.png',
    'tianyuanquan.png',
    'wumaomao.png',
    'xianluomao.png',
    'yang.png'
]

/**
 * 获取随机默认头像路径
 * @returns {string} 头像路径
 */
export function getRandomDefaultAvatar() {
    const randomIndex = Math.floor(Math.random() * defaultAvatars.length)
    return `/icon/${defaultAvatars[randomIndex]}`
}

/**
 * 根据用户ID获取固定的默认头像（同一用户每次都是同一个头像）
 * @param {string} userId - 用户ID
 * @returns {string} 头像路径
 */
export function getDefaultAvatarByUserId(userId) {
    // 使用简单的哈希函数将userId转换为索引
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
        hash = ((hash << 5) - hash) + userId.charCodeAt(i)
        hash = hash & hash // 转换为32位整数
    }
    const index = Math.abs(hash) % defaultAvatars.length
    return `/icon/${defaultAvatars[index]}`
}
