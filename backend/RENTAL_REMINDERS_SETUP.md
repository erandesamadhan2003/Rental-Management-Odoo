# Rental Reminder Email System Setup

## Overview
This system automatically sends rental reminder emails to customers based on their booking end dates:
- **6 hours before** end date: Reminder to return
- **At end date**: Rental period ended notice  
- **30 minutes after** end date: Overdue warning

## Quick Setup

### 1. Environment Variables
Add these to your `.env` file:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Gmail Setup (Recommended)
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate an app password for "Mail"
4. Use your Gmail address and the generated app password

### 3. Database Migration
The system automatically adds these fields to your Booking model:
- `reminderSent: Boolean` (default: false)
- `deadlineSent: Boolean` (default: false)  
- `warningSent: Boolean` (default: false)

### 4. Start the Server
```bash
npm start
# or
npm run dev
```

The cron job will automatically start and run every 5 minutes.

## API Endpoints for Testing

### Manual Trigger
```bash
POST /api/reminders/trigger
```
Manually triggers the reminder job for testing.

### Get Statistics  
```bash
GET /api/reminders/stats
```
Returns reminder statistics for active bookings.

### Test Email
```bash
POST /api/reminders/test-email
Content-Type: application/json

{
  "email": "test@example.com"
}
```
Sends a test reminder email to verify configuration.

## How It Works

### Cron Schedule
- Runs every 5 minutes: `*/5 * * * *`
- Only processes bookings with status: `confirmed` or `in_rental`
- Prevents duplicate emails using boolean flags

### Email Types

#### 1. Reminder Email (6 hours before)
- Friendly reminder with rental details
- Preparation instructions
- Contact information

#### 2. Deadline Email (at end time)
- Official end notice
- Return instructions  
- Late fee warnings

#### 3. Warning Email (30 minutes after)
- Urgent overdue notice
- Late fee notifications
- Immediate action required
- Updates booking `returnStatus` to `late`

### Safety Features
- Prevents duplicate job runs
- Email connection testing
- Comprehensive error logging
- Flag-based email tracking
- Graceful error handling

## Monitoring

### Console Logs
The system provides detailed logging:
```
🔄 Running rental reminder cron job...
📋 Found 5 active bookings to process
📧 Reminder email sent for booking 64f7b8c9e1234567890abcde
✅ Processed 3 reminders successfully
```

### Check Stats
```bash
curl http://localhost:3000/api/reminders/stats
```

### Manual Testing
```bash
# Trigger job manually
curl -X POST http://localhost:3000/api/reminders/trigger

# Test email config
curl -X POST http://localhost:3000/api/reminders/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test@email.com"}'
```

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check EMAIL_USER and EMAIL_PASS in .env
   - Verify Gmail app password is correct
   - Test with `/api/reminders/test-email`

2. **Cron job not running**
   - Check server logs for initialization message
   - Verify booking statuses are 'confirmed' or 'in_rental'
   - Check booking end dates

3. **Duplicate emails**
   - System prevents duplicates using boolean flags
   - Check flag values in database if issues persist

### Email Provider Alternatives

For other email providers, modify `emailReminder.service.js`:

```javascript
// For Outlook/Hotmail
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// For custom SMTP
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Production Recommendations

1. **Use professional email service** (SendGrid, AWS SES, etc.)
2. **Monitor email delivery rates**
3. **Set up email logging/tracking**
4. **Configure proper DNS records** (SPF, DKIM)
5. **Use environment-specific configurations**
6. **Set up error alerting**

## Support
For issues or questions, check the server logs or contact the development team.
