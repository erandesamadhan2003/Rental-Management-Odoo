import { SignIn } from '@clerk/clerk-react'

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-sage-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-sage-800">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-sage-600">
            Welcome back to Rental Management
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn 
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: 
                  'bg-sage-400 hover:bg-sage-500 text-sm normal-case transition-colors',
                card: 'shadow-lg border border-sage-200 bg-white/70 backdrop-blur-sm',
                headerTitle: 'text-sage-800',
                headerSubtitle: 'text-sage-600',
                socialButtonsBlockButton: 'border-sage-200 hover:bg-sage-50',
                formFieldInput: 'border-sage-200 focus:border-sage-400 focus:ring-sage-400',
                footerActionLink: 'text-sage-400 hover:text-sage-500'
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default SignInPage
