import { useCallback, useEffect, useRef } from "react";
import { appWindow } from "@tauri-apps/api/window";

const useCustomHeader = () => {
    const minimize = useCallback(() => {
        appWindow.minimize();
    }, []);

    const maximize = useCallback(() => {
        appWindow.toggleMaximize();
    }, []);

    const maximizeByDoubleClick = useCallback((e) => {
        e.preventDefault();
        if (e.target.closest(noDragSelector)) return;
        maximize();
    }, []);

    const close = useCallback(() => {
        appWindow.close();
    }, []);

    const startDragging = useCallback((e) => {
        if (e.detail > 1) return;
        if (e.target.closest(noDragSelector)) return;
        appWindow.startDragging();
    }, []);

    const noDragSelector =
        "input, a, button, input *, a *, button *, #notification-button, .notification-button"; // CSS selector

    const minimizeRef = useRef<HTMLDivElement | null>(null)
    const maximizeRef = useRef<HTMLDivElement | null>(null)
    const CloseRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        // Create Dragging Functionality

        const header = document.getElementsByClassName("cds--header__global")[0];

        header.addEventListener("mousedown", startDragging);
        header.addEventListener("dblclick", maximizeByDoubleClick);

        const minimizeCurrent = minimizeRef.current
        const maximizeCurrent = maximizeRef.current
        const closeCurrent = CloseRef.current

        minimizeCurrent
            .addEventListener("click", minimize);
        maximizeCurrent
            .addEventListener("click", maximize);
        closeCurrent.addEventListener("click", close);

        return () => {
            // This function gets called when the "effect wears off"
            // which means we need to unregister the listener
            minimizeCurrent
                .removeEventListener("click", minimize);
            maximizeCurrent
                .removeEventListener("click", maximize);
            closeCurrent
                .removeEventListener("click", close);
            header.removeEventListener("mousedown", startDragging);
            header.removeEventListener("dblclick", maximizeByDoubleClick);
        };
    }, [maximizeByDoubleClick, startDragging]);

    return {
        minimizeRef,
        maximizeRef,
        CloseRef
    }
}

export default useCustomHeader;