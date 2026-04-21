import React from 'react';
import './ColorTest.css';

const ColorTest = () => {
    return (
        <div className="color-test-page">
            <div className="container" style={{ padding: '4rem 2rem' }}>
                <h1 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '3rem',
                    marginBottom: '3rem',
                    textAlign: 'center'
                }}>
                    Color System Test
                </h1>

                {/* Primary Colors */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Primary Colors</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="color-box" style={{ background: 'var(--primary-color, #D4AF37)' }}>
                            <span>Primary Gold</span>
                            <code>--primary-color</code>
                        </div>
                        <div className="color-box" style={{ background: 'var(--primary-dark, #B8941F)' }}>
                            <span>Primary Dark</span>
                            <code>--primary-dark</code>
                        </div>
                        <div className="color-box" style={{ background: 'var(--secondary-color, #0A0A0A)', color: 'white' }}>
                            <span>Secondary Black</span>
                            <code>--secondary-color</code>
                        </div>
                        <div className="color-box" style={{ background: 'var(--dark-color, #121212)', color: 'white' }}>
                            <span>Dark</span>
                            <code>--dark-color</code>
                        </div>
                    </div>
                </section>

                {/* Gradients */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Gradients</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="color-box" style={{
                            background: 'var(--gold-gradient, linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #C5A028 100%))'
                        }}>
                            <span>Gold Gradient</span>
                            <code>--gold-gradient</code>
                        </div>
                        <div className="color-box" style={{
                            background: 'var(--dark-gradient, linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%))',
                            color: 'white'
                        }}>
                            <span>Dark Gradient</span>
                            <code>--dark-gradient</code>
                        </div>
                    </div>
                </section>

                {/* Text with Gradient */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Gradient Text</h2>
                    <h1 className="gradient-text-gold" style={{
                        fontSize: '4rem',
                        fontFamily: 'Cormorant Garamond, serif',
                        textAlign: 'center'
                    }}>
                        Bahaar Scentiments
                    </h1>
                </section>

                {/* Buttons */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Premium Buttons</h2>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button className="btn-gold">Gold Button</button>
                        <button className="btn-outline-gold">Outline Gold</button>
                        <button className="btn-dark">Dark Button</button>
                        <button className="btn-outline-dark">Outline Dark</button>
                    </div>
                </section>

                {/* Shadows */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Shadows</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
                        <div className="shadow-box shadow-sm">shadow-sm</div>
                        <div className="shadow-box shadow-md">shadow-md</div>
                        <div className="shadow-box shadow-lg">shadow-lg</div>
                        <div className="shadow-box shadow-gold">shadow-gold</div>
                    </div>
                </section>

                {/* Cards */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Premium Cards</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div className="card-premium">
                            <h3>Premium Card</h3>
                            <p>This card has premium styling with hover effects.</p>
                        </div>
                        <div className="card-gold">
                            <h3>Gold Card</h3>
                            <p>This card has gold border and shadow.</p>
                        </div>
                    </div>
                </section>

                {/* Glassmorphism */}
                <section style={{ marginBottom: '3rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '3rem', borderRadius: '16px' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'white' }}>Glassmorphism</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
                            <h4>Glass Light</h4>
                            <p>Frosted glass effect</p>
                        </div>
                        <div className="glass-dark" style={{ padding: '2rem', borderRadius: '12px', color: 'white' }}>
                            <h4>Glass Dark</h4>
                            <p>Dark frosted glass</p>
                        </div>
                        <div className="glass-gold" style={{ padding: '2rem', borderRadius: '12px' }}>
                            <h4>Glass Gold</h4>
                            <p>Gold tinted glass</p>
                        </div>
                    </div>
                </section>

                {/* CSS Variables Check */}
                <section>
                    <h2 style={{ marginBottom: '1.5rem' }}>CSS Variables Status</h2>
                    <div style={{ background: '#f5f5f5', padding: '2rem', borderRadius: '8px', fontFamily: 'monospace' }}>
                        <p>Open browser DevTools (F12) and check the Console for any CSS errors.</p>
                        <p>In the Elements tab, select &lt;html&gt; and check if :root variables are defined.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ColorTest;
