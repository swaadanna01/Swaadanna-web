import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center px-4">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url("/not-found-bg.png")',
                    filter: 'brightness(0.9)'
                }}
            />

            {/* Content Overlay */}
            <div className="relative z-10 max-w-2xl bg-white/10 backdrop-blur-sm p-12 rounded-2xl border border-white/20 shadow-2xl">
                <h1 className="font-sans font-bold text-white text-6xl md:text-8xl mb-4 tracking-tighter opacity-90">
                    404
                </h1>
                <p className="font-sans font-bold text-white text-xl md:text-2xl mb-8 uppercase tracking-widest">
                    Not Found
                </p>

                <div className="space-y-4 mb-10">
                    <h2 className="font-serif italic text-white text-2xl md:text-4xl leading-tight">
                        LOOKS LIKE YOU'VE TAKEN A WRONG TURN.
                    </h2>
                    <p className="font-sans text-white/80 text-lg md:text-xl font-light">
                        But while you're here, take a few deep breaths and enjoy the view.
                    </p>
                </div>

                <Link to="/">
                    <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                        Back to Swaadanna
                    </Button>
                </Link>
            </div>

            {/* Subtle branding footer in 404 */}
            <div className="absolute bottom-8 z-10 text-white/50 text-sm font-light tracking-widest uppercase">
                Swaadanna Himalayas
            </div>
        </div>
    );
};

export default NotFoundPage;
