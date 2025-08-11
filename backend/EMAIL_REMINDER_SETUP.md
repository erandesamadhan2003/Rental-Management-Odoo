# 📧 Email Reminder System

This document explains the automated email reminder system for rental bookings using Nodemailer.

## 🎯 Overview

The system automatically sends three types of email reminders:
- **6 hours before** rental end time: Friendly reminder
- **At deadline**: Urgent return notice  
- **30 minutes after** deadline: Warning about late return

## 🔧 Setup

### 1. Gmail Configuration

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → App passwords
   - Select "Mail" and your device
   - Copy the 16-character password

### 2. Environment Variables

Add to your `.env` file:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### 3. Test Setup

Run the test script:
```bash
# Test connection only
node test-email-setup.js

# Test with actual email
node test-email-setup.js your-email@example.com
```

## 🚀 How It Works

### Automatic Processing

1. **Cron Job**: Runs every 5 minutes
2. **Smart Filtering**: Only processes bookings that need reminders
3. **Email Tracking**: Prevents duplicate emails using flags
4. **Error Handling**: Continues processing even if some emails fail

### Email Types

#### 1. Reminder Email (6 hours before)
```
Subject: Rental Return Reminder - [Product Name]
Trigger: 6 hours before rental end time
Flag: reminderSent
```

#### 2. Deadline Email (at return time)
```
Subject: Rental Return Due Now - [Product Name] 
Trigger: At rental end time
Flag: deadlineSent
```

#### 3. Warning Email (30 minutes late)
```
Subject: URGENT: Overdue Rental - [Product Name]
Trigger: 30 minutes after rental end time
Flag: warningSent
```

## 🛠 API Endpoints

### Manual Trigger
```http
POST /api/reminders/trigger
```
Manually runs the reminder check (useful for testing)

### Statistics
```http
GET /api/reminders/stats
```
Returns reminder statistics and system status

### Test Email
```http
POST /api/reminders/test-email
Content-Type: application/json

{
  "email": "test@example.com"
}
```

## 📊 Database Schema

Email tracking flags added to Booking model:
```javascript
{
  reminderSent: { type: Boolean, default: false },
  deadlineSent: { type: Boolean, default: false }, 
  warningSent: { type: Boolean, default: false }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check Gmail app password (not regular password)
   - Verify 2FA is enabled
   - Ensure EMAIL_USER is full email address

2. **"Connection timeout"**
   - Check internet connection
   - Verify Gmail SMTP is not blocked by firewall

3. **"Invalid recipients"**
   - Check email addresses in user database
   - Verify user data is properly populated

### Debug Logs

The system provides detailed console logs:
```
🔄 Starting rental reminder job...
📧 Processing 5 bookings for reminders
✅ Reminder email sent to user@example.com
❌ Failed to send email: Invalid recipient
📊 Processed 5 bookings, 4 emails sent, 1 failed
```

### Testing Email Templates

Use the test endpoint to preview emails:
```bash
curl -X POST http://localhost:3000/api/reminders/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

## 📋 Monitoring

### Check System Status

1. **Server Logs**: Watch for cron job execution every 5 minutes
2. **API Stats**: Call `/api/reminders/stats` for statistics  
3. **Database**: Check email flags on booking records
4. **Manual Test**: Use trigger endpoint to test immediately

### Performance Notes

- Cron job processes all relevant bookings in batches
- Failed emails don't stop processing of other bookings
- Email flags prevent duplicate sends
- System continues even if email service is temporarily down

## 🔒 Security

- App passwords are more secure than regular passwords
- Email credentials stored in environment variables
- No sensitive data logged in email failures
- Failed email attempts don't expose user data

## 📈 Scaling

For high-volume usage:
- Consider rate limiting email sends
- Add email queuing system
- Monitor Gmail daily send limits
- Add backup email service providers

## 🎯 Quick Start Checklist

- [ ] Gmail 2FA enabled
- [ ] App password generated
- [ ] Environment variables set
- [ ] Test script passes
- [ ] Server started
- [ ] Cron job logs appear every 5 minutes
- [ ] Test email received successfully

✅ **System Ready!** Automated rental reminders are now active.
