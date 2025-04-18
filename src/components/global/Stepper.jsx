import React, { useRef, useEffect, useState, useCallback } from "react";
import { FaCheck } from "react-icons/fa";

const StepperIcon = ({ isCompleted, isActive, stepNumber }) => {
  if (isCompleted) {
    return (
      <div className="p-1 rounded-full ring-2 ring-orange-600">
        <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center">
          <FaCheck size={12} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors duration-300 ease-in-out ${
        isActive ? "bg-orange-600 text-white" : "bg-gray-300 text-gray-500"
      }`}
    >
      {stepNumber}
    </div>
  );
};

const StepItem = React.forwardRef(({ step, index, currentStep }, ref) => {
  const stepNumber = index + 1;
  const isCompleted = currentStep > stepNumber;
  const isActive = currentStep === stepNumber;

  const labelClasses = `text-xs lg:text-sm font-medium mt-1 md:mt-1 transition-colors duration-300 ease-in-out ${
    isCompleted || isActive ? "text-gray-700" : "text-gray-500"
  }`;

  return (
    <div
      ref={ref}
      key={step.id || index}
      className="relative z-10 flex flex-col items-center md:items-start mb-2 lg:mb-0"
    >
      <div className="bg-white flex flex-col items-center text-center md:flex-row md:items-start md:text-left py-1 w-full">
        <div className="mb-1 md:mb-0 md:mr-3 flex-shrink-0">
          <StepperIcon
            isCompleted={isCompleted}
            isActive={isActive}
            stepNumber={stepNumber}
          />
        </div>
        <span className={labelClasses}>{step.label}</span>
      </div>
    </div>
  );
});

const StepperConnectors = ({ iconPositions, currentStep, steps }) => {
  if (iconPositions.length !== steps.length || steps.length <= 1) {
    return null;
  }

  const connectorHorizontalPadding = 20;

  return steps.slice(0, -1).map((_, index) => {
    const stepNumber = index + 1;
    const isSegmentCompleted = currentStep > stepNumber;
    const pos1 = iconPositions[index];
    const pos2 = iconPositions[index + 1];

    if (!pos1 || !pos2) {
      return null;
    }

    const connectorColorClass = isSegmentCompleted
      ? "border-orange-600 z-10 lg:z-0"
      : "border-gray-300 z-10 lg:z-0";
    const commonConnectorClasses = `absolute border-dashed z-0 transition-colors duration-300 ease-in-out ${connectorColorClass}`;

    const verticalHeight = Math.max(0, pos2.y - pos1.y);
    const verticalConnector = verticalHeight > 0 && (
      <div
        key={`v-connector-${index}`}
        className={`${commonConnectorClasses} border-l-2 hidden lg:block`}
        style={{
          left: `${pos1.x - 1}px`,
          top: `${pos1.y}px`,
          height: `${verticalHeight}px`,
        }}
        aria-hidden="true"
      />
    );

    const horizontalWidth = pos2.x - pos1.x;
    const horizontalConnector = horizontalWidth >
      2 * connectorHorizontalPadding && (
      <div
        key={`h-connector-${index}`}
        className={`${commonConnectorClasses} border-t-2 block lg:hidden`}
        style={{
          top: `${pos1.y - 1}px`,
          left: `${pos1.x + connectorHorizontalPadding}px`,
          width: `${horizontalWidth - 2 * connectorHorizontalPadding}px`,
        }}
        aria-hidden="true"
      />
    );

    return (
      <React.Fragment key={`connector-group-${index}`}>
        {verticalConnector}
        {horizontalConnector}
      </React.Fragment>
    );
  });
};

const useIconPositions = (steps, containerRef, stepRefs) => {
  const [iconPositions, setIconPositions] = useState([]);

  const calculatePositions = useCallback(() => {
    if (!containerRef.current || stepRefs.current.length === 0) {
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const positions = stepRefs.current.map((ref) => {
      const node = ref.current;
      if (!node) return null;

      const iconWrapper = node.querySelector(".flex-shrink-0 > div");
      if (!iconWrapper) return null;

      const iconRect = iconWrapper.getBoundingClientRect();
      if (iconRect.width === 0 && iconRect.height === 0) return null;

      const x = iconRect.left - containerRect.left + iconRect.width / 2;
      const y = iconRect.top - containerRect.top + iconRect.height / 2;
      return { x, y };
    });

    const allPositionsValid = positions.every(
      (pos) => pos && typeof pos.x === "number" && typeof pos.y === "number"
    );

    if (allPositionsValid) {
      setIconPositions((prevPositions) =>
        JSON.stringify(prevPositions) !== JSON.stringify(positions)
          ? positions
          : prevPositions
      );
    }
  }, [containerRef, stepRefs]);

  useEffect(() => {
    let rafId;
    const runCalculation = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(calculatePositions);
    };

    runCalculation();

    const resizeObserver = new ResizeObserver(runCalculation);
    const currentContainer = containerRef.current;
    if (currentContainer) {
      resizeObserver.observe(currentContainer);
    }
    window.addEventListener("resize", runCalculation);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", runCalculation);
      if (currentContainer) {
        resizeObserver.unobserve(currentContainer);
      }
    };
  }, [calculatePositions, steps]);

  return iconPositions;
};

const Stepper = ({ currentStep, steps = [] }) => {
  const containerRef = useRef(null);
  const stepRefs = useRef([]);

  stepRefs.current = steps.map(
    (_, i) => stepRefs.current[i] ?? React.createRef()
  );

  const iconPositions = useIconPositions(steps, containerRef, stepRefs);

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative flex lg:flex-col justify-between h-full"
    >
      {steps.map((step, index) => (
        <StepItem
          ref={stepRefs.current[index]}
          key={step.id || index}
          step={step}
          index={index}
          currentStep={currentStep}
        />
      ))}
      <StepperConnectors
        iconPositions={iconPositions}
        currentStep={currentStep}
        steps={steps}
      />
    </div>
  );
};

export default Stepper;
