import React, { useState } from 'react'
import Navbar from './Navbar'
import TutorialHelp from './Tutorial/TutorialHelp'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'Rental Management System',
    companyEmail: 'admin@rental.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Business St, City, State 12345',
    timezone: 'UTC-5',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    
    // Rental Settings
    defaultRentalDuration: '7',
    maxRentalDuration: '30',
    advancePaymentPercentage: '50',
    securityDepositPercentage: '20',
    lateFeePercentage: '5',
    damageAssessmentEnabled: true,
    autoApproveReturns: false,
    requireSignature: true,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    reminderNotifications: true,
    invoiceNotifications: true,
    paymentNotifications: true,
    
    // Security Settings
    requireTwoFactor: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    maxLoginAttempts: '5',
    
    // Integration Settings
    stripeEnabled: false,
    paypalEnabled: false,
    emailProvider: 'smtp',
    smsProvider: 'twilio'
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    alert('Settings saved successfully!')
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'rental', label: 'Rental', icon: '📦' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'help', label: 'Help', icon: '❓' }
  ]

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800 mb-4">Company Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Company Name</label>
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => handleSettingChange('companyName', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Email</label>
          <input
            type="email"
            value={settings.companyEmail}
            onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Phone</label>
          <input
            type="tel"
            value={settings.companyPhone}
            onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="UTC-5">UTC-5 (Eastern)</option>
            <option value="UTC-6">UTC-6 (Central)</option>
            <option value="UTC-7">UTC-7 (Mountain)</option>
            <option value="UTC-8">UTC-8 (Pacific)</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-2">Address</label>
        <textarea
          value={settings.companyAddress}
          onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => handleSettingChange('currency', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Date Format</label>
          <select
            value={settings.dateFormat}
            onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderRentalSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800 mb-4">Rental Policies</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Default Rental Duration (days)</label>
          <input
            type="number"
            value={settings.defaultRentalDuration}
            onChange={(e) => handleSettingChange('defaultRentalDuration', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Maximum Rental Duration (days)</label>
          <input
            type="number"
            value={settings.maxRentalDuration}
            onChange={(e) => handleSettingChange('maxRentalDuration', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Advance Payment (%)</label>
          <input
            type="number"
            value={settings.advancePaymentPercentage}
            onChange={(e) => handleSettingChange('advancePaymentPercentage', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Security Deposit (%)</label>
          <input
            type="number"
            value={settings.securityDepositPercentage}
            onChange={(e) => handleSettingChange('securityDepositPercentage', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Late Fee (%)</label>
          <input
            type="number"
            value={settings.lateFeePercentage}
            onChange={(e) => handleSettingChange('lateFeePercentage', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="damageAssessment"
            checked={settings.damageAssessmentEnabled}
            onChange={(e) => handleSettingChange('damageAssessmentEnabled', e.target.checked)}
            className="mr-3 rounded text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="damageAssessment" className="text-navy-700">Enable Damage Assessment</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoApprove"
            checked={settings.autoApproveReturns}
            onChange={(e) => handleSettingChange('autoApproveReturns', e.target.checked)}
            className="mr-3 rounded text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="autoApprove" className="text-navy-700">Auto-approve Returns</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="requireSignature"
            checked={settings.requireSignature}
            onChange={(e) => handleSettingChange('requireSignature', e.target.checked)}
            className="mr-3 rounded text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="requireSignature" className="text-navy-700">Require Digital Signature</label>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800 mb-4">Notification Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-navy-700 font-medium">Email Notifications</label>
            <p className="text-sm text-navy-500">Receive notifications via email</p>
          </div>
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
            className="rounded text-purple-600 focus:ring-purple-500"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-navy-700 font-medium">SMS Notifications</label>
            <p className="text-sm text-navy-500">Receive notifications via SMS</p>
          </div>
          <input
            type="checkbox"
            checked={settings.smsNotifications}
            onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
            className="rounded text-purple-600 focus:ring-purple-500"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-navy-700 font-medium">Reminder Notifications</label>
            <p className="text-sm text-navy-500">Rental due date reminders</p>
          </div>
          <input
            type="checkbox"
            checked={settings.reminderNotifications}
            onChange={(e) => handleSettingChange('reminderNotifications', e.target.checked)}
            className="rounded text-purple-600 focus:ring-purple-500"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-navy-700 font-medium">Invoice Notifications</label>
            <p className="text-sm text-navy-500">New invoice alerts</p>
          </div>
          <input
            type="checkbox"
            checked={settings.invoiceNotifications}
            onChange={(e) => handleSettingChange('invoiceNotifications', e.target.checked)}
            className="rounded text-purple-600 focus:ring-purple-500"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-navy-700 font-medium">Payment Notifications</label>
            <p className="text-sm text-navy-500">Payment received confirmations</p>
          </div>
          <input
            type="checkbox"
            checked={settings.paymentNotifications}
            onChange={(e) => handleSettingChange('paymentNotifications', e.target.checked)}
            className="rounded text-purple-600 focus:ring-purple-500"
          />
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800 mb-4">Security & Access</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-navy-700 font-medium">Two-Factor Authentication</label>
            <p className="text-sm text-navy-500">Require 2FA for all users</p>
          </div>
          <input
            type="checkbox"
            checked={settings.requireTwoFactor}
            onChange={(e) => handleSettingChange('requireTwoFactor', e.target.checked)}
            className="rounded text-purple-600 focus:ring-purple-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Password Expiry (days)</label>
          <input
            type="number"
            value={settings.passwordExpiry}
            onChange={(e) => handleSettingChange('passwordExpiry', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Max Login Attempts</label>
          <input
            type="number"
            value={settings.maxLoginAttempts}
            onChange={(e) => handleSettingChange('maxLoginAttempts', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800 mb-4">Third-Party Integrations</h3>
      
      <div className="space-y-6">
        <div className="border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-navy-700 mb-3">Payment Gateways</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold text-sm">S</span>
                </div>
                <div>
                  <label className="text-navy-700 font-medium">Stripe</label>
                  <p className="text-sm text-navy-500">Credit card processing</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.stripeEnabled}
                onChange={(e) => handleSettingChange('stripeEnabled', e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold text-sm">P</span>
                </div>
                <div>
                  <label className="text-navy-700 font-medium">PayPal</label>
                  <p className="text-sm text-navy-500">PayPal payments</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.paypalEnabled}
                onChange={(e) => handleSettingChange('paypalEnabled', e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
        
        <div className="border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-navy-700 mb-3">Communication</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">Email Provider</label>
              <select
                value={settings.emailProvider}
                onChange={(e) => handleSettingChange('emailProvider', e.target.value)}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="smtp">SMTP</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">SMS Provider</label>
              <select
                value={settings.smsProvider}
                onChange={(e) => handleSettingChange('smsProvider', e.target.value)}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="twilio">Twilio</option>
                <option value="nexmo">Nexmo</option>
                <option value="textmagic">TextMagic</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHelpSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800 mb-4">Help & Support</h3>
      
      <div className="space-y-6">
        <div className="border border-purple-200 rounded-lg p-6">
          <h4 className="font-medium text-navy-700 mb-4">Quick Start Guide</h4>
          <p className="text-navy-600 mb-4">
            Take a guided tour of the system to learn about all the features and how to use them effectively.
          </p>
          <TutorialHelp />
        </div>

        <div className="border border-purple-200 rounded-lg p-6">
          <h4 className="font-medium text-navy-700 mb-4">Documentation</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-navy-700">User Guide</p>
                <p className="text-sm text-navy-500">Complete guide for system users</p>
              </div>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                View →
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-navy-700">API Documentation</p>
                <p className="text-sm text-navy-500">For developers and integrations</p>
              </div>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                View →
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-navy-700">FAQ</p>
                <p className="text-sm text-navy-500">Frequently asked questions</p>
              </div>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                View →
              </button>
            </div>
          </div>
        </div>

        <div className="border border-purple-200 rounded-lg p-6">
          <h4 className="font-medium text-navy-700 mb-4">Contact Support</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-navy-700">Email Support</p>
                <p className="text-sm text-navy-500">support@rental.com</p>
              </div>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                Contact →
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-navy-700">Live Chat</p>
                <p className="text-sm text-navy-500">Get instant help</p>
              </div>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                Start Chat →
              </button>
            </div>
          </div>
        </div>

        <div className="border border-purple-200 rounded-lg p-6">
          <h4 className="font-medium text-navy-700 mb-4">System Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-navy-500">Version</p>
              <p className="font-medium text-navy-700">v2.1.0</p>
            </div>
            <div>
              <p className="text-navy-500">Last Updated</p>
              <p className="font-medium text-navy-700">Dec 2024</p>
            </div>
            <div>
              <p className="text-navy-500">Database</p>
              <p className="font-medium text-navy-700">Connected</p>
            </div>
            <div>
              <p className="text-navy-500">Status</p>
              <p className="font-medium text-green-600">All Systems Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'rental':
        return renderRentalSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'security':
        return renderSecuritySettings()
      case 'integrations':
        return renderIntegrationSettings()
      case 'help':
        return renderHelpSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200">
          {/* Header */}
          <div className="border-b border-purple-200 p-6">
            <h1 className="text-3xl font-bold text-midnight-800">Settings</h1>
            <p className="text-navy-600 mt-2">Configure your rental management system</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-purple-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-navy-500 hover:text-navy-700 hover:border-navy-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>

          {/* Footer */}
          <div className="border-t border-purple-200 p-6 bg-purple-50/50">
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 border border-purple-200 text-navy-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
