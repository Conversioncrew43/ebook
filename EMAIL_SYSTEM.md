# Automated Email System

This system sends automated emails for various events in the Aditya Construction application.

## Setup

1. Install dependencies: `npm install nodemailer`
2. Configure environment variables in `.env`:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=http://localhost:3000
   ```

## Email Triggers

### 1. User Registration

- **When**: New user account created
- **Recipient**: New user
- **Content**: Welcome message with account details

### 2. Project Assignment

- **When**: User assigned to project team
- **Recipient**: Assigned team member
- **Content**: Project details and assignment notification

### 3. Bill Generation

- **When**: New bill created for client
- **Recipient**: Client (if they have user account with role 'client')
- **Content**: Bill details and payment information

### 4. Password Reset

- **When**: User requests password reset
- **Recipient**: User
- **Content**: Reset link (valid for 1 hour)

## Email Templates

Located in `utils/email.js`:

- `welcomeUser(user)` - Welcome new users
- `projectAssigned(user, project)` - Project team assignments
- `billGenerated(client, bill)` - Bill notifications
- `passwordReset(user, token)` - Password reset links

## Configuration

Uses Gmail SMTP by default. To change:

1. Update `utils/email.js` transporter configuration
2. Set appropriate environment variables

## Testing

Emails are sent asynchronously and logged to console. Check server logs for delivery status.

## Security Notes

- Password reset tokens expire in 1 hour
- Tokens are cryptographically secure
- Email sending failures don't break main functionality
