import React from "react";

// Signature element: renders the generated complaint ID as a physical-style
// ticket stub, echoing the paper counter-slip this system replaces.
export default function TicketStub({ complaint }) {
  if (!complaint) return null;

  return (
    <div className="ticket">
      <div className="ticket__main">
        <div className="ticket__eyebrow">Complaint filed</div>
        <div className="ticket__id">{complaint.complaintId}</div>
        <div className="ticket__meta">
          {complaint.category} · Filed by {complaint.studentName}
          <br />
          Keep this ID to track your complaint's status.
        </div>
      </div>
      <div className="ticket__stub">Save this ID</div>
    </div>
  );
}
