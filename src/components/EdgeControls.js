"use client"

const EdgeControls = ({ edge, onReverseDirection, onDeleteEdge, position }) => {
  return (
    <div
      className="edge-controls"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
      }}
    >
      <div className="edge-controls-panel">
        <button
          className="edge-control-btn reverse-btn"
          onClick={() => onReverseDirection(edge)}
          title="Reverse Direction"
        >
          ↔️
        </button>
        <button className="edge-control-btn delete-btn" onClick={() => onDeleteEdge(edge)} title="Delete Connection">
          🗑️
        </button>
      </div>
    </div>
  )
}

export default EdgeControls
