import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
        <LoginForm />
      </div>
    </div>
  );
}
