# 🌍 Global Temperature Visualization

Interactive web application for visualizing and analyzing global temperature anomalies from 1880 to 2025.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Vite](https://img.shields.io/badge/Vite-7.2-646cff)

## 📋 Table of Contents
- [Features](#-features)
- [Demo](#-demo)
- [Installation](#-installation)
- [Usage](#-usage)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

## ✨ Features

### 🗺️ Interactive World Map
- **Heatmap visualization** of global temperature anomalies
- **Two selection modes**:
  - **Latitudes Mode**: Click to select horizontal latitude lines
  - **Areas Mode**: Click or drag to select 4°×4° grid cells
- Real-time visual feedback with color-coded overlays
- Smooth animations and responsive design

### 📊 Multiple Visualization Views

#### 1️⃣ Graph View
- Time series of temperature anomalies (1880-2025)
- Compare multiple zones or groups
- Interactive legend with toggle selection
- Vertical line indicating current year

#### 2️⃣ Histogram View
- Distribution of temperature anomalies by longitude
- Click on bars to highlight corresponding grid cells on the map
- Color-coded bars (blue for cooling, red for warming)
- Dynamic scaling based on selected latitudes

#### 3️⃣ Heatmap View
- Latitude × Year matrix visualization
- Optimized display (45 latitudes × 15 years = 675 cells)
- Click on cells to:
  - Change the current year
  - Highlight the latitude across all views
- Color gradient from blue (cold) to red (hot)
- Toggle selection with second click

### 🎬 Animation Controls
- **Play/Pause** time progression
- **Speed control** (1x, 1.5x, 2x, 2.5x, 3x)
- **Year slider** for manual navigation
- **Direct year input** for precise control
- **Restart button** to reset to 1880

### 🎯 Advanced Selection Features
- **Multi-area selection** with drag rectangle
- **Group management**: Combine multiple zones for comparative analysis
- **Latitude filtering**: Focus on specific climate zones
- **Cross-view synchronization**: Selections update all visualizations

### 🎨 Modern UI/UX
- Responsive layout adapting to screen size
- Smooth transitions and hover effects
- Intuitive control panel with clear visual feedback

## 🎥 Demo

```bash
# Clone and run the project to see it in action!
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Steps

```bash
# Clone the repository
git clone https://github.com/Sam12368/Global_View_Project.git

# Navigate to the project directory
cd Global_View_Project/MainBranch

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🎮 Usage

### Basic Workflow

1. **Select a Mode** (Latitudes or Areas) in the Control Panel
2. **Make Selections** on the World Map:
   - **Latitudes Mode**: Click anywhere horizontally
   - **Areas Mode**: Click individual cells or drag a rectangle
3. **View Analysis** in the Graph, Histogram, and Heatmap panels
4. **Animate Over Time** using the animation controls at the bottom
5. **Interact with Views**:
   - Click histogram bars to highlight longitude on the map
   - Click heatmap cells to change year and highlight latitude
   - Toggle groups in the graph legend for comparison

### Keyboard Shortcuts
- `Space`: Play/Pause animation
- `←/→`: Navigate years manually

## 🛠️ Technology Stack

### Core Technologies
- **React 18** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Vite 7.2** - Fast build tool and dev server
- **Redux Toolkit** - State management

### Visualization & Graphics
- **Chart.js** - Graph and histogram rendering
- **Canvas API** - Heatmap and WorldMap rendering
- Custom SVG overlays for interactive elements

### Data Processing
- **Custom interpolation** for smooth temperature transitions
- **Memoized calculations** for optimal performance
- **Pre-grouped data structures** for fast lookups

### Styling
- Custom CSS with CSS variables
- Responsive design with flexbox/grid

## 📁 Project Structure

```
MainBranch/
├── src/
│   ├── app/
│   │   ├── hooks.ts          # Redux typed hooks
│   │   └── store.ts          # Redux store configuration
│   ├── assets/
│   │   └── tempanomaly_4x4grid_v2.json  # Temperature data
│   ├── components/
│   │   ├── AnimationBar/     # Year slider & animation controls
│   │   ├── Layout/           # App layout & header
│   │   ├── SidePanel/        # Control panel & mode selection
│   │   ├── ViewsGrid/        # Graph, Histogram, Heatmap views
│   │   └── WorldMap/         # Interactive world map
│   ├── features/
│   │   ├── animation/        # Animation state
│   │   ├── data/             # Temperature data state
│   │   ├── selection/        # Areas & latitudes selection state
│   │   ├── views/            # Views visibility state
│   │   └── year/             # Current year state
│   ├── hooks/                # Custom React hooks
│   ├── App.tsx               # Main app component
│   └── main.tsx              # App entry point
├── public/                   # Static assets
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is part of an academic/research initiative for climate data visualization.

## 👥 Authors

- [@Sam12368](https://github.com/Sam12368)

## 🙏 Acknowledgments

- Temperature anomaly data based on global climate records
- Inspired by NASA's climate visualization tools
- Built with modern web technologies for optimal performance

---

**Note**: For detailed feature documentation, see [FEATURES.md](./manuel.md)
