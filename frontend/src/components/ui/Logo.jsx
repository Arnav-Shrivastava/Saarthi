import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Unified Saarthi Logo component.
 * 
 * @param {string} className - Additional classes for the container div.
 * @param {number} size - Pixel size for the SVG logo (default: 20).
 * @param {string} containerSize - Tailwind classes for container (default: 'h-8 w-8').
 * @param {string} containerColor - Tailwind classes for background color (default: 'bg-primary').
 * @param {string} strokeColor - Color for SVG paths (default: 'white').
 * @param {boolean} showContainer - Whether to wrap the SVG in a styled container (default: true).
 */
export const Logo = ({
    className,
    shadowClassName,
    size = 20,
    containerSize = 'h-8 w-8',
    containerColor = 'bg-primary',
    strokeColor = 'white',
    showContainer = true
}) => {
    const SvgContent = (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
                d="M12 2L3 7v10l9 5 9-5V7L12 2z"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinejoin="round"
                fill={strokeColor === 'white' ? 'rgba(255,255,255,0.15)' : 'rgba(27, 20, 100, 0.1)'}
            />
            <path
                d="M12 7v10M7 9.5l5 2.5 5-2.5"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    if (!showContainer) {
        return SvgContent;
    }

    return (
        <div className={cn(
            "flex items-center justify-center rounded-lg shadow-sm",
            containerSize,
            containerColor,
            shadowClassName,
            className
        )}>
            {SvgContent}
        </div>
    );
};

export default Logo;
