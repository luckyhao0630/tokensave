import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        features: 'Features',
        pricing: 'Pricing',
        guide: 'Guide',
        docs: 'Docs',
        contact: 'Contact',
        login: 'Login',
        start: 'Get Started',
        dashboard: 'Dashboard',
      },
      hero: {
        badge: 'Based on 14k+ Stars Open Source Project',
        title: 'Reduce LLM Costs by',
        highlight: '60-95%',
        subtitle: 'Smart Token Compression. Same AI Quality. Half the Cost.',
        cta_primary: 'Get Started Free',
        cta_secondary: 'View Docs',
        stat1: 'Avg Compression',
        stat2: 'Developers',
        stat3: 'Cost Savings',
      },
      promo: {
        title: 'Limited Time Free',
        message: 'All Pro features free until 2026-07-08',
      },
      guide: {
        title: '5-Minute Quick Start',
        subtitle: 'No tech skills needed, follow the steps',
        step1: 'Register',
        step2: 'Create API Key',
        step3: 'Replace API URL',
        step4: 'Start Saving',
      },
      pricing: {
        title: 'Choose Your Plan',
        subtitle: 'From solo developers to enterprise teams',
        monthly: 'Monthly',
        yearly: 'Yearly',
        save: 'Save 20%',
        free: 'Free',
        pro: 'Pro',
        team: 'Team',
        enterprise: 'Enterprise',
        cta_free: 'Use Free',
        cta_pro: 'Try Free',
        cta_team: 'Try Free',
        cta_enterprise: 'Contact Sales',
        trial: 'Free trial, cancel anytime',
        features: {
          requests: 'requests/day',
          unlimited: 'Unlimited',
          basic: 'Basic compression',
          advanced: 'Advanced compression',
          api: 'API access',
          support: 'Priority support',
        },
      },
      contact: {
        title: 'Contact Us',
        subtitle: 'Questions or suggestions? We are here',
        name: 'Name',
        email: 'Email',
        type: 'Type',
        subject: 'Subject',
        message: 'Message',
        submit: 'Send Message',
        sending: 'Sending...',
        success: 'Message Sent',
        success_desc: 'We will reply as soon as possible',
        types: {
          support: 'Technical Support',
          feedback: 'Feedback',
          bug: 'Bug Report',
          feature: 'Feature Request',
          business: 'Business',
        },
      },
      footer: {
        terms: 'Terms',
        privacy: 'Privacy',
        refund: 'Refund',
      },
      common: {
        loading: 'Loading...',
        error: 'Error',
        retry: 'Retry',
        back: 'Back',
      },
    },
  },
  zh: {
    translation: {
      nav: {
        features: '功能',
        pricing: '定价',
        guide: '教程',
        docs: '文档',
        contact: '联系',
        login: '登录',
        start: '开始使用',
        dashboard: '进入 Dashboard',
      },
      hero: {
        badge: '基于 GitHub 14k+ Stars 开源项目',
        title: '让 LLM 费用降低',
        highlight: '60-95%',
        subtitle: '智能压缩 Token，不改变 AI 回答质量。一行代码接入，立即节省一半以上成本。',
        cta_primary: '免费开始',
        cta_secondary: '查看文档',
        stat1: '平均压缩率',
        stat2: '开发者使用',
        stat3: '费用节省',
      },
      promo: {
        title: '限时免费活动',
        message: '所有 Pro 功能免费体验至 2026-07-08',
      },
      guide: {
        title: '5分钟快速上手',
        subtitle: '不需要懂技术，跟着步骤做，轻松省钱',
        step1: '注册账号',
        step2: '创建 API Key',
        step3: '替换 API 地址',
        step4: '开始省钱',
      },
      pricing: {
        title: '选择适合您的方案',
        subtitle: '从个人开发者到企业团队，我们为每个阶段提供支持',
        monthly: '月付',
        yearly: '年付',
        save: '省20%',
        free: '免费版',
        pro: '专业版',
        team: '团队版',
        enterprise: '企业版',
        cta_free: '免费使用',
        cta_pro: '免费体验',
        cta_team: '免费体验',
        cta_enterprise: '联系销售',
        trial: '限时免费体验，随时取消',
        features: {
          requests: '次/天',
          unlimited: '无限',
          basic: '基础压缩',
          advanced: '高级压缩',
          api: 'API 访问',
          support: '优先支持',
        },
      },
      contact: {
        title: '联系我们',
        subtitle: '有任何问题或建议？我们随时为您服务',
        name: '姓名',
        email: '邮箱',
        type: '类型',
        subject: '主题',
        message: '详细描述',
        submit: '发送消息',
        sending: '发送中...',
        success: '消息已发送',
        success_desc: '我们已收到您的消息，会尽快回复您',
        types: {
          support: '技术支持',
          feedback: '产品反馈',
          bug: 'Bug 报告',
          feature: '功能建议',
          business: '商务合作',
        },
      },
      footer: {
        terms: '服务条款',
        privacy: '隐私政策',
        refund: '退款政策',
      },
      common: {
        loading: '加载中...',
        error: '错误',
        retry: '重试',
        back: '返回',
      },
    },
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
