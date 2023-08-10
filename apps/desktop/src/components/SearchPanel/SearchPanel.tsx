import { motion } from 'framer-motion';

import React from 'react'
import classnames from "classnames";
import { settings } from '../../constants/settings';
// @ts-ignore
import { Button, Layer } from '@carbon/react';

interface FilterPanelProps {
    children: React.ReactNode[]
    className?: string
    filterPanelMinHeight?: number
    filterSections?: unknown[]
    open?: boolean
    primaryActionLabel?: string
}

const SearchPanel = ({ children, className }: FilterPanelProps) => {
    return (

        <div className={classnames(
            `${settings.sipePrefix}--search-panel-wrapper`,
            `${className ? className : ""}`
        )}

        >
            <div className={`${settings.sipePrefix}--search-panel-content`}>

                <div className={`${settings.sipePrefix}--search-panel-header`}>
                    <p className={`${settings.sipePrefix}--search-panel-header-text`}>
                        Painel de busca
                    </p>
                </div>
                {children.map((child) => {
                    return <div>{child}</div>
                })}
            </div>

            <div className={`${settings.sipePrefix}--search-panel-separator`} />

        </div>
    )
}

export default SearchPanel