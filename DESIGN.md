# Design System Strategy: The Kinetic Layer

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Kinetic Layer."** In a real-time geolocation environment, movement is the only constant. While traditional map-based apps rely on rigid, flat grids, this system treats the interface as a series of intelligent, responsive sheets that float above a living map.

We move beyond the "template" look by utilizing **intentional asymmetry** and **tonal depth**. By overlapping elements and varying corner radii between large container sheets (xl) and internal action cards (lg), we create a bespoke editorial feel. This isn't just a utility; it is a premium concierge experience that guides the user through physical space with digital grace.

---

## 2. Colors & Tonal Architecture
The palette is anchored by a high-energy Primary Orange for action and a Trust Blue for logistical accents. However, the sophistication lies in the neutral execution.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined solely through background color shifts. Use `surface-container-low` for secondary sections and `surface-container-highest` for high-importance overlays.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine materials.
*   **Base Layer:** `surface` (#f9f9f9)
*   **Floating Sheets:** `surface-container-lowest` (#ffffff) to provide maximum "pop" against the map.
*   **Nested Content:** Use `surface-container` or `surface-container-high` to define areas inside a card without adding a border.

### The "Glass & Gradient" Rule
To elevate the experience, use **Glassmorphism** for navigation bars and map-top floating controls. Use a 20% opacity on `surface-container-lowest` combined with a `backdrop-blur(12px)`. 
**Signature Texture:** Primary CTAs should not be flat. Apply a subtle linear gradient from `primary` (#ad2c00) to `primary_container` (#d83900) at a 135° angle to give buttons a "tactile" presence.

---

## 3. Typography: Editorial Utility
We utilize a dual-font strategy to balance character with legibility.

*   **Display & Headlines (Manrope):** High-character, geometric sans-serif. Used for "Arrival Times," "Big Bookings," and "Greetings." It creates an authoritative, editorial tone.
*   **Body & Titles (Inter):** The workhorse. Used for all logistical data, address inputs, and driver details. Its high x-height ensures clarity at high speeds or in low-light environments.

**Hierarchy as Brand:**
*   `display-lg` (3.5rem): Reserved for critical, single-word status updates (e.g., "ARRIVING").
*   `title-md` (1.125rem): Bolded for address labels to ensure immediate recognition.

---

## 4. Elevation & Depth
Traditional drop shadows are too "heavy" for a modern geolocation app. We use **Tonal Layering** and **Ambient Light simulation**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. The natural contrast creates a "soft lift" that is easier on the eyes than a shadow.
*   **Ambient Shadows:** For floating action buttons or map-pinned cards, use a shadow with a 24px blur and 6% opacity. The shadow color should be a tinted version of `on-surface` (#1a1c1c), never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-sunlight scenarios), use `outline-variant` (#e5beb4) at 15% opacity. 100% opaque borders are strictly forbidden.

---

## 5. Components

### Action Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` text, `full` (9999px) roundedness for a friendly, approachable feel.
*   **Secondary:** `secondary_container` fill with `on_secondary_container` text. No border.

### Floating Cards
*   **Rules:** Always use `xl` (1.5rem) roundedness for main map cards.
*   **Separation:** Forbid dividers. Use `8` (2rem) or `10` (2.5rem) vertical spacing to separate the "Pickup" from the "Destination."

### Input Fields
*   **Styling:** Minimalist sheets. Use `surface_container_low` as the field background. On focus, shift the background to `surface_container_highest`. 
*   **Interaction:** Ensure the cursor color is `primary` (#ad2c00) for brand consistency.

### Status Indicators (The "Pulse")
*   Use a soft-glow effect for real-time indicators (e.g., a car location or a searching pulse). Combine the `secondary` (#0058bc) color with a 50% opacity outer glow to signify "active/live" status.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a structural element. Use the `16` (4rem) spacing token to separate the Map View from the Transactional Drawer.
*   **DO** use `secondary_fixed` for background chips when showing "Recent Trips" to provide a soft, branded touch.
*   **DO** ensure all icons are "Rounded" style to match the `xl` corner radius of the containers.

### Don't
*   **DON'T** use 1px dividers to separate list items. Use a 1-pixel color shift between `surface-container-lowest` and `surface-container-low` instead.
*   **DON'T** use high-contrast shadows. If the shadow is clearly visible, it is too dark. It should feel like an "aura," not a "drop."
*   **DON'T** crowd the map. Use the "Kinetic Layer" logic to hide non-essential UI elements when the user is interacting with the map directly.