# 🎯 Thrive Circle - Coaching Management Platform

A comprehensive React-based coaching management platform built with Material UI v5, featuring goal tracking, task management, and client-coach collaboration tools.

## ✨ Features

### 🎯 **Goals & Tasks Management**
- **Goal Creation**: Create detailed goals with titles, descriptions, categories, and success criteria
- **Progress Tracking**: Visual progress bars and milestone management
- **Workflow Charts**: Interactive pie charts showing milestone completion status
- **Metrics & Analytics**: Time-series charts for tracking progress over time
- **Real-time Updates**: Live progress tracking and metric updates

### 👥 **User Management**
- **Role-based Access**: Admin, Coach, and Client roles with different permissions
- **Client Management**: Comprehensive client profiles with goals, sessions, and progress
- **Coach Management**: Coach profiles with specialties, ratings, and availability
- **Approval Workflows**: Coach approval and verification system

### 📊 **Assessment System**
- **Assessment Templates**: Pre-built templates for various coaching scenarios
- **Question Types**: Single/multi-select, Likert scales, text responses, and file uploads
- **Results Analysis**: Comprehensive assessment results with insights
- **Progress Tracking**: Monitor client development over time

### 💬 **Messaging & Communication**
- **Real-time Chat**: Live messaging with typing indicators and read receipts
- **File Attachments**: Secure file sharing with virus scanning
- **Thread Management**: Organized conversation threads with search capabilities
- **Moderation Tools**: Content moderation and audit logging

### 📈 **Analytics & Reporting**
- **Dashboard**: KPI overview with revenue trends and client statistics
- **Progress Reports**: Detailed progress tracking and milestone completion
- **Performance Metrics**: Coach and client performance analytics
- **Revenue Tracking**: Financial reporting and invoice management

## 🚀 Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material UI v5 (MD3 Design System)
- **State Management**: TanStack React Query
- **Routing**: React Router v6+
- **Charts**: Recharts for data visualization
- **Date Handling**: Day.js for date manipulation
- **Form Management**: React Hook Form + Zod validation
- **API Mocking**: MSW (Mock Service Worker)
- **Build Tool**: Create React App (CRA)

## 🎨 Design System

- **Theme**: Custom purple MD3 theme with gradients
- **Typography**: Avenir font family for modern readability
- **Colors**: Primary (#6750A4), Secondary (#B69DF8)
- **Components**: Rounded cards, gradient backgrounds, smooth transitions
- **Responsive**: Mobile-first design with responsive breakpoints

## 📁 Project Structure

```
src/
├── app/                    # Core application files
│   ├── AppShell.tsx       # Main navigation and layout
│   ├── providers/         # Theme and query client providers
│   └── router.tsx         # Application routing
├── features/              # Feature-based modules
│   ├── dashboard/         # Dashboard and analytics
│   ├── clients/          # Client management
│   ├── coaches/          # Coach management
│   ├── tasks/            # Goals and task management
│   ├── assessments/      # Assessment system
│   ├── messages/         # Messaging and communication
│   └── ...               # Other feature modules
├── lib/                   # Shared utilities and types
│   └── types.ts          # TypeScript interfaces
└── mocks/                 # Mock data and API handlers
    ├── db.ts             # Mock database
    └── handlers.ts       # MSW API handlers
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/thrive-circle.git
   cd thrive-circle
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📱 Available Scripts

- `npm start` - Start development server with MSW
- `npm run build` - Build production bundle
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🌐 API Endpoints

The application uses MSW for API mocking in development:

- `GET /api/dashboard/summary` - Dashboard overview data
- `GET /api/goals` - List all goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `GET /api/clients` - List all clients
- `GET /api/coaches` - List all coaches
- `GET /api/assessments` - Assessment templates and results

## 🎯 Key Features in Detail

### Goals Management
- Create goals with detailed descriptions and success criteria
- Set target dates and track progress
- Add milestones and track completion
- Monitor metrics with time-series charts

### Workflow Visualization
- Interactive pie charts for milestone status
- Progress bars with gradient styling
- Real-time updates and status changes
- Visual goal hierarchy and relationships

### Client-Coach Collaboration
- Role-based access control
- Secure messaging system
- File sharing with virus scanning
- Progress tracking and reporting

## 🔧 Development

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern browser with ES6+ support

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture

### Testing
- Jest for unit testing
- React Testing Library for component testing
- MSW for API mocking

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🚀 Deployment

The application can be deployed to any static hosting service:

- **Vercel**: Zero-config deployment
- **Netlify**: Easy CI/CD integration
- **GitHub Pages**: Free hosting for open source
- **AWS S3**: Scalable cloud hosting

## 📊 Performance

- **Bundle Size**: Optimized with code splitting
- **Loading**: Fast initial load with lazy loading
- **Caching**: Efficient caching strategies
- **Accessibility**: WCAG 2.1 AA compliant

---

**Built with ❤️ using React and Material UI**
