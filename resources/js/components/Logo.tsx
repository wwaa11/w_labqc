import { usePage } from '@inertiajs/react';
import React from 'react';

export default function Logo({ className = '' }: { className?: string }) {

    return (
        <img src={"images/Logo.png"} alt="Logo" className={className} />
    );
} 