import { useRef, useState, useCallback, useEffect } from "react";

export function useDragHook() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragged, setDragged] = useState(false); //  detect if the user dragged and then prevent the click

  // Common logic for starting drag operation
  const startDrag = useCallback((pageX: number) => {
    if (!containerRef.current) return false;
    setIsDragging(true);
    setStartX(pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    return true;
  }, []);

  // Common logic for performing drag operation
  const performDrag = useCallback(
    (pageX: number) => {
      if (!isDragging || !containerRef.current) return;
      const x = pageX - containerRef.current.offsetLeft;
      const walk = (x - startX) * 1; // multiplier for scroll speed
      containerRef.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft]
  );

  // Common logic for ending drag operation
  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle mouse down - start dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (startDrag(e.pageX)) {
        setDragged(false); // Reset
        e.preventDefault();
      }
    },
    [startDrag]
  );

  // Handle touch start - start dragging for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      if (startDrag(touch.pageX)) {
        setDragged(false); // Reset
        e.preventDefault();
      }
    },
    [startDrag]
  );

  // Handle mouse move - perform dragging (document-level when dragging)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      performDrag(e.pageX);
      setDragged(true); // Mark as dragged when movement occurs
    },
    [performDrag]
  );

  // Handle touch move - perform dragging for mobile
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const touch = e.touches[0];
      performDrag(touch.pageX);
      setDragged(true); // Mark as dragged when movement occurs
    },
    [performDrag]
  );

  // Handle mouse up - stop dragging (document-level when dragging)
  const handleMouseUp = useCallback(() => {
    endDrag();
    setTimeout(() => setDragged(false), 50); // Reset after short delay
  }, [endDrag]);

  // Handle touch end - stop dragging for mobile
  const handleTouchEnd = useCallback(() => {
    endDrag();
    setTimeout(() => setDragged(false), 50); // Reset after short delay
  }, [endDrag]);

  // Remove mouse leave handler - we want dragging to continue outside container
  // Only document mouseup will stop the drag

  // Attach document-level events ONLY when dragging is active
  useEffect(() => {
    if (isDragging) {
      // Mouse events work anywhere on the page, but only when drag started inside container
      document.addEventListener("mousemove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp);

      // Touch events for mobile support
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Style object for cursor changes
  const containerStyle = {
    userSelect: "none" as const, // Prevent text selection
    touchAction: "none" as const, // Prevent default scrolling on touch
  };

  return {
    containerRef,
    handleMouseDown,
    handleTouchStart,
    containerStyle,
    isDragging,
    dragged,
  };
}
