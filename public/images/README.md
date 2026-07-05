# Website Image Assets Directory

This directory is configured to host local static images for your e-commerce platform. Any files placed in this folder can be loaded directly from `/images/<filename>` in your browser or application.

## Asset Mappings & Guidelines

To replace any website image, upload your custom image files into this folder with the matching filenames below:

| Section / Component | Purpose | Filename | Recommended Dimension |
| :--- | :--- | :--- | :--- |
| **Hero Section (Landing)** | White 3D Wireless Headphones | `hero_headphones.png` | 1:1 Aspect Ratio (e.g., `800x800px`) |
| **Promo Slider (Slide 1)** | Luxury Chronograph Watch | `promo_watch.png` | 1:1 Aspect Ratio (e.g., `800x800px`) |
| **Promo Slider (Slide 2)** | Premium ANC Headphones | `promo_headphones.png` | 1:1 Aspect Ratio (e.g., `800x800px`) |
| **Promo Slider (Slide 3)** | Weatherproof Commute Pack | `promo_bag.png` | 1:1 Aspect Ratio (e.g., `800x800px`) |

## Automatic Graceful Fallbacks

Our components are engineered with dynamic fallback logic:
1. They will attempt to load the **local** image from this `/images/` directory first (e.g. `/images/hero_headphones.png`).
2. If the file is not found (or hasn't been uploaded yet), the UI automatically and seamlessly falls back to high-resolution, curated CDN design assets.
