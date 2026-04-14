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
  Zap,
  Layers,
  Award,
  ArrowUpRight
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

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container">
          <FadeIn>
            <div className="hero-content">
              <h1>用友 BIP <br />数智化 进无止境</h1>
              <p>
                全球领先的企业云服务与软件提供商。从 ERP 到 BIP，我们重新定义企业服务，
                助力大型企业迈向数智化新时代。
              </p>
              <div className="hero-btns">
                <a href="#" className="btn btn-primary">
                  开启数智之旅
                </a>
                <a href="#" className="btn btn-outline">
                  观看宣传片 <ArrowUpRight size={20} style={{ marginLeft: '8px' }} />
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <StatItem count="36" unit="+" label="年专注企业服务" />
            <StatItem count="600" unit="万+" label="企业客户选择" />
            <StatItem count="2000" unit="+" label="全球生态伙伴" />
            <StatItem count="TOP 1" unit="" label="中国 ERP/云服务市场" />
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="section bg-light">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <h2 style={{ fontSize: '56px', letterSpacing: '-2px' }}>深耕行业 创造价值</h2>
              <p>基于 36 年行业积淀，为 20+ 行业提供全场景数智化转型方案</p>
            </div>
          </FadeIn>
          
          <div className="industry-grid">
            <IndustryCard title="智能制造" category="高端装备 / 电子 / 流程" img="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800" />
            <IndustryCard title="智慧财税" category="财务共享 / 税务管理" img="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800" />
            <IndustryCard title="数智采购" category="供应商协同 / 电子招标" img="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800" />
            <IndustryCard title="智慧营销" category="全渠道零售 / 客户经营" img="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800" />
          </div>
        </div>
      </section>

      {/* Technology Platform */}
      <section className="platform-section">
        <div className="container">
          <div className="platform-grid">
            <FadeIn>
              <div>
                <div style={{ color: 'var(--primary)', fontWeight: '800', marginBottom: '24px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  <Zap size={24} style={{ marginRight: '10px' }} /> Powered by iuap
                </div>
                <h2 style={{ fontSize: '52px', marginBottom: '32px', fontWeight: '900' }}>更懂企业的 <br />数智化平台底座</h2>
                <p style={{ color: '#888', fontSize: '20px', marginBottom: '48px', lineHeight: '1.8' }}>
                  用友 iuap 平台通过云原生、元数据驱动、中台化和数智化四大核心技术，
                  打破企业数据孤岛，实现业务敏捷创新与数据资产化。
                </p>
                <div className="platform-features">
                  <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ color: 'white', fontSize: '22px', marginBottom: '12px' }}>云原生架构</h4>
                    <p style={{ color: '#666' }}>完全自主可控，支持私有云、公有云、混合云多种部署模式。</p>
                  </div>
                  <div>
                    <h4 style={{ color: 'white', fontSize: '22px', marginBottom: '12px' }}>低代码 YMS</h4>
                    <p style={{ color: '#666' }}>赋能业务人员快速构建应用，交付周期从月缩短至周。</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div style={{ position: 'relative' }}>
                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200" alt="Platform" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 40px 100px rgba(238,34,35,0.1)' }} />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Customer Success */}
      <section className="section">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <h2 style={{ fontSize: '48px' }}>携手行业领军者</h2>
              <p>全球 500 强企业中，已有 65% 选择用友作为数智化合作伙伴</p>
            </div>
          </FadeIn>
          
          <div className="grid">
            <CaseCard company="三一集团" type="工业互联网" desc="基于用友 BIP 构建全球统一的财务与制造平台，实现 100+ 生产线实时数智化管控。" />
            <CaseCard company="中国航天" type="智慧国资" desc="实现全集团财务管理一体化，支撑中国航天事业高质量发展与全球化运营。" />
            <CaseCard company="中国银行" type="数智金融" desc="重塑人力资源核心系统，支撑 30 万+ 员工的高效管理与敏捷协同。" />
          </div>
        </div>
      </section>
    </>
  );
};

function StatItem({ count, unit, label }: { count: string, unit: string, label: string }) {
  return (
    <FadeIn>
      <div className="stat-item">
        <h3>{count}<span style={{ fontSize: '24px', marginLeft: '4px' }}>{unit}</span></h3>
        <p>{label}</p>
      </div>
    </FadeIn>
  );
}

function IndustryCard({ title, category, img }: { title: string, category: string, img: string }) {
  return (
    <FadeIn>
      <div className="industry-card">
        <img src={img} alt={title} />
        <div className="industry-overlay">
          <div style={{ marginBottom: '8px', color: 'var(--primary)', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>{category}</div>
          <h3 style={{ fontSize: '32px', fontWeight: '800' }}>{title}</h3>
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', fontWeight: '700' }}>
            查看方案 <ChevronRight size={18} style={{ marginLeft: '4px' }} />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

function CaseCard({ company, type, desc }: { company: string, type: string, desc: string }) {
  return (
    <FadeIn>
      <div className="case-card">
        <div style={{ color: 'var(--primary)', marginBottom: '24px' }}>
          {company === '三一集团' ? <Layers size={40} /> : company === '中国航天' ? <Award size={40} /> : <Users size={40} />}
        </div>
        <div style={{ fontSize: '14px', fontWeight: '800', color: '#999', marginBottom: '8px', textTransform: 'uppercase' }}>{type}</div>
        <h3 style={{ fontSize: '28px', marginBottom: '20px', fontWeight: '800' }}>{company}</h3>
        <p style={{ color: '#666', fontSize: '17px', lineHeight: '1.7' }}>{desc}</p>
        <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginTop: '32px', fontWeight: '800', fontSize: '15px' }}>
          阅读案例 <ArrowUpRight size={18} style={{ marginLeft: '6px' }} />
        </a>
      </div>
    </FadeIn>
  );
}

export default Home;
