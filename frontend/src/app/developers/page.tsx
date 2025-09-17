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
        image: '/images/pragati.jpeg',
        title: 'Pragati Kalwar',
        subtitle: 'Designer',
        handle: '',
        borderColor: '#10B981',
        gradient: 'linear-gradient(180deg, #10B981, #000)',
        url: 'https://www.linkedin.com/in/pragati-kalwar-786b09257/',
    },
];

const DevelopersPage = () => {
    return (
        <div className="bg-white">
            <MainNav />  {/* Include the navbar here */}
            <div style={{ height: '600px', position: 'relative' }}>
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