import Link from "next/link";
import { LoginForm } from "@/app/ui/components";
import { Scale } from "lucide-react";

export default function LoginPage() {
    return (
        <>
            <nav className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <Scale className="text-white mr-2" size={24} />
                        <div className="text-2xl font-bold text-white">LegalEase</div>
                    </div>
                    <div>
                        <Link href="/auth/signup">
                            <button className="bg-white hover:bg-gray-100 text-blue-700 font-semibold mx-2 py-2 px-4 border border-white hover:border-transparent rounded-md transition-all" type="button">
                                Register
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-3 text-gray-800">Securely Log In</h1>
                    <span className="text-gray-600 text-lg max-w-md mx-auto block">
                        Welcome back to LegalEase. Please enter your credentials
                    </span>
                </div>

                <LoginForm />
            </div>
        </>
    );
}