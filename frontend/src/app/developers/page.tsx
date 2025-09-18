import { ChromaGrid } from '@/app/ui/components';
import { MainNav } from '@/app/ui/components';
const items = [
    {
        image: '/images/subham.jpeg',
        title: 'Subham Majumder',
        subtitle: 'Developer',
        handle: '',
        borderColor: '#3B82F6',
        gradient: 'linear-gradient(145deg, #3B82F6, #000)',
        url: 'https://www.linkedin.com/in/subham-majumder-7ab09b251/',
    },
    {
        image: '/images/arunav.jpeg',
        title: 'Arunav Borthakur',
        subtitle: 'Developer',
        handle: '',
        borderColor: '#10B981',
        gradient: 'linear-gradient(180deg, #10B981, #000)',
        url: 'https://www.linkedin.com/in/arunav-borthakur-439017258/',
    },
    {
        image: '/images/pragati.jpeg',
        title: 'Pragati Kalwar',
        subtitle: 'Designer',
        handle: '',
        borderColor: '#10B981',
        gradient: 'linear-gradient(180deg, #10B981, #000)',
        url: 'https://www.linkedin.com/in/pragati-kalwar-786b09257/',
    },
    {
        image: '/images/suraj.jpeg',
        title: 'Suraj Gupta',
        subtitle: 'RAG Expert',
        handle: '',
        borderColor: '#e95d17ff',
        gradient: 'linear-gradient(145deg, #3B82F6, #000)',
        url: 'https://www.linkedin.com/in/suraj-gupta-427321250/',
    },
    {
        image: '/images/nilesh.jpeg',
        title: 'Nilesh Baheti',
        subtitle: 'Developer',
        handle: '',
        borderColor: '#b910a5ff',
        gradient: 'linear-gradient(180deg, #b910b9ff, #000)',
        url: 'https://www.linkedin.com/in/nilesh-baheti-640b87257/',
    },
];

const DevelopersPage = () => {
    return (
        <div className="bg-white">
            <MainNav />  {/* Include the navbar here */}
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
