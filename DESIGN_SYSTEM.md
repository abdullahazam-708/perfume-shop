# 🎨 Premium Design System Reference

## Color Palette

### Primary Colors
```css
--primary-color: #D4AF37;        /* Luxurious Gold */
--primary-dark: #B8941F;         /* Deep Gold */
--secondary-color: #0A0A0A;      /* Rich Black */
--dark-color: #121212;           /* Deep Black */
--light-color: #FAFAFA;          /* Soft White */
--cream: #F8F6F3;                /* Warm Cream */
```

### Text Colors
```css
--text-dark: #0A0A0A;            /* Primary text */
--text-light: #6B6B6B;           /* Secondary text */
--text-muted: #999999;           /* Tertiary text */
--white: #FFFFFF;                /* White text */
```

## Gradients

### Gold Gradients
```css
--gold-gradient: linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #C5A028 100%);
--gold-gradient-subtle: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(244, 208, 63, 0.05) 100%);
```

### Dark Gradient
```css
--dark-gradient: linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%);
```

### Shimmer Effect
```css
--shimmer: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
```

## Shadows

### Standard Shadows
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
--shadow-md: 0 8px 24px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 24px 64px rgba(0, 0, 0, 0.2);
```

### Gold Shadows (Premium)
```css
--shadow-gold: 0 8px 32px rgba(212, 175, 55, 0.25);
--shadow-gold-lg: 0 16px 48px rgba(212, 175, 55, 0.35);
```

## Transitions

### Easing Functions
```css
--transition-smooth: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
--transition-spring: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
--transition-fast: all 0.2s ease-out;
```

## Glass Effects

```css
--glass: rgba(255, 255, 255, 0.95);
--glass-dark: rgba(10, 10, 10, 0.92);
--glass-gold: rgba(212, 175, 55, 0.15);
```

### Usage Example
```css
.glassmorphism-element {
  background: var(--glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

## Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
--radius-xl: 24px;
```

## Typography

### Font Families
```css
/* Headings */
font-family: 'Cormorant Garamond', serif;

/* Body Text */
font-family: 'Outfit', sans-serif;
```

### Font Sizes (Headings)
- **H1**: 6rem (96px) - Hero titles
- **H2**: 4.5rem (72px) - Section titles
- **H3**: 3.5rem (56px) - Subsection titles
- **H4**: 3rem (48px) - Statistics

### Font Sizes (Body)
- **Large**: 1.15rem (18.4px) - Hero description
- **Medium**: 1rem (16px) - Body text
- **Small**: 0.95rem (15.2px) - Secondary text
- **Tiny**: 0.85rem (13.6px) - Labels

### Letter Spacing
- **Headings**: -0.02em to 0.02em
- **Uppercase Text**: 2px to 6px
- **Body Text**: 0.3px to 0.5px

## Common Patterns

### Gradient Text
```css
.gradient-text {
  background: var(--gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Hover Lift Effect
```css
.hover-lift {
  transition: var(--transition-smooth);
}

.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-gold);
}
```

### Animated Underline
```css
.animated-underline {
  position: relative;
}

.animated-underline::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--gold-gradient);
  transition: var(--transition-smooth);
}

.animated-underline:hover::after {
  width: 100%;
}
```

### Ripple Button Effect
```css
.ripple-button {
  position: relative;
  overflow: hidden;
}

.ripple-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.ripple-button:hover::before {
  width: 300px;
  height: 300px;
}
```

### Fade In Up Animation
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 1s ease-out;
}
```

### Pulse Animation
```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

## Component Spacing

### Padding
- **Section**: 8rem to 12rem (128px to 192px)
- **Container**: 4rem (64px)
- **Card**: 1.5rem to 2rem (24px to 32px)
- **Button**: 1rem to 1.2rem (16px to 19.2px)

### Margins
- **Section Bottom**: 8rem to 10rem (128px to 160px)
- **Element Bottom**: 2rem to 4rem (32px to 64px)
- **Small Gap**: 1rem to 1.5rem (16px to 24px)

### Gaps (Grid/Flex)
- **Large**: 6rem to 8rem (96px to 128px)
- **Medium**: 3rem to 4rem (48px to 64px)
- **Small**: 2rem to 2.5rem (32px to 40px)

## Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 1025px) { }

/* Tablet */
@media (max-width: 1024px) { }

/* Mobile */
@media (max-width: 768px) { }

/* Small Mobile */
@media (max-width: 480px) { }
```

## Best Practices

### 1. Always Use CSS Variables
```css
/* ✅ Good */
color: var(--primary-color);

/* ❌ Bad */
color: #D4AF37;
```

### 2. Layer Shadows for Depth
```css
/* Premium look */
box-shadow: 
  var(--shadow-md),
  0 0 0 1px rgba(212, 175, 55, 0.1);
```

### 3. Combine Transforms
```css
/* Smooth, premium interaction */
transform: translateY(-8px) scale(1.02);
```

### 4. Use Backdrop Filters
```css
/* Modern glassmorphism */
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
```

### 5. Stagger Animations
```css
/* Create flow */
.element-1 { animation-delay: 0s; }
.element-2 { animation-delay: 0.2s; }
.element-3 { animation-delay: 0.4s; }
```

---

**This design system ensures consistency and premium quality across your entire website!** 🎨✨
