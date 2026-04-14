import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  Cpu, 
  Globe, 
  ChevronRight, 
  ArrowUpRight,
  Database,
  Lock,
  Workflow,
  LineChart
} from 'lucide-react';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const Products = () => {
  return (
    <div className="products-page">
      {/* Page Header */}
      <section className="section bg-dark" style={{ paddingTop: '160px', paddingBottom: '80px', textAlign: 'center' }}>
        <div className="container">
          <FadeIn>
            <h1 style={{ fontSize: '64px', fontWeight: '900', marginBottom: '24px' }}>产品与服务</h1>
            <p style={{ color: '#888', fontSize: '22px', maxWidth: '800px', margin: '0 auto' }}>
              用友 BIP 全场景商业创新，涵盖财务、人力、供应链、采购、营销、制造等全域云服务
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Main Grid */}
      <section className="section">
        <div className="container">
          <div className="grid">
            <ProductCard 
              icon={<Cloud size={40} />} 
              title="智能财务" 
              features={['事项会计', '智能核算', '财务中台', '精细报表']}
              desc="实现从核算到事项、从孤立到连接、从合规到价值创造的全面转型。"
            />
            <ProductCard 
              icon={<Users size={40} />} 
              title="数智人力" 
              features={['人才招聘', '核心人事', '薪酬福利', '绩效管理']}
              desc="以人为本，重新定义组织文化，激发人才活力，构建数智化人才管理体系。"
            />
            <ProductCard 
              icon={<Cpu size={40} />} 
              title="数智采购" 
              features={['寻源协同', '电子招标', '供应商管理', '采购电商']}
              desc="连接全球供应商，构建高效、透明、协同的供应链体系，实现采购降本增效。"
            />
            <ProductCard 
              icon={<BarChart3 size={40} />} 
              title="智能营销" 
              features={['全渠道零售', 'B2B/B2C', '客户经营', '促销管理']}
              desc="以客户为中心，驱动全渠道业务增长，提升营销精准度与品牌影响力。"
            />
            <ProductCard 
              icon={<Workflow size={40} />} 
              title="数智制造" 
              features={['MES 制造', '生产协同', '物联集成', '智能工厂']}
              desc="工业互联网平台赋能，实现从研发、生产到服务的全生命周期管理。"
            />
            <ProductCard 
              icon={<Database size={40} />} 
              title="iuap 平台" 
              features={['云原生', '中台化', '低代码', '数据智能']}
              desc="用友 BIP 的数智化底座，支撑企业业务敏捷创新与数据资产化。"
            />
          </div>
        </div>
      </section>

      {/* Service Standards */}
      <section className="section bg-light">
        <div className="container">
          <div className="section-header">
            <h2>专业服务保障</h2>
            <p>为您的数智化转型全生命周期提供护航</p>
          </div>
          <div className="grid">
            <div className="case-card">
              <div style={{ color: 'var(--primary)', marginBottom: '20px' }}><Lock size={32} /></div>
              <h3>安全合规</h3>
              <p>满足全球最高安全标准，全链路数据加密，保障企业数据资产安全。</p>
            </div>
            <div className="case-card">
              <div style={{ color: 'var(--primary)', marginBottom: '20px' }}><LineChart size={32} /></div>
              <h3>咨询服务</h3>
              <p>专家团队提供数智化成熟度评估、战略规划及流程再造咨询。</p>
            </div>
            <div className="case-card">
              <div style={{ color: 'var(--primary)', marginBottom: '20px' }}><Globe size={32} /></div>
              <h3>全球交付</h3>
              <p>遍布全球的服务网络，支持多语言多准则的全球部署与本地化实施。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductCard = ({ icon, title, features, desc }: any) => (
  <FadeIn>
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-icon">{icon}</div>
      <h3 style={{ fontSize: '28px', marginBottom: '16px' }}>{title}</h3>
      <p style={{ color: '#666', marginBottom: '24px', flex: 1 }}>{desc}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
        {features.map((f: string) => (
          <span key={f} style={{ background: '#f0f0f0', padding: '4px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}>{f}</span>
        ))}
      </div>
      <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontWeight: '800' }}>
        产品详情 <ArrowUpRight size={18} style={{ marginLeft: '4px' }} />
      </a>
    </div>
  </FadeIn>
);

export default Products;
