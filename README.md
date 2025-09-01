# Taxo - Healthcare Referral Management System

An intelligent system that streamlines the healthcare referral process by capturing referrals, extracting key information, verifying insurance eligibility, and scheduling patients automatically.

## Features

- **Multi-Source Referral Capture**: Accept referrals from secure email, web forms, EHR systems, fax, and portal uploads
- **Document Processing**: Automatically extract patient information, insurance details, and medical requirements from uploaded documents
- **Insurance Verification**: Check eligibility in real-time and flag missing information
- **Case Management**: Track referral status with a comprehensive dashboard
- **Automated Scheduling**: Schedule patients once eligibility is confirmed
- **Notifications**: Notify all parties via email, SMS, and dashboard updates

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: Convex
- **File Uploads**: Uploadthing
- **Styling**: Tailwind CSS, Shadcn UI
- **UI Components**: Radix UI

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd taxo
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=your_convex_deployment

# Uploadthing
UPLOADTHING_TOKEN=your_uploadthing_token
```

### Running the Application

1. Start the Convex development server:

```bash
pnpm convex dev
```

2. In a new terminal, start the Next.js development server:

```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Create a New Referral**:
   - Navigate to "/new-referral" or click "Create New Referral" button
   - Select the referral source
   - Set priority level
   - Add optional notes
   - Upload referral documents (PDF, images, Word documents)

2. **View Cases**:
   - Navigate to "/cases" to see all referral cases
   - Click on any case to view detailed information
   - Track case status, documents, and activity logs

## Project Structure

```
taxo/
├── convex/           # Convex backend functions and schema
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   └── lib/          # Utility functions and configurations
├── public/           # Static assets
└── package.json      # Project dependencies
```

## Next Steps

This is the foundation for the referral management system. Future enhancements will include:

- AI-powered document extraction using OpenAI
- Insurance eligibility API integration
- Automated scheduling system
- Email/SMS notification system
- Advanced case filtering and search
- User authentication and role-based access control

## License

[Your License Here]
