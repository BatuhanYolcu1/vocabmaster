'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

export default function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [displayChildren, setDisplayChildren] = useState(children);

    useEffect(() => {
        // On route change, briefly fade out and fade in
        setIsVisible(false);
        const timeout = setTimeout(() => {
            setDisplayChildren(children);
            setIsVisible(true);
        }, 150);
        return () => clearTimeout(timeout);
    }, [pathname, children]);

    return (
        <div
            className="transition-all duration-300 ease-out"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
            }}
        >
            {displayChildren}
        </div>
    );
}
