// ============================================================
// Auto-Reply & Human Intervention System Configuration v4.1
// v4.1: 4-class intent engine + KV debounce + anti-injection
//       + link whitelist + human takeover lock. Removed
//       Voiceflow/Bland.ai (no affiliate business).
// v4.1.1: SIGN-OFF simplified across all templates + SENDER.role.
// ============================================================
import { createHash } from 'crypto';
// ------------------------------------------------------------
// 1. HUMAN INTERVENTION KEYWORDS (preserved from v3.0)
// ------------------------------------------------------------
export const HUMAN_INTERVENTION_KEYWORDS: string[] = [
  'partnership', 'partner with', 'collaborate', 'collaboration',
  'joint venture', 'co-marketing', 'strategic alliance',
  'business development', 'reseller', 'resell', 'distribution',
  'distributor', 'white label', 'white-label', 'whitelabel',
  'wholesale', 'bulk order', 'volume pricing',
  '合作', '商务', '联合', '分销', '代理', '批发', '白标',
  'pricing', 'price', 'cost', 'fee', 'fees', 'billing', 'invoice',
  'quote', 'quotation', 'proposal', 'demo', 'demostration',
  'trial', 'free trial', 'contract', 'agreement', 'nda ',
  'sla ', 'service level', 'enterprise plan', 'enterprise license',
  'purchase', 'buy ', 'order now', 'booking', 'reservation',
  'discount', 'coupon', 'promo code', 'negotiate', 'negotiation',
  '报价', '价格', '费用', '合同', '协议', '演示', '试用',
  '企业', '采购', '购买', '折扣', '优惠', '谈判', '收费',
  'investment', 'investor', 'invest ', 'funding', 'fund ',
  'venture capital', 'vc ', 'angel investor', 'seed round',
  'acquisition', 'acquire', 'buyout', 'merger', 'ipo ',
  'revenue share', 'profit sharing', 'equity', 'stake',
  '投资', '融资', '收购', '并购', '股权', '分成',
  'press', 'media', 'journalist', 'reporter', 'editor',
  'publication', 'magazine', 'newspaper', 'blog feature',
  'interview', 'podcast', 'webinar', 'event', 'conference',
  'summit', 'expo', 'speaker', 'speaking engagement',
  'keynote', 'panel', 'workshop', 'public relations',
  'media kit', 'press release', 'testimonial', 'review request',
  '媒体', '采访', '记者', '编辑', '公关', '播客',
  '演讲', '会议', '活动', '研讨会', '测评', '评价',
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
  'job', 'career', 'hiring', 'hire ', 'recruit', 'recruitment',
  'resume', 'cv ', 'application', 'position', 'role', 'opening',
  'opportunity', 'internship', 'intern', 'freelancer', 'freelance',
  'contractor', 'consultant', 'agency', 'team', 'join us',
  'work with you', 'for hire', 'available for work',
  '工作', '职业', '招聘', '简历', '申请', '职位', '机会',
  '实习', '自由职业', '外包', '团队', '加入',
  'affiliate', 'referral program', 'commission', 'refer',
  'ambassador', 'influencer', 'creator', 'content creator',
  'promote', 'promotion', 'advertise', 'advertising', 'ad campaign',
  'sponsor', 'sponsorship', 'brand deal', 'endorsement',
  '联盟', '推荐', '佣金', '分成', '大使', '网红',
  '创作者', '推广', '广告', '赞助', '代言',
  'custom', 'customize', 'customized', 'bespoke', 'tailor-made',
  'build for me', 'develop for me', 'create for me',
  'outsourcing', 'outsource', 'software development',
  'consulting', 'consult ', 'consultation', 'advisor',
  'coaching', 'mentor', 'mentorship', 'audit', 'assessment',
  'strategy', 'strategic', 'roadmap', 'planning',
  '定制', '开发', '外包', '咨询', '顾问', '指导',
  '审计', '评估', '战略', '规划', '路线图',
  'refund', 'chargeback', 'dispute', 'cancel', 'cancellation',
  'unsubscribe', 'remove me', 'delete my', 'account issue',
  'login problem', 'password reset', 'access denied', 'locked out',
  'billing issue', 'payment failed', 'credit card',
  '退款', '取消', '退订', '删除', '账户', '登录',
  '密码', '账单', '支付',
  'urgent', 'asap', 'immediately', 'critical', 'emergency',
  'ceo ', 'founder', 'owner', 'manager', 'supervisor',
  'escalate', 'escalation', 'complaint', 'dissatisfied',
  '紧急', '尽快', '立即', '严重', '投诉', '不满',
];
// ------------------------------------------------------------
// 2. FORWARDING EMAILS (preserved)
// ------------------------------------------------------------
export const FORWARD_EMAILS: string[] = [
  'hi@aicode8.com',
  'guixinji@outlook.com',
];
// ------------------------------------------------------------
// 3. AFFILIATE LINK MAPPING (v4.1: removed Voiceflow + Bland.ai)
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
      'make.com', 'make scenario', 'make automation', 'make workflow',
      'integromat', 'visual automation', 'no-code automation',
      'zapier alternative', 'automation platform',
    ],
  },
  {
    name: 'n8n',
    url: 'https://wenboom.com/links/n8n.html',
    keywords: [
      'n8n', 'self-host', 'self hosted', 'self-hosted', 'self hosting',
      'on-premise', 'on premise', 'fair-code', 'docker',
      'workflow automation', 'data pipeline', 'queue mode',
      '自建', '自托管', '本地部署', '私有部署',
    ],
  },
  {
    name: 'Clay',
    url: 'https://wenboom.com/links/clay.html',
    keywords: [
      'clay', 'enrichment', 'data enrichment', 'enrich data',
      'lead', 'leads', 'prospect', 'prospects', 'b2b data',
      'apollo', 'zoominfo', 'lusha', 'clearbit', 'hunter.io',
      'icp', 'ideal customer profile', 'sales intelligence',
      '数据富集', '线索', '潜在客户', '理想客户画像',
    ],
  },
  {
    name: 'Smartlead',
    url: 'https://wenboom.com/links/smartlead.html',
    keywords: [
      'smartlead', 'cold email', 'cold outreach', 'email campaign',
      'sequence', 'follow-up', 'outreach', 'outbound',
      'warmup', 'inbox warmup', 'domain warmup', 'deliverability',
      'email sending', 'send emails', 'bulk email',
      '冷邮件', '冷启动', '外展', '邮件活动', '序列', '跟进', '预热', '送达率',
    ],
  },
  {
    name: 'ActiveCampaign',
    url: 'https://wenboom.com/links/activecampaign.html',
    keywords: [
      'activecampaign', 'crm', 'customer relationship',
      'email marketing', 'marketing automation', 'sales automation',
      'pipeline', 'sales pipeline', 'lead nurturing', 'lead scoring',
      'segmentation', 'landing page', 'site tracking', 'behavioral',
      '客户管理', '邮件营销', '营销自动化', '销售管道', '线索培育', '线索评分',
    ],
  },
];
// ------------------------------------------------------------
// 4. AI SYSTEM PROMPT (preserved v3.0, used by generateAIReply fallback)
// ------------------------------------------------------------
export const AI_SYSTEM_PROMPT: string = `You are Alex, Principal AI Infrastructure Architect at Wenboom.com.
You write natural, conversational email replies to subscribers who email you.
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
- Write like a real human sending an email - conversational, direct, no corporate fluff.
- Length: 150-250 words, 3-4 short natural paragraphs.
- Address the user's specific question or comment directly.
- Tone: knowledgeable, helpful, like a senior architect giving advice to a peer.
- Never say "As an AI" or "I'm an AI" or "As an AI language model".
- Never make false claims or promises about results.
- If the user asks about pricing, give general ranges, not exact quotes.
- If you don't know the answer, say so honestly and suggest where to look.
- Use specific numbers and benchmarks when relevant (e.g., "83.4% TCO reduction", "sub-800ms latency", "98.4% deliverability").
FORMAT:
- NO structured headers like "Answer:", "Recommendation:", "Pitfall:".
- NO markdown bold (**text**), NO bullet points, NO numbered lists.
- Just natural paragraphs, like a real person wrote it.
- Start with a natural opener like "Great question," or "Good one," or just dive in.
- End naturally before the sign-off.
LINK EMBEDDING:
- If the context provides recommended tools/URLs, naturally mention 1-2 of them in your prose where they fit the answer.
- Use link format like [Tool Name](URL) when mentioning a tool.
- Do NOT force links if they don't fit the conversation.
- Do NOT list links at the end - weave them into your prose naturally.
- Maximum 2 links per reply.
SIGN-OFF:
- End with: "Alex\nPrincipal AI Infrastructure Architect @ Wenboom.com"`;
// ------------------------------------------------------------
// 5. SYSTEM SETTINGS (preserved v3.0)
// ------------------------------------------------------------
export const MAX_AFFILIATE_LINKS: number = 2;
export const FORWARD_SUBJECT_PREFIX: string = '[NEEDS MANUAL REPLY]';
export const MAX_EMAIL_BODY_LENGTH: number = 4000;
export const DEDUP_TTL_SECONDS: number = 86400;
export const AI_REPLY_TIMEOUT_MS: number = 30000;
// ------------------------------------------------------------
// 6. RATE LIMIT (preserved v3.0 key format)
// ------------------------------------------------------------
export const RATE_LIMIT_MAX_REPLIES: number = 3;
export const RATE_LIMIT_WINDOW_SECONDS: number = 86400;
export const RATE_LIMIT_KEY_PREFIX: string = 'ratelimit:';
// ------------------------------------------------------------
// 7. BLACKLIST (preserved v3.0)
// ------------------------------------------------------------
export const BLACKLIST_KEY_PREFIX: string = 'blacklist:';
export const BLACKLIST_FOREVER: boolean = true;
// ------------------------------------------------------------
// 8. UTM ATTRIBUTION (preserved v3.0 + builder function)
// ------------------------------------------------------------
export const UTM_SOURCE: string = 'auto_reply';
export const UTM_MEDIUM: string = 'email';
export const UTM_CAMPAIGN_PREFIX: string = 'reply_';
export function buildUtmParams(campaign: string, email: string): string {
  const hash = createHash('md5').update(email).digest('hex').slice(0, 8);
  return `?utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}&utm_campaign=${UTM_CAMPAIGN_PREFIX}${campaign}&utm_content=${hash}`;
}
export function buildAffiliateUrl(tool: AffiliateLink, email: string): string {
  const campaign = tool.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${tool.url}${buildUtmParams(campaign, email)}`;
}
// ------------------------------------------------------------
// 9. FALLBACK REPLY TEMPLATE (preserved v3.0)
// ------------------------------------------------------------
export const FALLBACK_REPLY_TEMPLATE: string = `Hey,
Good question — let me give you a proper answer rather than something rushed.
A couple of quick details would help me point you in the right direction: are you running this cloud or self-hosted? And roughly what scale — a few workflows a day, or hundreds?
In the meantime, the blueprints at wenboom.com cover most of the common setups, with the exact JSON payloads and workflow exports I use in production.
Alex
Principal AI Infrastructure Architect @ Wenboom.com`;
// ============================================================
// v4.1 NEW CONFIGURATION BELOW
// ============================================================
// ------------------------------------------------------------
// 10. INTENT CLASSIFICATION CONFIG
// ------------------------------------------------------------
export const CLASSIFICATION = {
  fastPathMaxLength: 50,
  maxConsecutiveAcks: 1,
  ackStateTtlSeconds: 259200, // 3 days
  llmModel: 'openai/gpt-oss-120b',
  llmMaxTokens: 200,
  llmTemperature: 0.1,
};
// ------------------------------------------------------------
// 11. FAST-PATH REGEX PATTERNS
// ------------------------------------------------------------
export const FAST_PATH_REGEX = {
  quickAck: /^(thanks|thank you|thx|got it|noted|ok|okay|cool|awesome|great|perfect|收到|谢谢|好的|没问题|收到，谢谢|thanks!|thank you!|will do|sounds good|sounds great)[\s!.]*$/i,
  quickResolved: /^(never mind|nevermind|fixed it|i fixed|ignore this|ignore my|solved it|all set|不用了|我自己解决了|已解决|解决了|搞定了)[\s!.]*$/i,
  autoReplyHeader: /auto-replied|auto-generated|automatic reply/i,
  outOfOffice: /out of office|ooo|on vacation|on holiday|休假自动回复|离线自动回复|automatic reply/i,
  unsubscribe: /unsubscribe|stop sending|remove me|opt out|不要再发|退订|取消订阅/i,
};
// ------------------------------------------------------------
// 12. KV DEBOUNCE CONFIG
// ------------------------------------------------------------
export const DEBOUNCE = {
  maxBufferWaitMinutes: 30,
  bufferTtlSeconds: 3600,
  historyTtlSeconds: 604800, // 7 days
  maxCombinedBodyLength: 8000,
  minDelaySeconds: 480,   // 8 minutes
  maxDelaySeconds: 2100,  // 35 minutes
};
// ------------------------------------------------------------
// 13. HUMAN TAKEOVER LOCK CONFIG
// ------------------------------------------------------------
export const HUMAN_LOCK = {
  ttlSeconds: 604800, // 7 days
  keyPrefix: 'humanlock:',
};
// ------------------------------------------------------------
// 14. LINK WHITELIST (prevent hallucinated 404 links)
// ------------------------------------------------------------
export const LINK_WHITELIST = {
  domains: [
    'wenboom.com', 'www.wenboom.com',
    'clay.com', 'smartlead.ai', 'make.com', 'n8n.io',
    'hetzner.com', 'digitalocean.com', 'aws.amazon.com', 'github.com',
  ] as string[],
  fallbackUrl: 'https://wenboom.com',
  // Only validate /links/ pages (fixed). Other internal pages pass through.
  validateLinksPrefix: '/links/',
};
// ------------------------------------------------------------
// 15. SHORT TEMPLATES (TYPE_A / TYPE_C)
// ------------------------------------------------------------
export const TYPE_A_ACK_TEMPLATES = [
  "Glad it helped! Feel free to ping me if anything else comes up.",
  "You're welcome! Hit me up if you run into any snags along the way.",
  "Awesome, glad that was useful. Don't hesitate to reach out if you need more.",
  "No problem at all. Let me know how it goes!",
];
export const TYPE_C_RESOLVED_TEMPLATES = [
  "Awesome, glad you got it sorted out! Enjoy building.",
  "Great to hear! Feel free to reach out if anything else comes up.",
  "Perfect, glad it's working. Have a great one!",
];
// ------------------------------------------------------------
// 16. SENDER INFO
// ------------------------------------------------------------
export const SENDER = {
  from: 'Alex <alex@wenboom.com>',
  fromName: 'Alex',
  role: 'Principal AI Infrastructure Architect @ Wenboom.com',
  humanForwardEmail: 'hi@aicode8.com',
};
