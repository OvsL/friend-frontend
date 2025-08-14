// 应用常量定义

// 默认头像URL
export const DEFAULT_AVATAR_URL = 'https://img.yzcdn.cn/vant/cat.jpeg'

// 默认用户信息
export const DEFAULT_USER_INFO = {
  id: 0,
  userName: '',
  userAccount: '',
  avatarUrl: DEFAULT_AVATAR_URL,
  gender: 0,
  phone: '',
  email: '',
  createTime: new Date(),
  profile: ''
}

// 性别选项
export const GENDER_OPTIONS = [
  { label: '保密', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 }
]

// 性别文本映射
export const GENDER_TEXT_MAP = {
  0: '保密',
  1: '男',
  2: '女'
} 