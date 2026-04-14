import React from 'react';
import './App.css';
import { 
  Cloud, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  Cpu, 
  Globe, 
  ChevronRight, 
  Search, 
  Menu 
} from 'lucide-react';

function App() {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="logo">Yonyou</div>
          
          <ul className="nav-links">
            <li><a href="#">产品</a></li>
            <li><a href="#">行业</a></li>
            <li><a href="#">服务</a></li>
            <li><a href="#">生态</a></li>
            <li><a href="#">关于我们</a></li>
          </ul>

          <div className="nav-actions">
            <Search size={20} color="#2c3e50" />
            <a href="#" className="btn-primary">立即体验</a>
            <Menu className="mobile-only" size={24} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>用友 BIP | 数智化 进无止境</h1>
          <p>
            通过数智化转型，为企业提供全球领先的商业创新平台，
            助力大型企业高效增长，赋能业务转型。
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <a href="#" className="btn-primary" style={{ padding: '15px 40px', fontSize: '18px' }}>
              了解详情
            </a>
            <a href="#" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: '600' }}>
              观看视频 <ChevronRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <div className="features-grid">
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ color: '#df2d30', fontSize: '42px', marginBottom: '8px' }}>30+</h2>
              <p>年专注企业服务</p>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ color: '#df2d30', fontSize: '42px', marginBottom: '8px' }}>600万+</h2>
              <p>企业客户选择</p>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ color: '#df2d30', fontSize: '42px', marginBottom: '8px' }}>100+</h2>
              <p>覆盖国家和地区</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">全栈数智化解决方案</h2>
          <div className="features-grid">
            <FeatureCard 
              icon={<Cloud size={40} />} 
              title="智能财务" 
              description="从核算到事项会计，提供实时、精细、智能的财务管理服务。"
            />
            <FeatureCard 
              icon={<Users size={40} />} 
              title="数智人力" 
              description="重新定义人力资源管理，激发组织与人才活力。"
            />
            <FeatureCard 
              icon={<Cpu size={40} />} 
              title="数智采购" 
              description="连接全球供应商，构建高效、透明、协同的供应链体系。"
            />
            <FeatureCard 
              icon={<BarChart3 size={40} />} 
              title="智能营销" 
              description="以客户为中心，驱动全渠道业务增长与效率提升。"
            />
            <FeatureCard 
              icon={<ShieldCheck size={40} />} 
              title="协同办公" 
              description="让办公更智能、更高效，随时随地开启团队协作。"
            />
            <FeatureCard 
              icon={<Globe size={40} />} 
              title="全球化经营" 
              description="助力中国企业走向世界，支持多语言多准则全球管控。"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>热门产品</h4>
              <ul>
                <li><a href="#">用友 BIP</a></li>
                <li><a href="#">用友 U9 Cloud</a></li>
                <li><a href="#">用友 U8 Cloud</a></li>
                <li><a href="#">YonSuite</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>解决方案</h4>
              <ul>
                <li><a href="#">大型企业</a></li>
                <li><a href="#">中型企业</a></li>
                <li><a href="#">小微企业</a></li>
                <li><a href="#">政务服务</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>服务支持</h4>
              <ul>
                <li><a href="#">客服中心</a></li>
                <li><a href="#">社区论坛</a></li>
                <li><a href="#">培训认证</a></li>
                <li><a href="#">联系我们</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>关于用友</h4>
              <ul>
                <li><a href="#">公司介绍</a></li>
                <li><a href="#">新闻动态</a></li>
                <li><a href="#">加入我们</a></li>
                <li><a href="#">投资者关系</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 用友网络科技股份有限公司 版权所有</p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="#">隐私政策</a>
              <a href="#">法律声明</a>
              <a href="#">京ICP备05006336号</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="card">
      <div style={{ color: '#df2d30', marginBottom: '20px' }}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <a href="#" style={{ color: '#df2d30', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginTop: '16px', fontWeight: '600' }}>
        了解更多 <ChevronRight size={16} />
      </a>
    </div>
  );
}

export default App;
