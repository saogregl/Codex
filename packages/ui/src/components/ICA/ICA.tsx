
import classnames from 'classnames';
import { Tooltip } from "@carbon/react";
import { ArrowUp, Information } from "@carbon/icons-react"
import { settings } from '../../constants/settings';
import { useMemo } from 'react';
import numeral from 'numeral';
import 'numeral/locales';
import CircularProgress from '../ProgressIndicator';

interface ICAProps {
    /**
     * Optional class name.
     * @type number
     */
    className?: string
    /**
     * Display the `total` even when the `value` is equal to
     * the `total` when `forceShowTotal` prop is true on the
     * condition that the `total` is greater than 0.
     * @type bool
     */
    forceShowTotal?: boolean
    /** Displays an iconButton next to the ICA value */
    iconButton?: React.ReactNode
    /** Pass in content to the body of the information tooltip. */
    information?: React.ReactNode
    /**
     * Text label for ICA.
     * @type string
     */
    label: string
    /**
     * Locale value to determine approach to formatting numbers.
     * @type string
     */
    locale?: unknown[]
    /**
     * Format number to percentage when `percentage` prop is true.
     * @type bool
     */
    percentage?: boolean
    /** The size of the ICA. */
    size?: "default" | "lg" | "xl"
    /**
     * Total value that the main ICA value is a subset of.
     * @type number
     */
    total?: number
    /** Display trending icon. */
    trending?: boolean
    /** Specify whether or not the values should be truncated. */
    truncate?: boolean
    /**
     * The main ICA value to display
     * @type number
     */
    value?: number
}



const ICA = ({
    className,
    forceShowTotal,
    label,
    locale,
    percentage,
    information,
    iconButton,
    size,
    trending,
    truncate,
    total,
    value,
    ...other
}: ICAProps) => {
    const isSize = (sizeValue) => size === sizeValue;
    const isLarge = isSize('lg');
    const isXLarge = isSize('xl');

    let renderIcon = <ArrowUp size={16} />;
    if (isLarge) {
        renderIcon = <ArrowUp size={20} />;
    } else if (isXLarge) {
        renderIcon = <ArrowUp size={24} />;
    }

    let renderProgressIndicator = <CircularProgress size={16} percentage={value} color="#007bff" />;
    if (isLarge) {
        renderProgressIndicator = <CircularProgress size={20} percentage={value} color="#007bff" />;
    } else if (isXLarge) {
        renderProgressIndicator = <CircularProgress size={24} percentage={value} color="#007bff" />;
    }


    const ICAClasses = classnames(className, {
        [`${settings.sipePrefix}_ICA--lg`]: isLarge,
        [`${settings.sipePrefix}_ICA--xl`]: isXLarge,
    },
        `${settings.sipePrefix}_ICA`);

    const shouldDisplayOf = () => {
        return !!total;
    };
    const getFormat = (value) => (Math.round(value) > 999 ? '0.0a' : '0a');

    const formatValue = (value, truncate) => {
        const localeValue = numeral(value);

        return truncate ? localeValue.format(getFormat(value)) : localeValue.value();
    };


    const truncateValue = (percentage, value, truncate) => {
        if (percentage) {
            return (
                <div className={`${settings.sipePrefix}_ICA__percentage`}>
                    {value}
                    <span className={`${settings.sipePrefix}_ICA__percentage-mark`}>%</span>
                </div>
            );
        }

        return value === null ? '–' : formatValue(value, truncate);
    };


    const truncatedValue = useMemo(() => truncateValue(percentage, value, truncate), [value, truncate, percentage]);
    const truncatedTotal = useMemo(() => formatValue(total, truncate), [total, truncate]);

    return (
        <div className={`${ICAClasses}`} {...other}>
            <span className={`${settings.sipePrefix}_ICA__row`}>
                <h4 className={`${settings.sipePrefix}_ICA__label`}>{label} </h4>
                {information && (
                    <Tooltip showIcon={true} className={`${settings.sipePrefix}_ICA__tooltip`} align="top" label={information}>
                        <button style={{backgroundColor: "transparent", border: "none"}}>
                            <Information />
                        </button>
                    </Tooltip>
                )}
            </span>
            <span className={`${settings.sipePrefix}_ICA__row`}>
                {trending && (
                    renderIcon
                )}
                {
                    percentage && (
                        <CircularProgress percentage={value} size={24} color="#007bff" />
                    )
                }
                <span className={`${settings.sipePrefix}_ICA__value`}>{truncatedValue}</span>
                {shouldDisplayOf() ? (
                    <span className={`${settings.sipePrefix}_ICA__total`}>
                        {' '}
                        <span>/{truncatedTotal}</span>
                    </span>
                ) : null}
                {iconButton}
            </span>
        </div>
    );
};


export default ICA;