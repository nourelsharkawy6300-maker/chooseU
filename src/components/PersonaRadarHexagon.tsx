"use client";

import React from "react";
import { motion } from "framer-motion";
import { InterestCluster } from "@/types/chooseu";
import { CLUSTERS } from "@/data/clusters";

export function PersonaRadarHexagon({
  affinities,
  size = 260,
}: {
  affinities: Record<InterestCluster, number>;
  size?: number;
}) {
  const center = size / 2;
  const radius = size * 0.38;
  const clusterKeys: InterestCluster[] = [
    "Medical_Bio",
    "Eng_Tech",
    "Media_Lang",
    "Biz_Econ",
    "Law_Edu_Social",
    "Applied_Agri_Arts",
  ];

  const getCoordinates = (idx: number, scale: number) => {
    const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
    const x = center + radius * scale * Math.cos(angle);
    const y = center + radius * scale * Math.sin(angle);
    return { x, y };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const dataPoints = clusterKeys.map((k, idx) => {
    const val = affinities[k] || 15;
    const normalized = Math.max(0.15, Math.min(1.0, val / 100));
    return getCoordinates(idx, normalized);
  });

  const polygonPath =
    dataPoints.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ") +
    " Z";

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Outer hexagonal web lines with pathLength stagger on mount */}
        {gridLevels.map((lvl, lvlIdx) => {
          const pts = clusterKeys
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(" ");
          return (
            <motion.polygon
              key={lvl}
              points={pts}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={lvl < 1.0 ? "3 3" : undefined}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: lvlIdx * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          );
        })}

        {/* Axis Lines from Center */}
        {clusterKeys.map((_, i) => {
          const outer = getCoordinates(i, 1.0);
          return (
            <motion.line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#e2e8f0"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
            />
          );
        })}

        {/* Animated Data Polygon with Spring Physics */}
        <motion.path
          d={polygonPath}
          fill="rgba(55, 126, 240, 0.18)"
          stroke="#377ef0"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, d: polygonPath }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          style={{ originX: `${center}px`, originY: `${center}px` }}
        />

        {/* Pulsing Interactive Vertex Nodes */}
        {dataPoints.map((pt, i) => {
          const clusterKey = clusterKeys[i];
          const cluster = CLUSTERS[clusterKey];
          return (
            <g key={clusterKey}>
              {/* Outer Pulse Ring */}
              <motion.circle
                cx={pt.x}
                cy={pt.y}
                r={6}
                fill="none"
                stroke={cluster.color}
                strokeWidth="1.5"
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
              {/* Core Node */}
              <motion.circle
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill="#ffffff"
                stroke={cluster.color}
                strokeWidth="2.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1, cx: pt.x, cy: pt.y }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 18,
                }}
              />
            </g>
          );
        })}
      </svg>

      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-200 text-xs">
        {clusterKeys.map((k) => {
          const cluster = CLUSTERS[k];
          const val = affinities[k] || 0;
          return (
            <div
              key={k}
              className="flex items-center justify-between p-1.5 rounded-md bg-white border border-[#e2e2e2] shadow-2xs"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cluster.color }}
                />
                <span className="truncate text-slate-700 font-medium">
                  {cluster.title.split(" ")[1] || cluster.title}
                </span>
              </div>
              <span className="font-bold text-slate-900 tabular-nums">{val}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
