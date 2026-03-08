import { useEffect, useState } from "react";
import { GrainGradient } from "@paper-design/shaders-react";

interface GrainyShaderProps {
  children?: React.ReactNode;
  className?: string;
}

export default function GrainyShader({
  children,
  className,
}: GrainyShaderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {ready && (
        <GrainGradient
          colors={["#9F8EEC", "#6696EA", "#3F7CFF"]}
          colorBack="#00000000"
          speed={0.17}
          scale={0.57}
          rotation={-143}
          offsetX={0.2}
          offsetY={-0.27}
          softness={0.67}
          intensity={0.16}
          noise={0.21}
          shape="wave"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        />
      )}
      {/* Content sits above the shader */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
