import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getStaticUrl } from '../config/api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        shopName: 'Perfume Store',
        contactEmail: '',
        currency: 'USD',
        logo: '',
        favicon: '',
        address: '',
        phone: '',
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
        whatsapp: '',
        heroImage: '',
        heroBanners: [],
        heritageLabel: 'Our Heritage',
        heritageTitle: 'The Art of Olfactory Seduction',
        heritageDescription1: 'Founded on the belief that a fragrance is the most intimate form of expression, The Velvet Collection merges centuries-old tradition with avant-garde chemistry. Every bottle is a culmination of thousands of hours of research, rare botanicals, and the relentless pursuit of the perfect note.',
        heritageDescription2: 'We do not simply sell perfume; we capture moments in glass. From the fields of Grasse to the modern laboratories of Paris, our journey is one of obsession—an obsession with the invisible architecture of scent.',
        heritageImage: 'https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?w=800',
        heritageStats: [
            { value: '15+', label: 'Rare Extracts' },
            { value: '100%', label: 'Pure Essence' },
            { value: '24h', label: 'Lasting Sillage' }
        ],
        shippingRules: []
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/settings`);
            setSettings(prev => ({ ...prev, ...data }));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (settings.shopName) {
            document.title = settings.shopName;
        }
        if (settings.favicon) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = getStaticUrl(settings.favicon);
        }
    }, [settings.shopName, settings.favicon]);

    const getCurrencySymbol = () => {
        switch (settings.currency) {
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'PKR': return 'Rs';
            default: return '$';
        }
    };

    const value = {
        settings,
        loading,
        fetchSettings,
        getCurrencySymbol
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
