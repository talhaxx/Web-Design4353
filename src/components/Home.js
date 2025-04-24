import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [isVisible, setIsVisible] = useState({
    hero: false,
    mission: false,
    stats: false,
    features: false
  });
  
  const heroRef = useRef(null);
  const missionRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  
  useEffect(() => {
    setIsVisible(prev => ({ ...prev, hero: true }));
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (entry.target === missionRef.current) {
              setIsVisible(prev => ({ ...prev, mission: true }));
            } else if (entry.target === statsRef.current) {
              setIsVisible(prev => ({ ...prev, stats: true }));
            } else if (entry.target === featuresRef.current) {
              setIsVisible(prev => ({ ...prev, features: true }));
            }
          }
        });
      },
      { threshold: 0.2 }
    );
    
    if (missionRef.current) observer.observe(missionRef.current);
    if (statsRef.current) observer.observe(statsRef.current);
    if (featuresRef.current) observer.observe(featuresRef.current);
    
    return () => {
      if (missionRef.current) observer.unobserve(missionRef.current);
      if (statsRef.current) observer.unobserve(statsRef.current);
      if (featuresRef.current) observer.unobserve(featuresRef.current);
    };
  }, []);
  
  const stats = [
    { value: '2500+', label: 'Volunteers' },
    { value: '150+', label: 'Events' },
    { value: '75+', label: 'Communities' },
    { value: '10000+', label: 'People Helped' }
  ];
  
  const features = [
    {
      title: 'Smart Matching',
      description: 'Our AI-powered system matches volunteers with the perfect opportunities based on skills and preferences.',
      icon: '🔄'
    },
    {
      title: 'Real-time Updates',
      description: 'Get instant notifications about new opportunities and status changes.',
      icon: '⚡'
    },
    {
      title: 'Impact Tracking',
      description: 'See the real difference you are making with detailed impact metrics and reports.',
      icon: '📊'
    }
  ];

  return (
    <div className="home-container">
      {/* Animated background */}
      <div className="animated-bg"></div>
      
      {/* Hero section */}
      <section 
        ref={heroRef} 
        className={`hero-section ${isVisible.hero ? 'animate-in' : ''}`}
      >
        <div className="hero-content">
          <h1 className="glitch-text">
            <span aria-hidden="true">Connecting Hearts & Hands</span>
            Connecting Hearts & Hands
            <span aria-hidden="true">Connecting Hearts & Hands</span>
          </h1>
          <p className="hero-subtitle">Making volunteering simpler, smarter, and more impactful</p>
          <div className="cta-container">
            <Link to="/register" className="cta-button primary">Join as Volunteer</Link>
            <Link to="/login" className="cta-button secondary">Sign In</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-container">
            <div className="floating-shape shape1"></div>
            <div className="floating-shape shape2"></div>
            <div className="floating-shape shape3"></div>
          </div>
        </div>
      </section>
      
      {/* Mission section */}
      <section 
        ref={missionRef} 
        className={`mission-section ${isVisible.mission ? 'animate-in' : ''}`}
      >
        <div className="section-container">
          <h2 className="section-title">Our Mission</h2>
          <div className="mission-content">
            <div className="mission-text">
              <p>We're on a mission to revolutionize how volunteers and opportunities connect. Our platform uses cutting-edge technology to ensure the right skills meet the right needs at the right time.</p>
              <p>By streamlining the volunteering process, we help communities thrive and empower individuals to make a meaningful difference.</p>
            </div>
            <div className="mission-visual">
              <div className="pulse-circle"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats section */}
      <section 
        ref={statsRef} 
        className={`stats-section ${isVisible.stats ? 'animate-in' : ''}`}
      >
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="stat-card"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Features section */}
      <section 
        ref={featuresRef} 
        className={`features-section ${isVisible.features ? 'animate-in' : ''}`}
      >
        <div className="section-container">
          <h2 className="section-title">Cutting-Edge Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Join our community of change-makers today and start your volunteering journey.</p>
          <Link to="/register" className="cta-button primary">Get Started Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 