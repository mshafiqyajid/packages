export type TimelineOrientation = "vertical" | "horizontal";

export interface UseTimelineOptions {
  items: string[];
  orientation?: TimelineOrientation;
}

export interface TimelineItemProps {
  "data-timeline-item": string;
  "data-orientation": TimelineOrientation;
  "data-first": boolean;
  "data-last": boolean;
  "data-index": number;
}

export interface UseTimelineResult {
  getItemProps: (id: string) => TimelineItemProps;
  orientation: TimelineOrientation;
  items: string[];
}

export function useTimeline({
  items,
  orientation = "vertical",
}: UseTimelineOptions): UseTimelineResult {
  function getItemProps(id: string): TimelineItemProps {
    const index = items.indexOf(id);
    return {
      "data-timeline-item": id,
      "data-orientation": orientation,
      "data-first": index === 0,
      "data-last": index === items.length - 1,
      "data-index": index,
    };
  }

  return {
    getItemProps,
    orientation,
    items,
  };
}
