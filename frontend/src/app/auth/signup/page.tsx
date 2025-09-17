import { SignUpForm } from "@/app/ui/components";

export default function SignUpPage() {
    return (
        <>
            <nav className="p-4 bg-white shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="text-2xl font-bold text-blue-600">LegalEase</div>
                    <div>
                        <button className="bg-gray-600 hover:bg-blue-600 text-white mx-2 p-2 rounded-md">Sign up</button>
                    </div>
                </div>
            </nav>
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                <h1 className="text-2xl font-bold mb-6">Securely Log In</h1>
                <span className="text-gray-600 mb-8 text-center">
                    Welcome back to LegalEase. Please enter your credentials
                </span>

                <SignUpForm />
            </div>
        </>
    );
}