import { memo, useLayoutEffect, useMemo } from 'react';

export interface PDFViewerProps {
    src: string;
    onLoad?: (event: HTMLElementEventMap['load']) => void;
    onError?: (event: HTMLElementEventMap['error']) => void;
}

export const PDFViewer = memo(
    ({ src, onLoad, onError }: PDFViewerProps) => {
        const href = !src || src === '#' ? null : src;

        const link = useMemo(() => {
            if (href == null) return null;

            const link = document.createElement('link');
            link.as = 'fetch';
            link.rel = 'preload';
            link.href = href;

            link.addEventListener('load', () => link.remove());
            link.addEventListener('error', () => link.remove());

            return link;
        }, [href]);

        // The useLayoutEffect is used to ensure that the event listeners are added before the object is loaded
        // The useLayoutEffect declaration order is important here
        useLayoutEffect(() => {
            if (!link) return;

            if (onLoad) link.addEventListener('load', onLoad);
            if (onError) link.addEventListener('error', onError);

            return () => {
                if (onLoad) link.removeEventListener('load', onLoad);
                if (onError) link.removeEventListener('error', onError);
            };
        }, [link, onLoad, onError]);

        useLayoutEffect(() => {
            if (!link) return;
            document.head.appendChild(link);
            return () => link.remove();
        }, [link]);

        // Use link to normalize URL
        return link ? (
            <embed src={link.href} type="application/pdf" style={{ width: "100%", height: "100%" }} />
        ) : null;
    }
);