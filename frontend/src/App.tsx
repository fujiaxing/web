import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { 
  Search, 
  Globe2,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import Home from './pages/Home';
import Products from './pages/Products';
import './App.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 页面切换时回到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const isDarkHeader = pathname === '/' && !scrolled;

  return (
    <div className="app">
      <motion.div className="progress-bar" style={{ scaleX, position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: 'var(--primary)', zIndex: 1001, transformOrigin: '0%' }} />

      {/* Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''} ${!isDarkHeader ? 'solid' : ''}`}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Link to="/" className="logo" style={{ color: isDarkHeader ? 'white' : 'var(--primary)' }}>yonyou</Link>
          
          <nav>
            <ul className="nav-links">
              <li><Link to="/products" style={{ color: isDarkHeader ? 'white' : '#333' }}>产品与服务</Link></li>
              <li><Link to="#" style={{ color: isDarkHeader ? 'white' : '#333' }}>行业解决方案</Link></li>
              <li><Link to="#" style={{ color: isDarkHeader ? 'white' : '#333' }}>数智平台</Link></li>
              <li><Link to="#" style={{ color: isDarkHeader ? 'white' : '#333' }}>开发者</Link></li>
              <li><Link to="#" style={{ color: isDarkHeader ? 'white' : '#333' }}>关于我们</Link></li>
            </ul>
          </nav>

          <div className="nav-right" style={{ color: isDarkHeader ? 'white' : '#333' }}>
            <Search size={20} className="icon-btn" />
            <Globe2 size={20} className="icon-btn" />
            <a href="#" className={`btn ${scrolled || pathname !== '/' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '10px 24px', fontSize: '14px', marginLeft: '10px' }}>
              立即咨询
            </a>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Floating Action */}
      <motion.div 
        className="floating-btn"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageSquare size={32} />
      </motion.div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div style={{ flex: '1.5' }}>
              <span className="footer-logo">yonyou</span>
              <p style={{ marginTop: '24px', maxWidth: '300px' }}>
                服务企业数智化，进无止境。中国及全球领先的企业云服务与软件提供商。
              </p>
              <div style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '24px', fontWeight: '800' }}>
                  <PhoneCall style={{ marginRight: '12px', color: 'var(--primary)' }} /> 400-6600-588
                </div>
              </div>
            </div>
            
            <div>
              <h4>产品</h4>
              <ul>
                <li><Link to="/products">用友 BIP</Link></li>
                <li><a href="#">用友 U9 Cloud</a></li>
                <li><a href="#">YonSuite</a></li>
                <li><a href="#">用友 U8 Cloud</a></li>
              </ul>
            </div>
            
            <div>
              <h4>行业解决方案</h4>
              <ul>
                <li><a href="#">智能制造</a></li>
                <li><a href="#">智慧财税</a></li>
                <li><a href="#">智慧营销</a></li>
                <li><a href="#">数智采购</a></li>
              </ul>
            </div>
            
            <div>
              <h4>开发者</h4>
              <ul>
                <li><a href="#">开发者中心</a></li>
                <li><a href="#">API 参考</a></li>
                <li><a href="#">应用市场</a></li>
                <li><a href="#">社区论坛</a></li>
              </ul>
            </div>

            <div>
              <h4>关于用友</h4>
              <ul>
                <li><a href="#">公司介绍</a></li>
                <li><a href="#">加入我们</a></li>
                <li><a href="#">投资者关系</a></li>
                <li><a href="#">法律声明</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2026 用友网络科技股份有限公司 版权所有 京ICP备05006336号</p>
            <div style={{ display: 'flex', gap: '32px' }}>
              <a href="#">隐私政策</a>
              <a href="#">联系我们</a>
              <a href="#">京公网安备11010802021200号</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
