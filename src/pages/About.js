import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { getStaticUrl } from '../config/api';
import './About.css';

const About = () => {
    const { settings } = useSettings();

    return (
        <div className="about-page">
            <section className="about-hero">
                <div className="container">
                    <h1 className="about-title">{settings.heritageLabel || "Our Heritage"}</h1>
                    <p className="about-subtitle">{settings.heritageSubtitle || "The Art of Olfactory Excellence"}</p>
                </div>
            </section>

            <section className="about-content">
                <div className="container">
                    <div className="about-grid">
                        <div className="about-image">
                            <img
                                src={getStaticUrl(settings.heritageImage) || "https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?w=800"}
                                alt={settings.shopName || "Bahaar Heritage"}
                            />
                        </div>
                        <div className="about-text">
                            <h2>{settings.heritageTitle || "Inspired by Nature, Crafted by Science"}</h2>
                            <div className="about-description">
                                <p>
                                    {settings.heritageDescription1 || "At Bahaar Scentiments, we believe that fragrance is more than just a scent; it's an identity."}
                                </p>
                                {settings.heritageDescription2 && (
                                    <p>{settings.heritageDescription2}</p>
                                )}
                            </div>
                            <div className="about-values">
                                {settings.heritageStats && settings.heritageStats.length > 0 ? (
                                    settings.heritageStats.map((stat, index) => (
                                        <div className="value-item" key={index}>
                                            <h3>{stat.value}</h3>
                                            <p>{stat.label}</p>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <div className="value-item">
                                            <h3>Pure Essence</h3>
                                            <p>We use only the highest concentration of fragrance oils for lasting impact.</p>
                                        </div>
                                        <div className="value-item">
                                            <h3>Ethically Sourced</h3>
                                            <p>Our ingredients are responsibly sourced from the finest gardens globally.</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
