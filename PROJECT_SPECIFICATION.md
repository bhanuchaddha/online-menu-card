# Online Menu Card - Project Specification

## 📋 Project Overview

**Vision**: Create a comprehensive web application and PWA that allows restaurants to digitize their menus by simply taking a photo, with AI-powered menu extraction and beautiful theme generation.

**Mission**: Simplify the process for restaurants to create professional online menus without technical expertise.

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion (animations)
- **UI Components**: Radix UI + Shadcn/ui
- **State Management**: Zustand
- **PWA**: Next-PWA plugin
- **Camera Integration**: React-Camera-Pro
- **Image Processing**: Canvas API + Sharp

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM (Free: Supabase/Neon)
- **Authentication**: NextAuth.js with Google OAuth (Free)
- **File Storage**: Cloudinary (Free tier: 25GB)
- **AI Integration**: OpenRouter API (Multiple LLM access with free credits)
- **Image Processing**: LLM-based extraction via OpenRouter

### Infrastructure & Deployment
- **Hosting**: Vercel (Free tier for personal projects)
- **Database**: Supabase PostgreSQL (Free tier: 500MB)
- **CDN**: Cloudinary (Free tier: 25GB bandwidth)
- **Domain**: Vercel subdomain (Free) + Custom domain later
- **Analytics**: Google Analytics 4 (Free)
- **Monitoring**: Sentry (Free tier: 5K errors/month)

### External Services
- **AI/ML**: OpenRouter API (Free credits + multiple LLM options)
- **Authentication**: Google OAuth 2.0 (Free)
- **Payments** (Future): Stripe
- **SMS/WhatsApp** (Future): Twilio
- **Email**: Resend (Free tier: 3K emails/month)

## 🎯 Core Features & Specifications

### 1. User Authentication & Management
- **Google OAuth Integration**
  - One-click signup/signin with Gmail
  - User profile management
  - Session management with JWT tokens
  - Role-based access (Restaurant Owner, Customer, Admin)

### 2. Menu Photo Capture & Processing
- **Camera Integration**
  - Native camera access in PWA
  - Photo capture with preview
  - Multiple photo upload support
  - Image compression and optimization
  
- **AI Menu Extraction**
  - OpenRouter API integration with multiple LLM options
  - Primary: GPT-4 Vision, Claude 3, or Llama Vision (best available)
  - Extract menu items, prices, descriptions, categories
  - Category identification (Appetizers, Mains, Desserts, etc.)
  - Multi-language support
  - Cost optimization by choosing best price/performance LLM
  - Fallback OCR with Tesseract.js if needed

### 3. Restaurant Profile & Theme System
- **Profile Setup**
  - Restaurant name, description, contact info
  - Logo upload and management
  - Operating hours and location
  - Social media links
  
- **Theme Selection**
  - 10+ pre-built premium themes
  - Customizable color schemes
  - Typography options
  - Layout variations (Grid, List, Card)
  - Theme preview system

### 4. Menu Management System
- **Menu Builder**
  - Drag-and-drop menu organization
  - Category management
  - Item editing (name, price, description, image)
  - Availability toggle
  - Special offers and discounts
  
- **Real-time Updates**
  - Instant price updates
  - Menu item availability
  - Version control for menu changes
  - Bulk operations

### 5. Public Menu Display
- **Customer-Facing Menu**
  - Beautiful, responsive menu display
  - Theme-based styling with animations
  - Search and filter functionality
  - Category navigation
  - Item details modal
  - QR code generation for easy access
  
- **Ordering Interface** (Phase 2)
  - Add to cart functionality
  - Order summary
  - Customer contact form
  - WhatsApp integration for orders

### 6. Restaurant Discovery & Sharing
- **Public Directory**
  - Restaurant listing page
  - Search by location, cuisine, name
  - Featured restaurants
  - Rating and review system (Future)
  
- **Sharing & Integration**
  - Unique restaurant URLs
  - QR code generation
  - Social media sharing
  - Embeddable menu widgets

## 🚀 Development Phases

### Phase 1: Foundation (Weeks 1-3)
**Goal**: Core infrastructure and basic functionality

#### Week 1: Project Setup & Authentication
- Next.js project initialization with TypeScript
- Database schema design and Prisma setup
- NextAuth.js Google OAuth integration
- Basic UI components with Shadcn/ui
- User registration and profile pages

#### Week 2: Camera & Image Processing
- Camera integration for photo capture
- Image upload and storage system
- OpenRouter API integration for AI menu extraction
- Basic menu extraction functionality
- Error handling and fallbacks

#### Week 3: Menu Management
- Menu data models and API endpoints
- Basic menu creation and editing interface
- Category and item management
- Image association with menu items
- Data validation and sanitization

**Phase 1 Testing**:
- User authentication flow testing
- Camera functionality across devices
- AI menu extraction accuracy testing
- Basic CRUD operations for menus

### Phase 2: Theme System & Public Display (Weeks 4-6)

#### Week 4: Theme Engine
- Theme system architecture
- 5 initial premium themes development
- Theme preview and selection interface
- CSS-in-JS theme engine
- Customization options (colors, fonts)

#### Week 5: Public Menu Display
- Customer-facing menu pages
- Theme rendering system
- Responsive design for all devices
- Search and filter functionality
- Performance optimization

#### Week 6: Restaurant Profiles
- Restaurant profile management
- Logo and image upload system
- Contact information management
- Public restaurant directory
- SEO optimization

**Phase 2 Testing**:
- Theme switching and customization
- Cross-device responsive testing
- Performance testing (Core Web Vitals)
- SEO and accessibility testing

### Phase 3: Advanced Features & PWA (Weeks 7-9)

#### Week 7: PWA Implementation
- Service worker setup
- Offline functionality
- Push notifications setup
- App manifest configuration
- Install prompts and app-like experience

#### Week 8: Enhanced UI/UX
- Advanced animations with Framer Motion
- Micro-interactions and transitions
- Loading states and skeletons
- Error boundaries and user feedback
- Advanced search and filtering

#### Week 9: Sharing & Discovery
- QR code generation
- Social media sharing
- Restaurant discovery features
- URL shortening
- Analytics integration

**Phase 3 Testing**:
- PWA functionality testing
- Offline capability testing
- Animation performance testing
- Cross-platform compatibility

### Phase 4: Production & Optimization (Weeks 10-12)

#### Week 10: Performance & Security
- Code splitting and lazy loading
- Image optimization and CDN
- Security hardening
- Rate limiting and abuse prevention
- Comprehensive error handling

#### Week 11: Advanced Menu Features
- Bulk menu operations
- Menu versioning
- Advanced pricing options
- Seasonal menus
- Multi-location support

#### Week 12: Launch Preparation
- Final testing and bug fixes
- Documentation and user guides
- Analytics and monitoring setup
- SEO optimization
- Launch marketing preparation

**Phase 4 Testing**:
- Load testing and performance optimization
- Security penetration testing
- User acceptance testing
- Cross-browser compatibility
- Final end-to-end testing

## 📊 Application Development Plan

### Testing Strategy

#### Unit Testing
- **Framework**: Jest + React Testing Library
- **Coverage**: API endpoints, utility functions, components
- **Target**: 80% code coverage minimum

#### Integration Testing
- **Framework**: Playwright
- **Scope**: API integration, database operations, external services
- **Automation**: CI/CD pipeline integration

#### End-to-End Testing
- **Framework**: Playwright
- **Scenarios**: Complete user journeys, critical paths
- **Devices**: Desktop, tablet, mobile testing

#### Performance Testing
- **Tools**: Lighthouse, WebPageTest, LoadRunner
- **Metrics**: Core Web Vitals, load times, mobile performance
- **Targets**: 
  - First Contentful Paint < 1.5s
  - Largest Contentful Paint < 2.5s
  - Cumulative Layout Shift < 0.1

### Quality Assurance

#### Code Quality
- **Linting**: ESLint + Prettier
- **Type Safety**: TypeScript strict mode
- **Code Review**: Pull request reviews
- **Git Hooks**: Pre-commit hooks for quality checks

#### Security Testing
- **Authentication**: OAuth flow security
- **Data Protection**: Input validation, SQL injection prevention
- **File Upload**: Malware scanning, file type validation
- **API Security**: Rate limiting, CORS, headers

### Deployment Strategy

#### Staging Environment
- **Purpose**: Testing and client review
- **Data**: Sanitized production data
- **Access**: Password protected
- **Updates**: Automatic deployment from develop branch

#### Production Environment
- **Hosting**: Vercel with custom domain
- **Database**: Production PostgreSQL with backups
- **Monitoring**: Real-time error tracking and performance monitoring
- **Backups**: Daily automated backups with point-in-time recovery

### Success Metrics

#### Technical Metrics
- **Performance**: 90+ Lighthouse score
- **Uptime**: 99.9% availability
- **Security**: Zero critical vulnerabilities
- **Test Coverage**: 80%+ code coverage

#### Business Metrics
- **User Adoption**: 100 restaurants in first 3 months
- **Menu Accuracy**: 95%+ AI extraction accuracy
- **User Retention**: 70%+ monthly active users
- **Performance**: < 3s average page load time

## 🔮 Future Enhancements (Phase 5+)

### Advanced Features
- **Online Ordering System**
  - Shopping cart and checkout
  - Payment gateway integration (Stripe)
  - Order management dashboard
  - Real-time order tracking

- **Customer Management**
  - Customer accounts and order history
  - Loyalty programs and rewards
  - Email marketing integration
  - Customer feedback system

- **Analytics & Insights**
  - Menu performance analytics
  - Customer behavior insights
  - Revenue tracking
  - A/B testing for menu layouts

- **Multi-Platform Integration**
  - WhatsApp Business API integration
  - Instagram/Facebook menu sync
  - Google My Business integration
  - Third-party delivery platform sync

- **Advanced AI Features**
  - Menu optimization suggestions
  - Dynamic pricing recommendations
  - Inventory management integration
  - Customer preference analysis

## 💰 Startup Costs & Monetization

### MVP Development Costs (First 6 Months)
- **Hosting**: $0 (Vercel free tier)
- **Database**: $0 (Supabase free tier - 500MB)
- **AI Processing**: $10-50/month (OpenRouter pay-per-use)
- **File Storage**: $0 (Cloudinary free tier - 25GB)
- **Monitoring**: $0 (Sentry free tier)
- **Total**: **$10-50/month** for MVP testing

### Monetization Strategy

#### Freemium Model
- **Free Tier**: Basic menu creation, 1 theme, standard support
- **Pro Tier ($19/month)**: All themes, analytics, custom domain
- **Enterprise ($49/month)**: Multi-location, API access, priority support

#### Additional Revenue Streams
- **Commission on Orders**: 2-3% on online orders (Phase 5)
- **Premium Themes**: $29 one-time purchase
- **Custom Development**: Bespoke solutions for large chains
- **White-label Solutions**: Licensed platform for other businesses

### Scaling Benefits with OpenRouter
- **Cost Efficiency**: Choose cheapest LLM for each task
- **Model Flexibility**: Switch between models based on performance/cost
- **Free Credits**: Get started with OpenRouter's free tier
- **No Vendor Lock-in**: Not tied to single AI provider

## 🎨 Design Philosophy

### Visual Design
- **Modern & Clean**: Minimalist design with focus on content
- **Mobile-First**: Progressive enhancement from mobile to desktop
- **Accessibility**: WCAG 2.1 AA compliance
- **Brand Consistency**: Cohesive design system across all touchpoints

### User Experience
- **Simplicity**: Intuitive interface requiring minimal learning curve
- **Speed**: Fast interactions with optimistic UI updates
- **Reliability**: Graceful error handling and offline capabilities
- **Personalization**: Customizable experience for different user types

### Animation & Interactions
- **Purposeful**: Animations that enhance usability, not just decoration
- **Performance**: 60fps animations with hardware acceleration
- **Accessibility**: Respect for reduced motion preferences
- **Delight**: Micro-interactions that create emotional connection

---

## Next Steps

1. **Technology Stack Confirmation**: Review and approve the proposed technology choices
2. **Design System Creation**: Develop the core design system and component library
3. **Development Environment Setup**: Initialize the project with all necessary configurations
4. **Phase 1 Implementation**: Begin with user authentication and basic functionality

Would you like me to proceed with setting up the development environment and starting Phase 1 implementation?