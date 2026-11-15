"use client";

import React from "react";
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
        {gridLevels.map((lvl) => {
          const pts = clusterKeys
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(" ");
          return (
            <polygon
              key={lvl}
              points={pts}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray={lvl < 1.0 ? "2 2" : undefined}
            />
          );
        })}
        {clusterKeys.map((_, i) => {
          const outer = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#475569"
              strokeWidth="1"
            />
          );
        })}
        <path
          d={polygonPath}
          fill="rgba(37, 99, 235, 0.2)"
          stroke="#3B82F6"
          strokeWidth="1.5"
        />
        {dataPoints.map((pt, i) => {
          const clusterKey = clusterKeys[i];
          const cluster = CLUSTERS[clusterKey];
          return (
            <circle
              key={clusterKey}
              cx={pt.x}
              cy={pt.y}
              r={3.5}
              fill="#0F172A"
              stroke={cluster.color}
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-800 text-[11px]">
        {clusterKeys.map((k) => {
          const cluster = CLUSTERS[k];
          const val = affinities[k] || 0;
          return (
            <div
              key={k}
              className="flex items-center justify-between p-1.5 rounded-md bg-slate-900 border border-slate-800"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cluster.color }}
                />
                <span className="truncate text-slate-300 font-medium">
                  {cluster.title.split(" ")[1] || cluster.title}
                </span>
              </div>
              <span className="font-bold text-white tabular-nums">{val}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
