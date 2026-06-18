import axios from 'axios';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { instance } from '@/components/fetch';

const usePageTracking = () => {
    const pathname = usePathname();

    useEffect(() => {
        const trackPageView = async () => {
            try {
                await instance.post('/track-pageview/', {
                    url: pathname,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error tracking page view:', error);
            }
        };

        trackPageView();
    }, [pathname]);
};

export default usePageTracking;
