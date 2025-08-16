"use client"

const NodePanel = () => {
  const nodeTypes = [
    {
      type: "messageNode",
      label: "Message",
      icon: "💬",
      description: "Send a text message to users",
    },
  ]

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="node-panel">
      <div className="panel-header">
        <h3>Node Types</h3>
        <p>Drag nodes to the canvas</p>
      </div>

      <div className="node-list">
        {nodeTypes.map((nodeType) => (
          <div
            key={nodeType.type}
            className="draggable-node"
            draggable
            onDragStart={(event) => onDragStart(event, nodeType.type)}
          >
            <div className="node-preview">
              <span className="node-icon">{nodeType.icon}</span>
              <div className="node-info">
                <span className="node-label">{nodeType.label}</span>
                <span className="node-description">{nodeType.description}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel-footer">
        <p className="help-text">More node types coming soon! Designed by Sujal Soni for BiteSpeed.</p>
      </div>
    </div>
  )
}

export default NodePanel
