# @mshafiqyajid/react-drawer

Headless drawer hook and styled navigation drawer for React.

**[Full docs →](https://docs.shafiqyajid.com/react/drawer/)**

## Install

```bash
npm install @mshafiqyajid/react-drawer
```

## Quick start

```tsx
import { useState } from "react";
import { DrawerStyled } from "@mshafiqyajid/react-drawer/styled";
import "@mshafiqyajid/react-drawer/styles.css";

const [open, setOpen] = useState(false);

<button onClick={() => setOpen(true)}>Open drawer</button>

<DrawerStyled
  open={open}
  onOpenChange={setOpen}
  title="Navigation"
>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</DrawerStyled>
```

## License

MIT
