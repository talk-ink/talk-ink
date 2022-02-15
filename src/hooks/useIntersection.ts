import { useEffect, useRef, useState } from "react";

const useIntersection = (
  options: IntersectionObserverInit
): [React.MutableRefObject<HTMLDivElement>, boolean] => {
  const observerRef = useRef(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const observerCallback: IntersectionObserverCallback = (e) => {
    const [entry] = e;
    setIsVisible(entry.isIntersecting);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, options);
    if (observerRef.current) observer.observe(observerRef.current);

    const ref = observerRef;

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observerRef, options]);

  return [observerRef, isVisible];
};

export default useIntersection;
