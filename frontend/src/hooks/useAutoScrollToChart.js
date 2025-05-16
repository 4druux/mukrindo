"use client";
import { useEffect, useRef, useCallback } from "react";

const easeOutQuint = (t) => {
  return 1 - Math.pow(1 - t, 5);
};

export const useAutoScrollToChart = (data, selectedTab, currentYear) => {
  const chartContainerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const timeoutRef = useRef(null);

  const smoothScrollTo = useCallback((container, targetPos, duration = 800) => {
    if (!container) return;

    const startPos = container.scrollLeft;
    const distance = targetPos - startPos;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easeOutQuint(progress);

      container.scrollLeft = startPos + distance * easedProgress;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateScroll);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(animateScroll);
  }, []);

  const scrollToPeak = useCallback(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    if (container.scrollWidth <= container.clientWidth) return;

    const findMaxIndex = (arr) => {
      let maxIndex = 0;
      let maxValue = arr[0] || 0;

      arr.forEach((value, index) => {
        if (value > maxValue) {
          maxValue = value;
          maxIndex = index;
        }
      });

      return maxIndex;
    };

    let dataToUse = [];
    if (data.sales && data.revenue) {
      dataToUse = data.revenue;
    } else if (data.visits) {
      dataToUse = data.visits;
    } else if (data.masuk && data.terjual) {
      dataToUse = data.terjual;
    }

    if (dataToUse.length === 0) return;

    const maxIndex = findMaxIndex(dataToUse);
    const itemWidth = container.scrollWidth / dataToUse.length;
    let targetPos =
      maxIndex * itemWidth - container.clientWidth / 2 + itemWidth / 2;

    targetPos = Math.max(
      0,
      Math.min(targetPos, container.scrollWidth - container.clientWidth)
    );

    if (Math.abs(container.scrollLeft - targetPos) > 10) {
      smoothScrollTo(container, targetPos);
    }
  }, [data, smoothScrollTo]);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    resizeObserverRef.current = new ResizeObserver(() => {
      timeoutRef.current = setTimeout(() => {
        scrollToPeak();
      }, 300);
    });

    resizeObserverRef.current.observe(container);

    scrollToPeak();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scrollToPeak, selectedTab, currentYear]);

  return chartContainerRef;
};
