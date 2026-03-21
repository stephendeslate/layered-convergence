import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-gray-600">Enter your credentials to access the dispatch system</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
