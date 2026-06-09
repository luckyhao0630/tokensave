import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
            "features": "Features",
            "pricing": "Pricing",
            "guide": "Guide",
            "docs": "Docs",
            "contact": "Contact",
            "login": "Login",
            "start": "Get Started",
            "dashboard": "Dashboard"
      },
      "hero": {
            "badge": "Based on 14k+ Stars Open Source Project",
            "title": "Reduce LLM Costs by",
            "highlight": "60-95%",
            "subtitle": "Smart Token Compression. Same AI Quality. Half the Cost.",
            "cta_primary": "Get Started Free",
            "cta_secondary": "View Docs",
            "stat1": "Avg Compression",
            "stat2": "Developers",
            "stat3": "Cost Savings"
      },
      "promo": {
            "title": "Limited Time Free",
            "message": "All Pro features free until 2026-07-08"
      },
      "guide": {
            "title": "5-Minute Quick Start",
            "subtitle": "No tech skills needed, follow the steps",
            "step1": "Register Account",
            "step2": "Create API Key",
            "step3": "Replace API URL",
            "step4": "Start Saving"
      },
      "pricing": {
            "title": "Choose Your Plan",
            "subtitle": "From solo developers to enterprise teams",
            "monthly": "Monthly",
            "yearly": "Yearly",
            "save": "Save 20%",
            "free": "Free",
            "pro": "Pro",
            "team": "Team",
            "enterprise": "Enterprise",
            "cta_free": "Use Free",
            "cta_pro": "Try Free",
            "cta_team": "Try Free",
            "cta_enterprise": "Contact Sales",
            "trial": "Free trial, cancel anytime",
            "limited_free": "Limited Time Free - All Pro Features",
            "free_desc": "For personal developers getting started",
            "pro_desc": "For professional developers",
            "team_desc": "For small teams",
            "enterprise_desc": "For large enterprises",
            "yearly_price": "per year",
            "checkout_error": "Failed to create checkout",
            "features": {
                  "requests": "requests/day",
                  "unlimited": "Unlimited",
                  "basic": "Basic compression",
                  "advanced": "Advanced compression",
                  "api": "API access",
                  "support": "Priority support"
            }
      },
      "contact": {
            "title": "Contact Us",
            "subtitle": "Questions or suggestions? We are here",
            "name": "Name",
            "name_placeholder": "Your name",
            "email": "Email",
            "email_placeholder": "you@example.com",
            "type": "Type",
            "subject": "Subject",
            "subject_placeholder": "Brief description",
            "message": "Message",
            "message_placeholder": "Detailed description of your question or suggestion",
            "submit": "Send Message",
            "submit_error": "Failed to send message, please try again",
            "sending": "Sending...",
            "success": "Message Sent",
            "success_desc": "We will reply as soon as possible",
            "types": {
                  "support": "Technical Support",
                  "feedback": "Feedback",
                  "bug": "Bug Report",
                  "feature": "Feature Request",
                  "business": "Business"
            }
      },
      "footer": {
            "terms": "Terms",
            "privacy": "Privacy",
            "refund": "Refund"
      },
      "common": {
            "loading": "Loading...",
            "error": "Error",
            "retry": "Retry",
            "back": "Back",
            "logout": "Logout"
      },
      "dashboard": {
            "title": "Dashboard",
            "total_requests": "Total Requests",
            "tokens_saved": "Tokens Saved",
            "cost_saved": "Cost Saved",
            "compression_ratio": "Avg Compression",
            "daily_quota": "Daily Quota",
            "monthly_quota": "Monthly Quota",
            "remaining": "Remaining",
            "exhausted": "Exhausted",
            "user_info": "User Info",
            "email": "Email",
            "plan": "Plan",
            "api_key_mgmt": "API Key Management",
            "api_key_name": "API Key Name",
            "create": "Create",
            "new_key_created": "New API Key created (please save):",
            "got_it": "Got it",
            "delete": "Delete",
            "no_api_keys": "No API Keys yet",
            "quick_start": "Quick Start",
            "upgrade_plan": "Upgrade Plan",
            "new_key_name": "New Key"
      },
      "login": {
            "title": "Login",
            "subtitle": "Welcome back, please login to your account",
            "email": "Email",
            "password": "Password",
            "name": "Name",
            "name_placeholder": "Your name",
            "password_placeholder": "At least 8 characters",
            "submit": "Login",
            "go_register": "Register Now",
            "go_login": "Go Login",
            "has_account": "Already have an account?",
            "no_account": "No account yet?",
            "agree_terms": "By logging in, you agree to our Terms and Privacy Policy"
      },
      "register": {
            "title": "Create Account",
            "subtitle": "Start using TokenSaver for free, save LLM costs",
            "submit": "Create Account",
            "agree": "I agree to",
            "and": "and",
            "github_signup": "Sign up with GitHub (Coming soon)",
            "google_signup": "Sign up with Google (Coming soon)",
            "or_email": "Or use email"
      },
      "terms": {
            "title": "Terms of Service",
            "updated": "Last Updated",
            "section1_title": "1. Service Description",
            "section1_desc": "TokenSaver provides LLM token compression services. By using our service, you agree to these terms.",
            "section2_title": "2. User Responsibilities",
            "section2_desc": "Users are responsible for maintaining account security and complying with applicable laws.",
            "section3_title": "3. Service Limitations",
            "section3_desc": "We strive to provide stable service but do not guarantee 100% availability.",
            "section4_title": "4. Account Termination",
            "contact_btn": "Contact Support",
            "contact_desc": "If you have any questions about these terms, please contact us"
      },
      "privacy": {
            "title": "Privacy Policy",
            "updated": "Last Updated",
            "section1_title": "1. Information Collection",
            "section1_desc": "We collect necessary information to provide our services, including email and usage data.",
            "section2_title": "2. Information Usage",
            "section2_desc": "We use your information to provide, maintain, and improve our services.",
            "section3_title": "3. Information Protection",
            "section3_desc": "We implement security measures to protect your personal information.",
            "section4_title": "4. Data Sharing",
            "section4_desc": "We do not sell your personal information to third parties.",
            "section5_title": "5. Contact Us",
            "contact_btn": "Contact Support",
            "contact_desc": "If you have any questions about privacy, please contact us"
      },
      "refund": {
            "title": "Refund Policy",
            "updated": "Last Updated",
            "section1_title": "1. Refund Conditions",
            "section1_desc": "We provide refunds under the following conditions:",
            "section2_title": "2. Refund Process",
            "section2_desc": "Contact us within 7 days of purchase to request a refund.",
            "section3_title": "3. Non-Refundable Cases",
            "section3_desc": "The following cases are not eligible for refund:",
            "section4_title": "4. Refund Method",
            "section4_desc": "Refunds will be processed to the original payment method within 5-10 business days.",
            "section5_title": "5. Contact Us",
            "condition1": "Service unavailable for more than 24 hours",
            "condition2": "Significant discrepancy between service description and actual functionality",
            "condition3": "Technical issues that cannot be resolved within 7 days",
            "contact_btn": "Contact Support",
            "contact_desc": "If you have any questions about refund, please contact us"
      },
      "profile": {
            "title": "Profile",
            "info": "User Info",
            "api_keys": "My API Keys",
            "feedback": "My Feedback",
            "update_name": "Update Name",
            "change_password": "Change Password",
            "current_password": "Current Password",
            "new_password": "New Password",
            "confirm_password": "Confirm Password",
            "update_success": "Profile updated successfully",
            "update_failed": "Failed to update profile",
            "password_mismatch": "Passwords do not match",
            "password_too_short": "Password must be at least 8 characters",
            "password_changed": "Password changed successfully, please login again",
            "password_change_failed": "Failed to change password"
      },
      "docs": {
            "title": "Documentation",
            "api_url": "API URL",
            "compression": "Compression API",
            "authentication": "Authentication",
            "quick_start": "Quick Start",
            "examples": "Examples"
      },
      "admin": {
            "title": "Admin Dashboard",
            "users": "Users",
            "stats": "Statistics",
            "messages": "Messages",
            "login_title": "Admin Login",
            "login_subtitle": "Admin access only",
            "admin_only": "You do not have admin privileges",
            "front_login": "User Login"
      },
      "admin_login": {
            "title": "Admin Login",
            "subtitle": "Admin access only. Regular users please visit",
            "email": "Admin Email",
            "password": "Password",
            "submit": "Admin Login",
            "front_login": "User Login",
            "not_admin": "Not an admin?",
            "footer": "TokenSaver Admin · Authorized access only"
      }
}
  },
  zh: {
    translation: {
      "nav": {
            "features": "功能",
            "pricing": "定价",
            "guide": "教程",
            "docs": "文档",
            "contact": "联系",
            "login": "登录",
            "start": "开始使用",
            "dashboard": "进入 Dashboard"
      },
      "hero": {
            "badge": "基于 GitHub 14k+ Stars 开源项目",
            "title": "让 LLM 费用降低",
            "highlight": "60-95%",
            "subtitle": "智能压缩 Token，不改变 AI 回答质量。一行代码接入，立即节省一半以上成本。",
            "cta_primary": "免费开始",
            "cta_secondary": "查看文档",
            "stat1": "平均压缩率",
            "stat2": "开发者使用",
            "stat3": "费用节省"
      },
      "promo": {
            "title": "限时免费活动",
            "message": "所有 Pro 功能免费体验至 2026-07-08"
      },
      "guide": {
            "title": "5分钟快速上手",
            "subtitle": "不需要懂技术，跟着步骤做，轻松省钱",
            "step1": "注册账号",
            "step2": "创建 API Key",
            "step3": "替换 API 地址",
            "step4": "开始省钱"
      },
      "pricing": {
            "title": "选择适合您的方案",
            "subtitle": "从个人开发者到企业团队，我们为每个阶段提供支持",
            "monthly": "月付",
            "yearly": "年付",
            "save": "省20%",
            "free": "免费版",
            "pro": "专业版",
            "team": "团队版",
            "enterprise": "企业版",
            "cta_free": "免费使用",
            "cta_pro": "免费体验",
            "cta_team": "免费体验",
            "cta_enterprise": "联系销售",
            "trial": "限时免费体验，随时取消",
            "limited_free": "限时免费 - 全部专业版功能",
            "free_desc": "适合个人开发者入门",
            "pro_desc": "适合专业开发者",
            "team_desc": "适合小团队",
            "enterprise_desc": "适合大型企业",
            "yearly_price": "每年",
            "checkout_error": "创建支付失败",
            "features": {
                  "requests": "次/天",
                  "unlimited": "无限",
                  "basic": "基础压缩",
                  "advanced": "高级压缩",
                  "api": "API 访问",
                  "support": "优先支持"
            }
      },
      "contact": {
            "title": "联系我们",
            "subtitle": "有任何问题或建议？我们随时为您服务",
            "name": "姓名",
            "name_placeholder": "您的姓名",
            "email": "邮箱",
            "email_placeholder": "you@example.com",
            "type": "类型",
            "subject": "主题",
            "subject_placeholder": "简要描述",
            "message": "详细描述",
            "message_placeholder": "详细描述您的问题或建议",
            "submit": "发送消息",
            "submit_error": "发送失败，请重试",
            "sending": "发送中...",
            "success": "消息已发送",
            "success_desc": "我们已收到您的消息，会尽快回复您",
            "types": {
                  "support": "技术支持",
                  "feedback": "产品反馈",
                  "bug": "Bug 报告",
                  "feature": "功能建议",
                  "business": "商务合作"
            }
      },
      "footer": {
            "terms": "服务条款",
            "privacy": "隐私政策",
            "refund": "退款政策"
      },
      "common": {
            "loading": "加载中...",
            "error": "错误",
            "retry": "重试",
            "back": "返回",
            "logout": "退出"
      },
      "dashboard": {
            "title": "Dashboard",
            "total_requests": "总请求数",
            "tokens_saved": "节省Token",
            "cost_saved": "节省费用",
            "compression_ratio": "平均压缩率",
            "daily_quota": "日用量配额",
            "monthly_quota": "月用量配额",
            "remaining": "剩余",
            "exhausted": "已用完",
            "user_info": "用户信息",
            "email": "邮箱",
            "plan": "套餐",
            "api_key_mgmt": "API Key 管理",
            "api_key_name": "API Key 名称",
            "create": "创建",
            "new_key_created": "新 API Key 已创建（请保存）：",
            "got_it": "知道了",
            "delete": "删除",
            "no_api_keys": "暂无 API Key",
            "quick_start": "快速开始",
            "upgrade_plan": "升级套餐",
            "new_key_name": "New Key"
      },
      "login": {
            "title": "登录",
            "subtitle": "欢迎回来，请登录您的账户",
            "email": "邮箱",
            "password": "密码",
            "name": "姓名",
            "name_placeholder": "您的姓名",
            "password_placeholder": "至少8位字符",
            "submit": "登录",
            "go_register": "立即注册",
            "go_login": "去登录",
            "has_account": "还没有账户？",
            "no_account": "已有账户？",
            "agree_terms": "登录即表示您同意我们的服务条款和隐私政策"
      },
      "register": {
            "title": "创建账户",
            "subtitle": "开始免费使用 TokenSaver，节省 LLM 费用",
            "submit": "创建账户",
            "agree": "我同意",
            "and": "和",
            "github_signup": "使用 GitHub 注册 (即将上线)",
            "google_signup": "使用 Google 注册 (即将上线)",
            "or_email": "或使用邮箱"
      },
      "terms": {
            "title": "服务条款",
            "updated": "最后更新",
            "section1_title": "1. 服务描述",
            "section1_desc": "TokenSaver 提供 LLM Token 压缩服务。使用我们的服务即表示您同意这些条款。",
            "section2_title": "2. 用户责任",
            "section2_desc": "用户有责任维护账户安全并遵守适用法律。",
            "section3_title": "3. 服务限制",
            "section3_desc": "我们努力提供稳定的服务，但不保证 100% 可用性。",
            "section4_title": "4. 账户终止",
            "contact_btn": "联系客服",
            "contact_desc": "如果您对这些条款有任何疑问，请联系我们"
      },
      "privacy": {
            "title": "隐私政策",
            "updated": "最后更新",
            "section1_title": "1. 信息收集",
            "section1_desc": "我们收集必要的信息来提供服务，包括邮箱和使用数据。",
            "section2_title": "2. 信息使用",
            "section2_desc": "我们使用您的信息来提供、维护和改进我们的服务。",
            "section3_title": "3. 信息保护",
            "section3_desc": "我们实施安全措施来保护您的个人信息。",
            "section4_title": "4. 数据共享",
            "section4_desc": "我们不会向第三方出售您的个人信息。",
            "section5_title": "5. 联系我们",
            "contact_btn": "联系客服",
            "contact_desc": "如果您对隐私政策有任何疑问，请联系我们"
      },
      "refund": {
            "title": "退款政策",
            "updated": "最后更新",
            "section1_title": "1. 退款条件",
            "section1_desc": "我们在以下条件下提供退款：",
            "section2_title": "2. 退款流程",
            "section2_desc": "购买后7天内联系我们申请退款。",
            "section3_title": "3. 不可退款情况",
            "section3_desc": "以下情况不可退款：",
            "section4_title": "4. 退款方式",
            "section4_desc": "退款将在5-10个工作日内退回原支付方式。",
            "section5_title": "5. 联系我们",
            "condition1": "服务不可用超过24小时",
            "condition2": "服务描述与实际功能严重不符",
            "condition3": "技术问题在7天内无法解决",
            "contact_btn": "联系客服",
            "contact_desc": "如果您对退款政策有任何疑问，请联系我们"
      },
      "profile": {
            "title": "个人中心",
            "info": "用户信息",
            "api_keys": "我的 API Keys",
            "feedback": "我的反馈",
            "update_name": "更新姓名",
            "change_password": "修改密码",
            "current_password": "当前密码",
            "new_password": "新密码",
            "confirm_password": "确认密码",
            "update_success": "更新成功",
            "update_failed": "更新失败",
            "password_mismatch": "两次输入的密码不一致",
            "password_too_short": "密码至少8位",
            "password_changed": "密码修改成功，请重新登录",
            "password_change_failed": "密码修改失败"
      },
      "docs": {
            "title": "文档",
            "api_url": "API 地址",
            "compression": "压缩 API",
            "authentication": "认证方式",
            "quick_start": "快速开始",
            "examples": "代码示例"
      },
      "admin": {
            "title": "管理后台",
            "users": "用户管理",
            "stats": "统计数据",
            "messages": "消息管理",
            "login_title": "后台登录",
            "login_subtitle": "管理员专用入口",
            "admin_only": "您没有管理员权限",
            "front_login": "前台登录"
      },
      "admin_login": {
            "title": "后台登录",
            "subtitle": "管理员专用入口，普通用户请访问",
            "email": "管理员邮箱",
            "password": "密码",
            "submit": "后台登录",
            "front_login": "前台登录",
            "not_admin": "不是管理员？",
            "footer": "TokenSaver 管理后台 · 仅限授权管理员访问"
      }
}
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // 默认英文
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
