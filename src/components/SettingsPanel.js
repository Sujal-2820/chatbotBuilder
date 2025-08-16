"use client"

import { useState, useEffect } from "react"

const SettingsPanel = ({ node, nodes, edges, onNodeUpdate, onNodeDelete, onClose }) => {
  const [message, setMessage] = useState("")
  const [showFlowPath, setShowFlowPath] = useState(false)

  useEffect(() => {
    setMessage(node.data.message || "")
  }, [node])

  const handleSave = () => {
    onNodeUpdate(node.id, { message })
  }

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSave()
    }
  }

  const getFlowPath = () => {
    const visited = new Set()
    const path = []

    // Find the root node (no incoming edges)
    const targetNodes = edges.map((edge) => edge.target)
    const rootNode = nodes.find((n) => !targetNodes.includes(n.id))

    if (!rootNode) return []

    // Traverse from root to find path to current node
    const findPath = (currentNodeId, currentPath) => {
      if (visited.has(currentNodeId)) return false
      visited.add(currentNodeId)

      const newPath = [...currentPath, currentNodeId]

      if (currentNodeId === node.id) {
        path.push(...newPath)
        return true
      }

      const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId)
      for (const edge of outgoingEdges) {
        if (findPath(edge.target, newPath)) {
          return true
        }
      }

      return false
    }

    findPath(rootNode.id, [])
    return path
  }

  const getNodeDetails = (nodeId) => {
    const nodeData = nodes.find((n) => n.id === nodeId)
    return nodeData
      ? {
          id: nodeId,
          message: nodeData.data.message || "No message set",
          isCurrent: nodeId === node.id,
        }
      : null
  }

  const flowPath = getFlowPath()

  const handleDeleteNode = () => {
    if (window.confirm("Are you sure you want to delete this node? This will also remove all its connections.")) {
      onNodeDelete(node.id)
      onClose()
    }
  }

  return (
    <div className="settings-panel">
      <div className="panel-header">
        <h3>Node Settings</h3>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="settings-content">
        <div className="node-info">
          <div className="node-type">
            <span className="node-icon">💬</span>
            <span>Message Node</span>
          </div>
          <div className="node-id">ID: {node.id}</div>
        </div>

        <div className="form-group">
          <label htmlFor="message-input">Message Content</label>
          <textarea
            id="message-input"
            className="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your message here..."
            rows={4}
          />
        </div>

        <div className="flow-path-section">
          <button className="flow-path-toggle" onClick={() => setShowFlowPath(!showFlowPath)}>
            {showFlowPath ? "Hide" : "Show"} Flow Path
          </button>

          {showFlowPath && (
            <div className="flow-path-container">
              <h4>Complete Flow Path</h4>
              {flowPath.length > 0 ? (
                <div className="flow-path-list">
                  {flowPath.map((nodeId, index) => {
                    const nodeDetails = getNodeDetails(nodeId)
                    return (
                      <div key={nodeId} className={`flow-path-item ${nodeDetails?.isCurrent ? "current-node" : ""}`}>
                        <div className="path-step">Step {index + 1}</div>
                        <div className="path-node-id">{nodeId}</div>
                        <div className="path-message">"{nodeDetails?.message}"</div>
                        {index < flowPath.length - 1 && <div className="path-arrow">↓</div>}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="no-path">No flow path found. This node may not be connected to the main flow.</p>
              )}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button className="save-button" onClick={handleSave}>
            Update Message
          </button>
          <button className="delete-node-button" onClick={handleDeleteNode}>
            Delete Node
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>

      <div className="panel-footer">
        <p className="help-text">Press Enter to save, or Shift+Enter for new line</p>
        <p className="help-text">Click on edges to detach connections</p>
      </div>
    </div>
  )
}

export default SettingsPanel
