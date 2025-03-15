import { useEffect, useRef, useState } from 'react';

export const useHover = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [hovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    if (element) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (element) {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [ref, ref.current]);

  return { hovered, ref };
};

export default useHover;
