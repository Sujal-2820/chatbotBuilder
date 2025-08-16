export const findRootNodes = (nodes, edges) => {
  const targetNodes = edges.map((edge) => edge.target)
  return nodes.filter((node) => !targetNodes.includes(node.id))
}

export const findLeafNodes = (nodes, edges) => {
  const sourceNodes = edges.map((edge) => edge.source)
  return nodes.filter((node) => !sourceNodes.includes(node.id))
}

export const getConnectedNodes = (nodeId, edges, direction = "outgoing") => {
  if (direction === "outgoing") {
    return edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target)
  } else {
    return edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source)
  }
}

export const validateFlow = (nodes, edges) => {
  const rootNodes = findRootNodes(nodes, edges)
  const errors = []

  if (rootNodes.length === 0 && nodes.length > 0) {
    errors.push("No root node found. At least one node should have no incoming connections.")
  } else if (rootNodes.length > 1) {
    errors.push("Multiple root nodes found. Only one node should have no incoming connections.")
  }

  return { isValid: errors.length === 0, errors }
}

export const reverseEdgeDirection = (edge) => {
  return {
    ...edge,
    source: edge.target,
    target: edge.source,
    sourceHandle: edge.targetHandle,
    targetHandle: edge.sourceHandle,
  }
}
