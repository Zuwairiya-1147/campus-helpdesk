import React from "react";

const STYLE_MAP = {
  Pending: "badge--pending",
  "In Progress": "badge--progress",
  Resolved: "badge--resolved",
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${STYLE_MAP[status] || ""}`}>{status}</span>;
}
