import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div>
      
      <p className="text-sm text-center text-gray-600">
        Already have an account?{' '}
        <Link href="/login">
          Sign In
        </Link>
      </p>
    </div>
  );
}