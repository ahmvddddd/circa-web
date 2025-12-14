import Link from 'next/Link';

export default function Page() {
    return (
    <div>
        <p className ="text-sm text-center text-gray-600">
            Login Page{' '}
            <Link href="/signup">
            Sign Up
            </Link>
            </p>
        </div>
    );
}
