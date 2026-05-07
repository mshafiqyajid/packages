import { useCallback, useMemo, useState } from "react";

export interface CheckboxTreeNode {
  id: string;
  label: string;
  children?: CheckboxTreeNode[];
}

export interface UseCheckboxTreeReturn {
  checked: Record<string, boolean>;
  indeterminate: Record<string, boolean>;
  toggle: (id: string) => void;
  toggleAll: () => void;
  getCheckboxProps: (id: string) => {
    checked: boolean | "indeterminate";
    onChange: (v: boolean) => void;
  };
}

function collectLeafIds(nodes: CheckboxTreeNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) {
      ids.push(node.id);
    } else {
      ids.push(...collectLeafIds(node.children));
    }
  }
  return ids;
}

function collectChildIds(node: CheckboxTreeNode): string[] {
  if (!node.children || node.children.length === 0) return [node.id];
  return node.children.flatMap(collectChildIds);
}

function buildParentMap(
  nodes: CheckboxTreeNode[],
  parentId?: string,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const node of nodes) {
    if (parentId !== undefined) {
      map[node.id] = parentId;
    }
    if (node.children) {
      Object.assign(map, buildParentMap(node.children, node.id));
    }
  }
  return map;
}

function computeStates(
  nodes: CheckboxTreeNode[],
  checked: Record<string, boolean>,
): { checked: Record<string, boolean>; indeterminate: Record<string, boolean> } {
  const outChecked: Record<string, boolean> = { ...checked };
  const outIndeterminate: Record<string, boolean> = {};

  function process(node: CheckboxTreeNode): { someChecked: boolean; allChecked: boolean } {
    if (!node.children || node.children.length === 0) {
      const isChecked = !!checked[node.id];
      return { someChecked: isChecked, allChecked: isChecked };
    }
    let someChecked = false;
    let allChecked = true;
    for (const child of node.children) {
      const result = process(child);
      if (result.someChecked) someChecked = true;
      if (!result.allChecked) allChecked = false;
    }
    outChecked[node.id] = allChecked;
    outIndeterminate[node.id] = someChecked && !allChecked;
    return { someChecked, allChecked };
  }

  for (const node of nodes) {
    process(node);
  }

  return { checked: outChecked, indeterminate: outIndeterminate };
}

export function useCheckboxTree(nodes: CheckboxTreeNode[]): UseCheckboxTreeReturn {
  const leafIds = useMemo(() => collectLeafIds(nodes), [nodes]);

  const [leafChecked, setLeafChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(leafIds.map((id) => [id, false])),
  );

  const { checked, indeterminate } = useMemo(
    () => computeStates(nodes, leafChecked),
    [nodes, leafChecked],
  );

  const toggle = useCallback(
    (id: string) => {
      setLeafChecked((prev) => {
        const next = { ...prev };
        const nodeFlat = findNode(nodes, id);
        if (!nodeFlat) return prev;
        const childLeaves = collectChildIds(nodeFlat).filter((cid) => cid in prev || cid === id);
        const allLeaves = childLeaves.length > 0 ? childLeaves : [id];
        const currentlyAllChecked = allLeaves.every((lid) => prev[lid]);
        for (const lid of allLeaves) {
          next[lid] = !currentlyAllChecked;
        }
        return next;
      });
    },
    [nodes],
  );

  const toggleAll = useCallback(() => {
    setLeafChecked((prev) => {
      const allChecked = leafIds.every((id) => prev[id]);
      return Object.fromEntries(leafIds.map((id) => [id, !allChecked]));
    });
  }, [leafIds]);

  const getCheckboxProps = useCallback(
    (id: string) => ({
      checked: indeterminate[id] ? ("indeterminate" as const) : !!checked[id],
      onChange: (_v: boolean) => toggle(id),
    }),
    [checked, indeterminate, toggle],
  );

  return { checked, indeterminate, toggle, toggleAll, getCheckboxProps };
}

function findNode(nodes: CheckboxTreeNode[], id: string): CheckboxTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}
