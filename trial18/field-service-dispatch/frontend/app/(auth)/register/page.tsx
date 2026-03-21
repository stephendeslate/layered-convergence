import { RegisterForm } from './register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-gray-600">Register your company and create an account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
