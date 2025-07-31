# Healthcare Patient & Provider Management System

A comprehensive healthcare application interface built with React, Mantine UI, and TanStack Router that provides welcoming login experiences for both patients and healthcare providers, along with advanced availability management for providers.

## Features

### Patient Login Interface
- **Welcoming Design**: Calming, anxiety-reducing interface with patient-friendly colors
- **Flexible Login**: Email or phone number input with automatic format detection
- **Security Focus**: Prominent privacy notices and security assurances
- **Accessibility**: Large touch targets, high contrast, screen reader support
- **User Support**: Helpful guidance and multiple support options

### Patient Registration Interface
- **User-Friendly Design**: Welcoming, non-intimidating interface for all ages
- **Progressive Disclosure**: Organized form sections with clear headings
- **Accessibility**: Large touch targets, high contrast, keyboard navigation
- **Smart Validation**: Real-time feedback with helpful error messages
- **Legal Compliance**: HIPAA consent, privacy policy, and terms acceptance

### Provider Login Interface
- **Professional Design**: Clean, medical-themed interface for healthcare professionals
- **Email or Phone Number**: Flexible input field that accepts both formats
- **Password**: Secure password input with show/hide toggle functionality
- **Remember Me**: Checkbox for session persistence
- **Forgot Password**: Link for password recovery
- **Register as Provider**: Link to comprehensive registration form

### Provider Registration Interface
- **Personal Information**: Full name, email, phone, profile photo upload
- **Professional Information**: Medical license, specialization, experience, qualifications
- **Practice Information**: Practice name, type, complete address
- **Account Security**: Password with strength indicator, confirm password, terms acceptance

### Provider Availability Management Interface
- **Multi-View Calendar**: Month, week, and day views for comprehensive scheduling
- **Time Slot Management**: Add, edit, delete, and bulk manage availability slots
- **Visual Status System**: Color-coded slots (available, booked, blocked, tentative, break)
- **Advanced Scheduling**: Recurring schedules, appointment types, duration settings
- **Bulk Operations**: Select and modify multiple slots simultaneously
- **Real-time Statistics**: Utilization metrics and availability overview

### Design Requirements
- **Visual Design**: Professional medical theme with calming blues (#3b82f6) and soft greens (#10b981)
- **Layout**: Clean, minimal design with logical form grouping
- **Typography**: Clear, readable fonts with proper contrast
- **Background**: Subtle healthcare-themed background with gradient
- **Icons**: Medical icons (heart, stethoscope, medical cross, etc.)

### User Experience
- **Form Validation**: Real-time validation with helpful error messages
- **Loading States**: Button animation during authentication/registration
- **Error Handling**: Clear error messages for failed attempts
- **Success States**: Smooth transitions and success feedback
- **Responsive Design**: Mobile-first responsive layout

### Accessibility
- Proper form labels and ARIA attributes
- Keyboard navigation and tab order
- Focus management for better usability
- Screen reader compatibility
- High contrast text and backgrounds

### Interactive Elements
- **Photo Upload**: Drag-and-drop area with file preview
- **Specialization Dropdown**: Searchable dropdown with medical specialties
- **Password Strength**: Visual indicator for password requirements
- **Terms & Conditions**: Modal with full terms
- **Form Sections**: Organized into logical groups with dividers
- **Calendar Interactions**: Click to add, drag to select, hover effects
- **Time Management**: Time pickers, duration controls, recurring patterns

### Validation Rules
- Email format validation
- Phone number format validation
- Medical license number validation
- Password strength requirements
- Required field validation
- Real-time validation feedback

### Interactive States
- **Default State**: Clean forms ready for input
- **Loading State**: Button spinners, form disabled during submission
- **Error State**: Clear error messages for validation failures
- **Success State**: Success notifications and redirects

### Security Features
- Password masking by default
- Secure password visibility toggle
- Password strength indicator
- Form auto-complete attributes
- Protection against common attacks

### Responsive Design
- Mobile-optimized layout
- Touch-friendly button sizes
- Proper spacing for different screen sizes
- Horizontal and vertical orientation support

## Technology Stack

- **React 19**: Latest React with hooks and modern patterns
- **TypeScript**: Type-safe development
- **Mantine UI**: Professional UI component library
- **TanStack Router**: Modern file-based routing
- **Vite**: Fast development and build tool

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Credentials

#### Patient Account
- **Email**: `patient@healthcare.com`
- **Password**: `patient123`

#### Provider Account
- **Email**: `demo@healthcare.com`
- **Password**: `password123`

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx              # Root layout
│   ├── index.tsx               # Index route (redirects to patient login)
│   ├── patient-login.tsx       # Patient login page
│   ├── patient-register.tsx    # Patient registration page
│   ├── patient-dashboard.tsx   # Patient dashboard page
│   ├── login.tsx               # Provider login page
│   ├── register.tsx            # Provider registration page
│   ├── dashboard.tsx           # Provider dashboard page
│   └── provider-availability.tsx # Provider availability management
├── main.tsx                    # Application entry point
├── routeTree.gen.ts            # Generated route tree
└── index.css                   # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run router:generate` - Generate route tree

## Patient Login Features

### Welcoming Design
- **Calming Colors**: Soft blues (#3b82f6) and greens (#10b981)
- **Heart Icon**: Comforting medical symbol
- **Warm Messaging**: "Welcome Back" with reassuring tone
- **Security Notice**: Prominent privacy and security information

### User-Friendly Elements
- **Large Input Fields**: Easy-to-tap form controls
- **Clear Instructions**: Helpful placeholder text and labels
- **Visual Feedback**: Loading states and success messages
- **Error Forgiveness**: Understanding error messages with suggestions

### Accessibility Features
- **High Contrast**: Excellent readability for all users
- **Large Touch Targets**: Finger-friendly interface elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper semantic markup

### Support & Guidance
- **Help Links**: Help Center, Contact Support, Privacy Policy
- **Demo Account**: Clear demo credentials for testing
- **Provider Switch**: Easy access to provider login
- **Registration**: Clear path to create new patient account

## Patient Registration Features

### Personal Information
- **Full Name**: First and last name with validation
- **Email Address**: Primary contact email with format validation
- **Phone Number**: Mobile/primary phone with format validation
- **Date of Birth**: User-friendly date picker with age verification (13+)
- **Gender**: Inclusive dropdown options (Male, Female, Other, Prefer not to say)
- **Profile Photo**: Optional upload with preview

### Address Information
- **Street Address**: Full street address
- **City**: City name input
- **State**: Dropdown with US states
- **ZIP Code**: Postal code with format validation

### Emergency Contact
- **Emergency Contact Name**: Full name of emergency contact
- **Relationship**: Dropdown (Spouse, Parent, Sibling, Child, Friend, Other)
- **Emergency Phone**: Contact phone number with validation

### Account Security
- **Password**: Secure password with strength indicator
- **Confirm Password**: Password confirmation with match validation
- **Legal Compliance**: Terms of service, privacy policy, and HIPAA consent

### Design Highlights
- **Welcoming Interface**: Non-intimidating design for all ages
- **Progressive Disclosure**: Organized sections with clear headings
- **Smart Validation**: Real-time feedback with helpful messages
- **Accessibility**: Large touch targets, high contrast, keyboard navigation
- **Mobile-First**: Optimized for smartphone completion

## Provider Availability Management Features

### Calendar Views
- **Month View**: Full month display with availability overview and statistics
- **Week View**: Detailed week grid with time slots and appointment information
- **Day View**: Hour-by-hour breakdown for precise scheduling

### Time Slot Management
- **Add Availability**: Simple interface for creating new time slots
- **Edit Slots**: Modify existing appointments and availability
- **Delete Slots**: Remove time slots with confirmation
- **Bulk Operations**: Select and modify multiple slots simultaneously

### Visual Status System
- **Available Slots**: Green (#10b981) for open appointment times
- **Booked Appointments**: Blue (#3b82f6) for scheduled appointments
- **Blocked Time**: Red (#ef4444) for unavailable periods
- **Tentative/Pending**: Yellow (#f59e0b) for provisional bookings
- **Break Times**: Gray (#6b7280) for scheduled breaks

### Advanced Features
- **Appointment Types**: Consultation, follow-up, emergency, procedure, screening
- **Duration Settings**: 15, 30, 45, 60, 90, 120 minute options
- **Recurring Schedules**: Weekly recurring availability patterns
- **Notes & Comments**: Optional notes for specific time slots
- **Conflict Detection**: Automatic highlighting of scheduling conflicts

### Quick Actions
- **Copy Week Schedule**: Duplicate availability to other weeks
- **Export Schedule**: Generate printable schedules or export data
- **Sync Calendar**: Integration with external calendar applications
- **Bulk Edit Mode**: Toggle for selecting multiple slots

### Statistics & Analytics
- **Weekly Overview**: Available, booked, blocked slots count
- **Utilization Rate**: Percentage of time slots utilized
- **Day Statistics**: Per-day breakdown of appointment status
- **Real-time Updates**: Live statistics as availability changes

## Provider Registration Form Details

### Personal Information
- **First Name**: Required, minimum 2 characters
- **Last Name**: Required, minimum 2 characters
- **Email Address**: Required, valid email format
- **Phone Number**: Required, valid phone format
- **Profile Photo**: Optional image upload with preview

### Professional Information
- **Medical License Number**: Required, minimum 5 characters
- **Specialization**: Required dropdown with 20+ medical specialties
- **Years of Experience**: Required number input (0-50 years)
- **Medical Qualifications**: Required textarea for degrees/qualifications

### Practice Information
- **Practice Name**: Required practice/hospital name
- **Practice Type**: Required dropdown (Private Practice, Hospital, Clinic, etc.)
- **Street Address**: Required street address
- **City**: Required city name
- **State**: Required state name
- **ZIP Code**: Required, valid ZIP code format

### Account Security
- **Password**: Required, minimum 8 characters with strength indicator
- **Confirm Password**: Required, must match password
- **Terms & Conditions**: Required checkbox with modal

## Design System

### Colors
- **Primary Blue**: #3b82f6 (Patient-friendly blue)
- **Secondary Green**: #10b981 (Soft green for actions)
- **Provider Blue**: #2563eb (Professional provider blue)
- **Background**: #f8fafc (Light gray background)
- **Text Primary**: #1e293b (Dark text)
- **Text Secondary**: #64748b (Muted text)

### Typography
- **Font Family**: Inter, system fonts
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold)
- **Line Heights**: Optimized for readability

### Spacing
- Consistent spacing using Mantine's spacing system
- Proper padding and margins for touch targets
- Responsive spacing for different screen sizes

## Medical Specializations

The registration form includes 20+ medical specializations:
- Cardiology, Dermatology, Pediatrics, Neurology
- Orthopedics, Psychiatry, Oncology, Emergency Medicine
- Family Medicine, Internal Medicine, Obstetrics & Gynecology
- Ophthalmology, Radiology, Surgery, Anesthesiology
- Pathology, Urology, Endocrinology, Gastroenterology, Pulmonology

## Practice Types

Available practice types include:
- Private Practice, Hospital, Clinic, Medical Center
- Urgent Care, Specialty Center, Academic Medical Center
- Community Health Center

## Navigation Flow

### Patient Flow
1. **Home** → Patient Login (`/patient-login`)
2. **Login** → Patient Dashboard (`/patient-dashboard`)
3. **Registration** → Patient Registration (`/patient-register`)
4. **Switch** → Provider Login (`/login`)

### Provider Flow
1. **Provider Login** (`/login`)
2. **Registration** → Provider Registration (`/register`)
3. **Login** → Provider Dashboard (`/dashboard`)
4. **Availability** → Provider Availability Management (`/provider-availability`)

## Future Enhancements

- [ ] Password recovery flow
- [ ] Email verification system
- [ ] Two-factor authentication
- [ ] Session management
- [ ] API integration
- [ ] Advanced form validation
- [ ] File upload optimization
- [ ] Accessibility improvements
- [ ] Dark mode support
- [ ] Internationalization (i18n)
- [ ] Multi-step registration wizard
- [ ] Document upload for verification
- [ ] Patient health records integration
- [ ] Appointment scheduling system
- [ ] Telemedicine integration
- [ ] Prescription management
- [ ] Lab results viewing
- [ ] Patient appointment booking interface
- [ ] Real-time notifications
- [ ] Calendar sync with external providers
- [ ] Advanced reporting and analytics
- [ ] Multi-provider practice management
- [ ] Insurance integration
- [ ] Payment processing
- [ ] Electronic health records (EHR) integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
