"use client"

import React, { useCallback, useState } from "react"
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  MarkerType,
} from "reactflow"
import { reverseEdgeDirection } from "../utils/flowUtils"
import EdgeControls from "./EdgeControls"
import "reactflow/dist/style.css"

const MessageNode = ({ data, selected }) => {
  return (
    <div className={`message-node ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Top} style={{ background: "var(--primary)" }} />
      <div className="node-header">
        <span className="node-icon">💬</span>
        <span className="node-title">Message</span>
      </div>
      <div className="node-content">{data.message || "Click to edit message..."}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: "var(--primary)" }} />
    </div>
  )
}

const nodeTypes = {
  messageNode: MessageNode,
}

const suppressResizeObserverError = () => {
  const resizeObserverErrDiv = document.getElementById("webpack-dev-server-client-overlay-div")
  const resizeObserverErr = document.getElementById("webpack-dev-server-client-overlay")
  if (resizeObserverErr) {
    resizeObserverErr.setAttribute("style", "display: none")
  }
  if (resizeObserverErrDiv) {
    resizeObserverErrDiv.setAttribute("style", "display: none")
  }
}

const FlowBuilder = ({ nodes, edges, onNodesChange, onEdgesChange, onNodeSelect }) => {
  const [flowNodes, setFlowNodes, onNodesChangeInternal] = useNodesState(nodes)
  const [flowEdges, setFlowEdges, onEdgesChangeInternal] = useEdgesState(edges)
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [edgeControlsPosition, setEdgeControlsPosition] = useState({ x: 0, y: 0 })

  React.useEffect(() => {
    window.addEventListener("error", (e) => {
      if (e.message === "ResizeObserver loop limit exceeded") {
        const resizeObserverErrDiv = document.getElementById("webpack-dev-server-client-overlay-div")
        const resizeObserverErr = document.getElementById("webpack-dev-server-client-overlay")
        if (resizeObserverErr) {
          resizeObserverErr.setAttribute("style", "display: none")
        }
        if (resizeObserverErrDiv) {
          resizeObserverErrDiv.setAttribute("style", "display: none")
        }
      }
    })

    suppressResizeObserverError()
  }, [])

  React.useEffect(() => {
    if (JSON.stringify(flowNodes) !== JSON.stringify(nodes)) {
      setFlowNodes(nodes)
    }
  }, [nodes])

  React.useEffect(() => {
    if (JSON.stringify(flowEdges) !== JSON.stringify(edges)) {
      setFlowEdges(edges)
    }
  }, [edges])

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "var(--primary-accent)",
        },
        style: {
          strokeWidth: 2,
          stroke: "var(--primary-accent)",
        },
        type: "smoothstep",
        animated: false,
      }
      const newEdges = addEdge(newEdge, flowEdges)
      setFlowEdges(newEdges)
      onEdgesChange(newEdges)
    },
    [flowEdges, setFlowEdges, onEdgesChange],
  )

  const onNodeClick = useCallback(
    (event, node) => {
      onNodeSelect(node.id)
    },
    [onNodeSelect],
  )

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation()
    const flowContainer = document.querySelector(".react-flow")
    const rect = flowContainer.getBoundingClientRect()
    setEdgeControlsPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
    setSelectedEdge(edge)
  }, [])

  const onReverseEdgeDirection = useCallback(
    (edge) => {
      const reversedEdge = reverseEdgeDirection(edge)
      const updatedEdges = flowEdges.map((e) => (e.id === edge.id ? reversedEdge : e))
      setFlowEdges(updatedEdges)
      onEdgesChange(updatedEdges)
      setSelectedEdge(null)
    },
    [flowEdges, setFlowEdges, onEdgesChange],
  )

  const onDeleteEdge = useCallback(
    (edge) => {
      const updatedEdges = flowEdges.filter((e) => e.id !== edge.id)
      setFlowEdges(updatedEdges)
      onEdgesChange(updatedEdges)
      setSelectedEdge(null)
    },
    [flowEdges, setFlowEdges, onEdgesChange],
  )

  const onDeleteNode = useCallback(
    (nodeId) => {
      const updatedNodes = flowNodes.filter((node) => node.id !== nodeId)
      const updatedEdges = flowEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)

      setFlowNodes(updatedNodes)
      setFlowEdges(updatedEdges)
      onNodesChange(updatedNodes)
      onEdgesChange(updatedEdges)
    },
    [flowNodes, flowEdges, setFlowNodes, setFlowEdges, onNodesChange, onEdgesChange],
  )

  const onPaneClick = useCallback(() => {
    setSelectedEdge(null)
  }, [])

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChangeInternal(changes)
      setFlowNodes((currentNodes) => {
        const updatedNodes = currentNodes.slice()
        onNodesChange(updatedNodes)
        return updatedNodes
      })
    },
    [onNodesChangeInternal, onNodesChange],
  )

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChangeInternal(changes)
      setFlowEdges((currentEdges) => {
        const updatedEdges = currentEdges.slice()
        onEdgesChange(updatedEdges)
        return updatedEdges
      })
    },
    [onEdgesChangeInternal, onEdgesChange],
  )

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const reactFlowBounds = event.target.getBoundingClientRect()
      const type = event.dataTransfer.getData("application/reactflow")

      if (typeof type === "undefined" || !type) {
        return
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { message: "New message" },
      }

      const updatedNodes = [...flowNodes, newNode]
      setFlowNodes(updatedNodes)
      onNodesChange(updatedNodes)
    },
    [flowNodes, setFlowNodes, onNodesChange],
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  return (
    <div className="flow-builder">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          style: {
            strokeWidth: 2,
            stroke: "var(--primary-accent)",
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "var(--primary-accent)",
          },
          type: "smoothstep",
        }}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {selectedEdge && (
        <EdgeControls
          edge={selectedEdge}
          onReverseDirection={onReverseEdgeDirection}
          onDeleteEdge={onDeleteEdge}
          position={edgeControlsPosition}
        />
      )}
    </div>
  )
}

export default FlowBuilder
