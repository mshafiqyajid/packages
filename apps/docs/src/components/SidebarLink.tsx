import { HoverCardStyled } from "@mshafiqyajid/react-hover-card/styled";
import "@mshafiqyajid/react-hover-card/styles.css";

interface Props {
  slug: string;
  label: string;
  icon: string;
  description: string;
  version: string;
  isNew: boolean;
  isActive: boolean;
}

export default function SidebarLink({
  slug,
  label,
  icon,
  description,
  version,
  isNew,
  isActive,
}: Props) {
  return (
    <HoverCardStyled
      placement="right"
      openDelay={0}
      closeDelay={100}
      offset={12}
      content={
        <div className="sidebar-card">
          <div className="sidebar-card__name">{label}</div>
          <div className="sidebar-card__desc">{description}</div>
        </div>
      }
    >
      <a
        href={`/react/${slug}/`}
        className={`sidebar__link${isActive ? " sidebar__link--active" : ""}`}
      >
        <span className="sidebar__icon" aria-hidden="true">{icon}</span>
        <span className="sidebar__name">{label}</span>
        {isNew && <span className="sidebar__new" aria-label="New">new</span>}
        <span className="sidebar__version">{version}</span>
      </a>
    </HoverCardStyled>
  );
}
