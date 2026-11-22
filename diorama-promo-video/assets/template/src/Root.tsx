import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import { buildTimeline } from "./timeline";
import type { VideoSpec } from "./types";
import spec from "./video.json";

const defaultProps = spec as unknown as VideoSpec;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Promo"
      component={Promo}
      width={1080}
      height={1920}
      fps={defaultProps.fps ?? 30}
      durationInFrames={buildTimeline(defaultProps).totalFrames}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => ({
        durationInFrames: buildTimeline(props).totalFrames,
        fps: props.fps ?? 30,
      })}
    />
  );
};
