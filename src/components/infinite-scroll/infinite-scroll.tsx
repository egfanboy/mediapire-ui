import React, { useEffect, useRef, useState } from 'react';
import useHover from '../../hooks/use-hover/use-hover';
import styles from './infinite-scroll.module.css';

interface infiniteScrollProps extends React.PropsWithChildren<any> {
  onlyScrollOnHover?: boolean;
  onlyScrollForOverflow?: boolean;
}

export const InfiniteScroll = ({
  children,
  onlyScrollOnHover = false,
  onlyScrollForOverflow = false,
}: infiniteScrollProps) => {
  // ref of the container when we are not scrolling
  const staticContainerRef = useRef<HTMLDivElement | null>(null);
  const childRef = useRef<HTMLElement | null>(null);

  const { hovered, ref } = useHover<HTMLDivElement>();

  const [childOverflows, setChildOverflows] = useState(false);

  useEffect(() => {
    // only verify if we are overflowing based on the prop
    if (onlyScrollForOverflow && staticContainerRef.current && childRef.current) {
      const childWidth = childRef.current.getBoundingClientRect().width;

      const containerWidth = staticContainerRef.current.getBoundingClientRect().width;
      const doesOverflow = childWidth > containerWidth || childWidth === containerWidth;

      setChildOverflows(doesOverflow);
    }

    return () => {};
  }, [childRef, childRef.current, staticContainerRef, staticContainerRef.current, children]);

  const renderContent = () => {
    const renderStatic = () => (
      <div ref={staticContainerRef} style={{ width: '100%' }}>
        {children &&
          React.cloneElement(children, {
            className: `${children.props.className || ''} ${styles.staticEllipsis}`,
            ref: childRef,
          })}
      </div>
    );

    if (onlyScrollForOverflow && !childOverflows) {
      return renderStatic();
    }

    if (hovered || !onlyScrollOnHover) {
      return (
        <>
          <div className={styles.scrollingContainer} style={{ animationDuration: `10s` }}>
            {children}
          </div>

          <div
            aria-hidden={true}
            className={styles.scrollingContainer}
            style={{ animationDuration: `10s` }}
          >
            {children}
          </div>
        </>
      );
    }

    return renderStatic();
  };

  return (
    <div ref={ref} className={styles.container}>
      {renderContent()}
    </div>
  );
};
