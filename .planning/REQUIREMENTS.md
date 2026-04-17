# Requirements: Modern Premium AI SaaS Redesign

## 1. Aesthetic Context
- **Theme:** Dark Mode First.
- **Background Color:** `#0F0F0F` (Dark Obsidian).
- **Surface Color:** `#1A1A1A` (Ebonite).
- **Accent:** Blue-to-Purple Gradient.
- **Geometry:** Rounded corners (12-16px).
- **Interactions:** Smooth transitions (200-300ms), minimalist microinteractions.
- **Typography:** Modern sans-serif (Inter preferred).

## 2. Global Layout
- **Top Navigation:**
  - Sticky at top.
  - Left: App Logo (Link to Home).
  - Center: Nav Links (Chat, Voice, Image, Video) + Tools Dropdown.
  - Right: User Profile with Avatar (Plan, Settings, Logout).
- **Left Sidebar:**
  - Fixed position.
  - Top: "+ New Chat" CTA + Search Chat input.
  - Middle: Scrollable Chat History (Today, Yesterday, Older).
  - Bottom: Feature Request + User Profile Card (Name, Plan Badge, Upgrade Button).
- **Main Area:**
  - Scrollable content area.

## 3. Page Specifications

### Chat Page
- **Empty State:** Centered "Ask anything..." input box.
- **Active State:** Scrollable message list (User vs AI bubbles).
- **Input:** Sticky bottom input bar.
- **Features:** Message copying, regeneration, streaming text animation.

### Voice Page
- **Visuals:** Animated AI assistant orb/waveform in center.
- **Interaction:** Listening indicator, automatic start.
- **Output:** Post-conversation transcript in chat format (italicized).

### Image Page
- **Inputs:** Prompt field, Style dropdown, Aspect Ratio selector.
- **Gallery:** Responsive grid of generated image cards.
- **Actions:** Download, Delete, Copy Prompt (on hover).

### Video Page Content
- **State:** "Coming Soon" placeholder.
- **Input:** Email field for notifications.

### Tools Page
- **Layout:** Grid of tool cards.
- **Tool List:**
  - AI Writing Humanizer
  - Prompt Enhancer
  - Document Analyzer
  - Image to PDF Maker
  - Background Remover

### Settings Page
- **User Info:** Avatar, Name, Email, Password reset, Account deletion.
- **Plan & Billing:** View current plan, billing history.
- **API Keys:** Key management.
- **Preferences:** Light/Dark toggle.

## 4. Technical Constraints
- No hard dependencies on external UI libraries unless specified (Lucide/Framer Motion already in use).
- Desktop-first responsive design.
- SEO best practices (Semantic HTML, Title/Meta tags).
