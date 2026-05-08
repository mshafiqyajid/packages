---
"@mshafiqyajid/react-avatar-group": patch
---

Fix gap prop having no effect. CSS variable --ravg-gap was defined at :root where the inline --ravg-gap-override was not visible. Now --ravg-gap-override defaults at :root and children consume it directly so the component's inline style correctly overrides the gap.
