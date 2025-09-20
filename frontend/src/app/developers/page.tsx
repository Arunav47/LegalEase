import { ChromaGrid } from '@/app/ui/components';
const items = [
    {
        image: '/images/subham.jpeg',
        title: 'Subham Majumder',
        subtitle: 'Full Stack Developer & AI Engineer',
        handle: '',
        borderColor: '#3B82F6',
        gradient: 'linear-gradient(145deg, #3B82F6, #000)',
        url: 'https://www.linkedin.com/in/subham-majumder-7ab09b251/',
    },
    {
        image: '/images/arunav.jpeg',
        title: 'Arunav Borthakur',
        subtitle: 'Backend Developer & ML Engineer',
        handle: '',
        borderColor: '#10B981',
        gradient: 'linear-gradient(180deg, #10B981, #000)',
        url: 'https://www.linkedin.com/in/arunav-borthakur-439017258/',
    },
    {
        image: '/images/pragati.jpeg',
        title: 'Pragati Kalwar',
        subtitle: 'UI/UX Designer & Frontend Developer',
        handle: '',
        borderColor: '#10B981',
        gradient: 'linear-gradient(180deg, #10B981, #000)',
        url: 'https://www.linkedin.com/in/pragati-kalwar-786b09257/',
    },
    {
        image: '/images/suraj.jpeg',
        title: 'Suraj Gupta',
        subtitle: 'RAG Specialist & NLP Engineer',
        handle: '',
        borderColor: '#e95d17ff',
        gradient: 'linear-gradient(145deg, #3B82F6, #000)',
        url: 'https://www.linkedin.com/in/suraj-gupta-427321250/',
    },
    {
        image: '/images/nilesh.jpeg',
        title: 'Nilesh Baheti',
        subtitle: 'DevOps Engineer & Cloud Architect',
        handle: '',
        borderColor: '#b910a5ff',
        gradient: 'linear-gradient(180deg, #b910b9ff, #000)',
        url: 'https://www.linkedin.com/in/nilesh-baheti-640b87257/',
    },
];

const DevelopersPage = () => {
    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Meet the AI Innovation Team
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        The brilliant minds behind LegalEase AI - transforming complex legal documents into accessible insights through cutting-edge artificial intelligence and user-centered design.
                    </p>
                </div>
            </div>
            <div style={{ minHeight: '800px', position: 'relative' }}>
                <ChromaGrid
                    items={items}
                    radius={300}
                    damping={0.45}
                    fadeOut={0.6}
                    ease="power3.out"
                />
            </div>
        </div>
    );
};

export default DevelopersPage;
