import { SignIn } from '@clerk/react'

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <SignIn routing="path" path="/login" signUpUrl="/signup" />
    </div>
  )
}
