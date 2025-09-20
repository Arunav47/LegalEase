import React, { useState } from "react";

interface ResponsiveSearchBarProps {
    onSearch?: (query: string) => void;
    placeholder?: string;
}

const ResponsiveSearchBar: React.FC<ResponsiveSearchBarProps> = ({
    onSearch,
    placeholder = "Search legal documents, contracts, or ask a question..."
}) => {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        if (onSearch) {
            onSearch(query);
        }
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit(e as any);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label
                className="mx-auto relative bg-white min-w-sm w-full max-w-5xl flex flex-col md:flex-row items-center justify-center border py-2 px-2 rounded-2xl gap-2 shadow-2xl focus-within:border-gray-300"
                htmlFor="search-bar"
            >
                <input
                    id="search-bar"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="px-6 py-2 w-full rounded-md flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-500 font-medium"
                />
                <button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    className="w-full md:w-auto px-6 py-3 bg-black hover:bg-gray-900 border-black hover:border-gray-900 text-white active:scale-95 duration-200 border will-change-transform overflow-hidden relative rounded-xl transition-all disabled:opacity-70 hover:shadow-lg"
                >
                    <div className="relative z-10">
                        <div className={`flex items-center justify-center h-3 w-3 absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 transition-all ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
                            <svg
                                className="animate-spin w-full h-full"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        </div>

                        <div className={`flex items-center transition-all ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                            <span className="text-sm font-semibold whitespace-nowrap truncate mx-auto text-white">
                                Search
                            </span>
                        </div>
                    </div>
                </button>
            </label>
        </form>
    );
};

export default ResponsiveSearchBar;