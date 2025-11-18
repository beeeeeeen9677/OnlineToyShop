import { useRef, useState, useCallback, useEffect } from "react";

export function useDragHook() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Handle mouse down - start dragging
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    // Prevent text selection while dragging
    e.preventDefault();
  }, []);

  // Handle mouse move - perform dragging (document-level when dragging)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      e.preventDefault();
      const x = e.pageX - containerRef.current.offsetLeft;
      const walk = (x - startX) * 1; // multiplier for scroll speed
      containerRef.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft]
  );

  // Handle mouse up - stop dragging (document-level when dragging)
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Remove mouse leave handler - we want dragging to continue outside container
  // Only document mouseup will stop the drag

  // Attach document-level events ONLY when dragging is active
  useEffect(() => {
    if (isDragging) {
      // These work anywhere on the page, but only when drag started inside container
      document.addEventListener("mousemove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Style object for cursor changes
  const containerStyle = {
    userSelect: "none" as const, // Prevent text selection
  };

  return {
    containerRef,
    handleMouseDown,
    containerStyle,
    isDragging,
  };
}
