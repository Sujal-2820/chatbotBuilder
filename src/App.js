"use client"

import { useState, useCallback, useEffect } from "react"
import FlowBuilder from "./components/FlowBuilder"
import NodePanel from "./components/NodePanel"
import SettingsPanel from "./components/SettingsPanel"
import ThemeToggle from "./components/ThemeToggle"

function App() {
  const [currentTheme, setCurrentTheme] = useState("light")
  const [flowNodes, setFlowNodes] = useState([])
  const [flowEdges, setFlowEdges] = useState([])
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [saveStatus, setSaveStatus] = useState("")

  useEffect(() => {
    const savedFlow = localStorage.getItem("flowcraft-data")
    if (savedFlow) {
      try {
        const { nodes, edges, theme } = JSON.parse(savedFlow)
        if (nodes) setFlowNodes(nodes)
        if (edges) setFlowEdges(edges)
        if (theme) setCurrentTheme(theme)
      } catch (error) {
        console.error("Failed to load saved flow:", error)
      }
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setCurrentTheme((prev) => (prev === "light" ? "dark" : "light"))
  }, [])

  const handleNodesChange = useCallback((newNodes) => {
    setFlowNodes(newNodes)
  }, [])

  const handleEdgesChange = useCallback((newEdges) => {
    setFlowEdges(newEdges)
  }, [])

  const handleNodeSelect = useCallback((nodeId) => {
    setSelectedNodeId(nodeId)
  }, [])

  const handleNodeUpdate = useCallback((nodeId, newData) => {
    setFlowNodes((nodes) => {
      const updatedNodes = nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node,
      )
      return updatedNodes
    })
    setSelectedNodeId(null)
  }, [])

  const handleNodeDelete = useCallback((nodeId) => {
    setFlowNodes((nodes) => nodes.filter((node) => node.id !== nodeId))
    setFlowEdges((edges) => edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    setSelectedNodeId(null)
  }, [])

  const handleSaveFlow = useCallback(() => {
    const nodeIds = flowNodes.map((node) => node.id)
    const targetNodes = flowEdges.map((edge) => edge.target)
    const rootNodes = nodeIds.filter((id) => !targetNodes.includes(id))

    if (rootNodes.length === 0) {
      setSaveStatus("Error: No starting point found. At least one node must have no incoming connections.")
      setTimeout(() => setSaveStatus(""), 3000)
      return
    }

    if (rootNodes.length > 1) {
      setSaveStatus("Error: Multiple starting points found. Only one node should have no incoming connections.")
      setTimeout(() => setSaveStatus(""), 3000)
      return
    }

    try {
      const flowData = {
        nodes: flowNodes,
        edges: flowEdges,
        theme: currentTheme,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem("flowcraft-data", JSON.stringify(flowData))
      setSaveStatus("Flow saved successfully.")
    } catch (error) {
      setSaveStatus("Error: Failed to save.")
      console.error("Save error:", error)
    }

    setTimeout(() => setSaveStatus(""), 3000)
  }, [flowNodes, flowEdges, currentTheme])

  const selectedNode = flowNodes.find((node) => node.id === selectedNodeId)

  return (
    <div className={`app-container ${currentTheme === "dark" ? "dark-theme" : ""}`}>
      <header className="app-header">
        <div className="logo-section">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">FlowCraft</span>
          </div>
          <span className="tagline">Visual Chatbot Flow Builder by Sujal Soni</span>
        </div>
        <div className="header-controls">
          <button className="save-button" onClick={handleSaveFlow}>
            Save Changes
          </button>
          <ThemeToggle currentTheme={currentTheme} onToggle={toggleTheme} />
        </div>
      </header>

      {saveStatus && (
        <div className={`status-message ${saveStatus.includes("Error") ? "error" : "success"}`}>{saveStatus}</div>
      )}

      <div className="main-content">
        <NodePanel />

        <div className="flow-container">
          <FlowBuilder
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeSelect={handleNodeSelect}
          />
        </div>

        {selectedNode && (
          <SettingsPanel
            node={selectedNode}
            nodes={flowNodes}
            edges={flowEdges}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  )
}

export default App
