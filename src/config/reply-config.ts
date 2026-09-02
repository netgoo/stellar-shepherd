// ============================================================
// Auto-Reply & Human Intervention System Configuration v2.1
// ============================================================

// ------------------------------------------------------------
// 1. HUMAN INTERVENTION KEYWORDS
//    Emails matching ANY of these are forwarded (not auto-replied)
//    Case-insensitive, checks subject + body
// ------------------------------------------------------------
export const HUMAN_INTERVENTION_KEYWORDS: string[] = [
  // --- Business Development & Partnerships ---
  'partnership', 'partner with', 'collaborate', 'collaboration',
  'joint venture', 'co-marketing', 'strategic alliance',
  'business development', 'reseller', 'resell', 'distribution',
  'distributor', 'white label', 'white-label', 'whitelabel',
  'wholesale', 'bulk order', 'volume pricing',
  '合作', '商务', '联合', '分销', '代理', '批发', '白标',

  // --- Sales, Pricing & Proposals ---
  'pricing', 'price', 'cost', 'fee', 'fees', 'billing', 'invoice',
  'quote', 'quotation', 'proposal', 'demo', 'demostration',
  'trial', 'free trial', 'contract', 'agreement', 'nda ',
  'sla ', 'service level', 'enterprise plan', 'enterprise license',
  'purchase', 'buy ', 'order now', 'booking', 'reservation',
  'discount', 'coupon', 'promo code', 'negotiate', 'negotiation',
  '报价', '价格', '费用', '合同', '协议', '演示', '试用',
  '企业', '采购', '购买', '折扣', '优惠', '谈判', '收费',

  // --- Investment & Finance ---
  'investment', 'investor', 'invest ', 'funding', 'fund ',
  'venture capital', 'vc ', 'angel investor', 'seed round',
  'acquisition', 'acquire', 'buyout', 'merger', 'ipo ',
  'revenue share', 'profit sharing', 'equity', 'stake',
  '投资', '融资', '收购', '并购', '股权', '分成',

  // --- Media, PR & Events ---
  'press', 'media', 'journalist', 'reporter', 'editor',
  'publication', 'magazine', 'newspaper', 'blog feature',
  'interview', 'podcast', 'webinar', 'event', 'conference',
  'summit', 'expo', 'speaker', 'speaking engagement',
  'keynote', 'panel', 'workshop', 'public relations',
  'media kit', 'press release', 'testimonial', 'review request',
  '媒体', '采访', '记者', '编辑', '公关', '播客',
  '演讲', '会议', '活动', '研讨会', '测评', '评价',

  // --- Legal, Compliance & Security ---
  'legal', 'lawyer', 'attorney', 'law firm', 'court', 'lawsuit',
  'sue', 'subpoena', 'compliance', 'gdpr', 'ccpa',
  'copyright', 'infringement', 'dmca', 'takedown',
  'trademark', 'patent', 'data protection',
  'security', 'vulnerability', 'exploit', 'hack', 'hacked',
  'breach', 'data leak', 'phishing', 'fraud', 'scam',
  'abuse', 'spam complaint', 'report abuse', 'malicious',
  '法律', '律师', '诉讼', '合规', '隐私', '版权', '侵权',
  '商标', '专利', '安全', '漏洞', '黑客', '钓鱼', '欺诈',
  '诈骗', '滥用', '举报', '数据泄露',

  // --- Hiring & Careers ---
  'job', 'career', 'hiring', 'hire ', 'recruit', 'recruitment',
  'resume', 'cv ', 'application', 'position', 'role', 'opening',
  'opportunity', 'internship', 'intern', 'freelancer', 'freelance',
  'contractor', 'consultant', 'agency', 'team', 'join us',
  'work with you', 'for hire', 'available for work',
  '工作', '职业', '招聘', '简历', '申请', '职位', '机会',
  '实习', '自由职业', '外包', '团队', '加入',

  // --- Affiliate & Marketing ---
  'affiliate', 'referral program', 'commission', 'refer',
  'ambassador', 'influencer', 'creator', 'content creator',
  'promote', 'promotion', 'advertise', 'advertising', 'ad campaign',
  'sponsor', 'sponsorship', 'brand deal', 'endorsement',
  '联盟', '推荐', '佣金', '分成', '大使', '网红',
  '创作者', '推广', '广告', '赞助', '代言',

  // --- Custom Development & Consulting ---
  'custom', 'customize', 'customized', 'bespoke', 'tailor-made',
  'build for me', 'develop for me', 'create for me',
  'outsourcing', 'outsource', 'software development',
  'consulting', 'consult ', 'consultation', 'advisor',
  'coaching', 'mentor', 'mentorship', 'audit', 'assessment',
  'strategy', 'strategic', 'roadmap', 'planning',
  '定制', '开发', '外包', '咨询', '顾问', '指导',
  '审计', '评估', '战略', '规划', '路线图',

  // --- Account & Billing Issues ---
  'refund', 'chargeback', 'dispute', 'cancel', 'cancellation',
  'unsubscribe', 'remove me', 'delete my', 'account issue',
  'login problem', 'password reset', 'access denied', 'locked out',
  'billing issue', 'payment failed', 'credit card',
  '退款', '取消', '退订', '删除', '账户', '登录',
  '密码', '账单', '支付',

  // --- Urgent / Escalation ---
  'urgent', 'asap', 'immediately', 'critical', 'emergency',
  'ceo ', 'founder', 'owner', 'manager', 'supervisor',
  'escalate', 'escalation', 'complaint', 'dissatisfied',
  '紧急', '尽快', '立即', '严重', '投诉', '不满',
];

// ------------------------------------------------------------
// 2. FORWARDING EMAILS
// ------------------------------------------------------------
export const FORWARD_EMAILS: string[] = [
  'hi@aicode8.com',
  'guixinji@outlook.com',
];

// ------------------------------------------------------------
// 3. AFFILIATE LINK MAPPING
// ------------------------------------------------------------
export interface AffiliateLink {
  name: string;
  url: string;
  keywords: string[];
}

export const AFFILIATE_LINKS: AffiliateLink[] = [
  {
    name: 'Make.com',
    url: 'https://wenboom.com/links/make.html',
    keywords: [
      'automation', 'workflow', 'workflows', 'integration', 'integrate',
      'connect', 'connection', 'api', 'webhook', 'trigger', 'action',
      'scenario', 'template', 'no-code', 'no code', 'low-code', 'low code',
      'zapier', 'zapier alternative', 'make.com',
      'airtable', 'notion', 'google sheets', 'slack', 'discord',
      'crm integration', 'data sync', 'sync data', 'automate',
      '自动化', '工作流', '集成', '连接', '接口', '触发器',
      '动作', '场景', '模板', '无代码', '低代码', '数据同步',
    ],
  },
  {
    name: 'n8n',
    url: 'https://wenboom.com/links/n8n.html',
    keywords: [
      'n8n', 'self-host', 'self hosted', 'self-hosted', 'self hosting',
      'on-premise', 'on premise', 'on-prem', 'private', 'privacy',
      'open source', 'open-source', 'source available', 'fair-code',
      'docker', 'container', 'server', 'vps', 'hetzner', 'digitalocean',
      'workflow automation', 'data pipeline', 'etl', 'data sync',
      'automation platform', 'node-based', 'visual workflow',
      '自建', '自托管', '本地部署', '私有部署', '隐私', '开源',
      '容器', '服务器', '虚拟主机', '数据管道', '数据同步',
    ],
  },
  {
    name: 'Clay',
    url: 'https://wenboom.com/links/clay.html',
    keywords: [
      'clay', 'enrichment', 'data enrichment', 'enrich data',
      'lead', 'leads', 'prospect', 'prospects', 'b2b', 'b2b data',
      'data provider', 'apollo', 'zoominfo', 'lusha', 'clearbit',
      'hunter', 'hunter.io', 'snov', 'dropcontact',
      'icp', 'ideal customer profile', 'targeting', 'segmentation',
      'sales intelligence', 'lead scoring', 'data quality',
      'find emails', 'email finder', 'contact data', 'company data',
      '数据', '富集', '数据丰富', '线索', '潜在客户',
      '理想客户画像', '定位', '细分', '销售智能', '线索评分',
      '数据质量', '找邮箱', '联系人数据', '公司数据',
    ],
  },
  {
    name: 'Smartlead',
    url: 'https://wenboom.com/links/smartlead.html',
    keywords: [
      'smartlead', 'cold email', 'cold outreach', 'cold calling',
      'email campaign', 'email campaigns', 'sequence', 'sequences',
      'follow-up', 'follow up', 'drip', 'drip campaign',
      'outreach', 'outbound', 'sales engagement',
      'warmup', 'inbox warmup', 'domain warmup', 'inbox rotation',
      'domain reputation', 'spf', 'dkim', 'dmarc', 'deliverability',
      'reply detection', 'positive reply', 'meeting booked', 'conversion',
      'email sending', 'send emails', 'bulk email', 'email marketing',
      '邮件', '冷邮件', '冷启动', '外展', '外呼',
      '邮件活动', '序列', '跟进', '培育', '预热',
      '收件箱轮换', '域名信誉', '送达率', '回复检测', '转化',
    ],
  },
  {
    name: 'Voiceflow',
    url: 'https://wenboom.com/links/voiceflow.html',
    keywords: [
      'voiceflow', 'chatbot', 'chat bot', 'conversational ai',
      'conversation', 'conversational', 'dialogue', 'dialog',
      'nlu', 'nlp', 'natural language', 'intent', 'entity',
      'agent', 'ai agent', 'virtual assistant', 'assistant',
      'ivr', 'call center', 'contact center', 'support bot',
      'helpdesk', 'knowledge base', 'faq bot', 'customer service bot',
      'prototype', 'design', 'canvas', 'variable', 'api step',
      '聊天机器人', '对话式ai', '对话', '自然语言',
      '意图', '实体', '智能体', '虚拟助手', '客服机器人',
      '帮助台', '知识库', '原型', '设计',
    ],
  },
  {
    name: 'Bland.ai',
    url: 'https://wenboom.com/links/bland.html',
    keywords: [
      'bland', 'bland.ai', 'voice ai', 'voice agent',
      'ai call', 'ai calls', 'phone ai', 'phone agent',
      'outbound call', 'outbound calls', 'inbound call', 'inbound calls',
      'phone call', 'phone calls', 'telephony', 'pstn', 'sip',
      'twilio', 'phone number', 'virtual number',
      'transcription', 'transcribe', 'real-time', 'realtime',
      'latency', 'response time', 'interrupt', 'interruption',
      'booking', 'appointment', 'appointment setting', 'scheduling',
      'reservation', 'calendar', 'schedule call', 'book a call',
      'auto-booking', 'auto booking', 'lead qualification',
      '电话', '呼叫', '外呼', '呼入', '语音ai',
      '语音智能体', '实时', '延迟', '响应时间', '打断',
      '预订', '预约', '日程安排', '日历', '自动预订',
      '线索资格审核', '转写',
    ],
  },
  {
    name: 'ActiveCampaign',
    url: 'https://wenboom.com/links/activecampaign.html',
    keywords: [
      'activecampaign', 'crm', 'customer relationship',
      'email marketing', 'marketing automation', 'sales automation',
      'pipeline', 'sales pipeline', 'deal', 'deals',
      'lead nurturing', 'nurturing', 'lead scoring', 'scoring',
      'tagging', 'tags', 'segmentation', 'segments', 'list', 'lists',
      'landing page', 'landing pages', 'form', 'forms',
      'site tracking', 'event tracking', 'behavioral',
      'stage', 'stages', 'forecast', 'forecasting',
      'win', 'loss', 'win rate', 'conversion rate',
      'hubspot alternative', 'mailchimp alternative', 'convertkit',
      'getresponse', 'aweber', 'constant contact',
      '客户管理', '客户关系', '邮件营销', '营销自动化',
      '销售自动化', '销售管道', '交易', '线索培育',
      '线索评分', '标签', '细分', '列表', '落地页',
      '表单', '站点追踪', '事件追踪', '行为', '阶段',
      '预测', '赢单', '输单', '转化率',
    ],
  },
];

// ------------------------------------------------------------
// 4. AI SYSTEM PROMPT (optimized for natural link embedding)
// ------------------------------------------------------------
export const AI_SYSTEM_PROMPT: string = `You are Alex, Principal AI Infrastructure Architect at Wenboom.com.
You write concise, expert-level replies to subscribers who email you.

ABOUT YOU:
- You build production-grade AI infrastructure for lean B2B teams
- Your site wenboom.com publishes blueprints for 7 core tools across 4 pillars
- Pillar 01: Data Waterfall & Outbound (Clay + Smartlead)
- Pillar 02: Orchestration & Cost Control (Make.com + n8n)
- Pillar 03: Agentic Voice & Real-Time Flow (Voiceflow + Bland.ai)
- Pillar 04: Lifecycle Revenue CRM (ActiveCampaign)
- You test every architecture in live deployment before publishing

RULES:
- Reply in the SAME language as the user's email (English or Chinese).
- Be direct and practical. No fluff, no generic AI phrases.
- Length: 150-250 words, 3-4 short paragraphs.
- Address the user's specific question or comment directly.
- Tone: knowledgeable, helpful, authoritative yet approachable.
- Never say "As an AI" or "I'm an AI" or "As an AI language model".
- Never make false claims or promises about results.
- If the user asks about pricing, give general ranges, not exact quotes.
- If you don't know the answer, say so honestly and suggest where to look.
- Use specific numbers and benchmarks when relevant (e.g., "83.4% TCO reduction", "sub-800ms latency", "98.4% deliverability").

STRUCTURE:
1. Direct acknowledgment & answer (1-2 sentences)
2. Practical engineering recommendation with reasoning (1-2 short paragraphs)
3. A common pitfall or pro tip (1 short paragraph)
4. Closing friendly sign-off: "To your leverage, \\nAlex\\nPrincipal AI Infrastructure Architect | Wenboom.com"

LINK EMBEDDING:
- If the context provides recommended tools/URLs, smoothly embed them using Markdown format like [Tool Name](URL) where they naturally fit your answer.
- Do NOT force links if they don't fit the conversation.
- Do NOT list links at the end — weave them into your prose naturally.
- Maximum 2 links per reply.`;

// ------------------------------------------------------------
// 5. SYSTEM SETTINGS
// ------------------------------------------------------------
export const MAX_AFFILIATE_LINKS: number = 2;
export const FORWARD_SUBJECT_PREFIX: string = '[NEEDS MANUAL REPLY]';
export const MAX_EMAIL_BODY_LENGTH: number = 4000;
export const DEDUP_TTL_SECONDS: number = 86400; // 24 hours
export const AI_REPLY_TIMEOUT_MS: number = 30000; // 30 seconds
